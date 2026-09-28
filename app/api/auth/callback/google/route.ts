import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import {
  getAppBaseUrl,
  exchangeGoogleCode,
  createCreatorToken,
  CREATOR_COOKIE_NAME,
} from "@/lib/creator-auth";

export const dynamic = "force-dynamic";

// GET /api/auth/callback/google - OAuth redirect handler
export async function GET(req: NextRequest) {
  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "/create-group";
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam || !code) {
    console.error("Google OAuth error parameter:", errorParam);
    return NextResponse.redirect(`${baseUrl}/create-group?authError=cancelled`);
  }

  try {
    // Exchange authorization code for Google profile
    const googleUser = await exchangeGoogleCode(code, redirectUri);

    await connectToDatabase();

    // Find or create User in MongoDB
    let user = await User.findOne({
      $or: [{ googleId: googleUser.id }, { email: googleUser.email }],
    });

    if (user) {
      if (user.isBanned) {
        return NextResponse.redirect(`${baseUrl}/create-group?authError=banned`);
      }
      // Update Google info
      user.googleId = googleUser.id;
      user.name = googleUser.name || user.name;
      user.avatar = googleUser.picture || user.avatar;
      await user.save();
    } else {
      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        isBanned: false,
      });
    }

    // Issue signed creator JWT session
    const token = createCreatorToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    // Safe redirect URL
    const targetUrl = state.startsWith("/") ? `${baseUrl}${state}` : `${baseUrl}/create-group`;
    const response = NextResponse.redirect(targetUrl);

    // Set secure HTTP-only cookie valid for 7 days
    response.cookies.set({
      name: CREATOR_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(`${baseUrl}/create-group?authError=failed`);
  }
}
