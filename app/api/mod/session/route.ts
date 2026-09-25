import { NextRequest, NextResponse } from "next/server";
import { isModerator, MOD_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/mod/session - Check if current user has active Moderator session
export async function GET(req: NextRequest) {
  const modActive = isModerator(req);
  return NextResponse.json({
    success: true,
    isModerator: modActive,
  });
}

// DELETE /api/mod/session - Logout from Moderator mode
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Moderator session closed",
  });

  response.cookies.delete(MOD_COOKIE_NAME);
  return response;
}
