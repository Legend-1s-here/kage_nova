import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, getGoogleAuthUrl } from "@/lib/creator-auth";

export const dynamic = "force-dynamic";

// GET /api/auth/google - Initiate Google OAuth
export async function GET(req: NextRequest) {
  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const state = req.nextUrl.searchParams.get("redirect") || "/create-group";

  const googleUrl = getGoogleAuthUrl(redirectUri, state);
  return NextResponse.redirect(googleUrl);
}
