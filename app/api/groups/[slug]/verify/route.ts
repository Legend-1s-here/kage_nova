import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import {
  verifyKey,
  createGroupToken,
  getGroupCookieName,
} from "@/lib/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";
import { getClientIp } from "@/lib/validation";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Group slug is required" },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);

    // 1. Check rate limit
    const rateCheck = checkRateLimit(ip, slug);
    if (rateCheck.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
          isRateLimited: true,
          resetInSeconds: rateCheck.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const key = body.key;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Access key password is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Find group by slug
    const group = await Group.findOne({ slug });
    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // 4. Verify password against bcrypt keyHash
    const isMatch = await verifyKey(key.trim(), group.keyHash);

    if (!isMatch) {
      const updatedLimit = recordFailedAttempt(ip, slug);
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect group access key",
          remainingAttempts: updatedLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 5. Successful match: reset rate limit & issue scoped JWT cookie
    resetRateLimit(ip, slug);
    const token = createGroupToken(slug);
    const cookieName = getGroupCookieName(slug);

    const response = NextResponse.json({
      success: true,
      message: "Group key verified successfully",
      group: {
        name: group.name,
        slug: group.slug,
        isPublic: group.isPublic,
      },
    });

    // Set HTTP-only secure cookie for 12 hours
    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error("Error verifying group key:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during verification" },
      { status: 500 }
    );
  }
}
