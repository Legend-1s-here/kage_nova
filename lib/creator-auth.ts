import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "kagenova-default-dev-secret-change-in-production";
export const CREATOR_COOKIE_NAME = "kg_creator_sess";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export interface CreatorSessionPayload {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: "creator";
  iat?: number;
  exp?: number;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

/**
 * Returns the dynamic base URL of the application.
 */
export function getAppBaseUrl(req?: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    if (host) return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/**
 * Builds the Google OAuth2 authorization consent URL.
 */
export function getGoogleAuthUrl(redirectUri: string, state: string = "/create-group"): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges Google authorization code for access token and user profile.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleUserProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("Google token error:", tokenData);
    throw new Error(tokenData.error_description || "Failed to exchange Google OAuth code");
  }

  // Fetch Google User Profile
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userRes.json();
  if (!userRes.ok || !userData.email) {
    throw new Error("Failed to fetch Google user profile");
  }

  return {
    id: userData.id,
    email: userData.email.toLowerCase(),
    name: userData.name || userData.email.split("@")[0],
    picture: userData.picture || "",
    verified_email: userData.verified_email,
  };
}

/**
 * Creates a signed JWT session cookie for an authenticated creator.
 * Valid for 7 days.
 */
export function createCreatorToken(user: {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}): string {
  const payload: CreatorSessionPayload = {
    userId: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    avatar: user.avatar,
    role: "creator",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a Creator JWT token.
 */
export function verifyCreatorToken(token: string): CreatorSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CreatorSessionPayload;
    if (decoded && decoded.role === "creator" && decoded.email) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the creator session from an incoming NextRequest.
 */
export function getCreatorSession(req: NextRequest): CreatorSessionPayload | null {
  const token = req.cookies.get(CREATOR_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCreatorToken(token);
}

/**
 * Server Component / Action helper to get creator session.
 */
export async function getServerCreatorSession(): Promise<CreatorSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(CREATOR_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyCreatorToken(token);
  } catch {
    return null;
  }
}
