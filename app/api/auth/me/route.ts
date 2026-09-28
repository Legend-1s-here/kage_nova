import { NextRequest, NextResponse } from "next/server";
import { getCreatorSession } from "@/lib/creator-auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me - Check current creator session
export async function GET(req: NextRequest) {
  const session = getCreatorSession(req);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      avatar: session.avatar,
    },
  });
}
