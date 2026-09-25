import { NextRequest, NextResponse } from "next/server";
import { MOD_KEY, MOD_COOKIE_NAME, createModToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/mod/verify - Verify Master Moderator key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Moderator key is required" },
        { status: 400 }
      );
    }

    if (key.trim() !== MOD_KEY) {
      return NextResponse.json(
        { success: false, error: "Incorrect moderator key" },
        { status: 401 }
      );
    }

    // Generate Moderator token
    const token = createModToken();

    const response = NextResponse.json({
      success: true,
      message: "Moderator authentication successful",
    });

    // Set secure HTTP-only cookie valid for 24 hours
    response.cookies.set({
      name: MOD_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in mod verify:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
