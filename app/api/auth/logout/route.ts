import { NextResponse } from "next/server";
import { CREATOR_COOKIE_NAME } from "@/lib/creator-auth";

export const dynamic = "force-dynamic";

// POST or DELETE /api/auth/logout - Sign out creator
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(CREATOR_COOKIE_NAME);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(CREATOR_COOKIE_NAME);
  return response;
}
