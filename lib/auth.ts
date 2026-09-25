import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "kagenova-default-dev-secret-change-in-production";
export const MOD_KEY = process.env.MOD_KEY || "Priyansh63";
export const MOD_COOKIE_NAME = "kg_mod_sess";

export interface GroupTokenPayload {
  slug: string;
  role: "editor" | "moderator";
  iat?: number;
  exp?: number;
}

export interface ModTokenPayload {
  role: "moderator";
  iat?: number;
  exp?: number;
}

/**
 * Hash a group key password using bcrypt with salt rounds 10.
 */
export async function hashKey(key: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(key, salt);
}

/**
 * Compare an incoming plaintext key against the stored bcrypt hash.
 */
export async function verifyKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

/**
 * Generates the scoped cookie name for a group session.
 */
export function getGroupCookieName(slug: string): string {
  // Normalize slug to prevent invalid cookie header characters
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");
  return `kg_sess_${cleanSlug}`;
}

/**
 * Issue a signed JWT scoped strictly to the given group slug.
 * Expires in 12 hours.
 */
export function createGroupToken(slug: string): string {
  const payload: GroupTokenPayload = {
    slug: slug.toLowerCase(),
    role: "editor",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

/**
 * Verify a JWT string against a group slug.
 * Returns true if valid and scoped to the exact slug.
 */
export function verifyGroupToken(token: string, slug: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as GroupTokenPayload;
    if (!decoded) return false;
    if (decoded.role === "moderator") return true;
    return decoded.slug === slug.toLowerCase() && decoded.role === "editor";
  } catch {
    return false;
  }
}

/**
 * Issue a signed master moderator JWT token.
 * Expires in 24 hours.
 */
export function createModToken(): string {
  const payload: ModTokenPayload = {
    role: "moderator",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verify a moderator JWT token.
 */
export function verifyModToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ModTokenPayload;
    return decoded && decoded.role === "moderator";
  } catch {
    return false;
  }
}

/**
 * Checks if the request is from an authenticated Master Moderator.
 */
export function isModerator(req: NextRequest): boolean {
  // 1. Check x-mod-key header
  const headerKey = req.headers.get("x-mod-key");
  if (headerKey && headerKey === MOD_KEY) {
    return true;
  }

  // 2. Check mod cookie
  const modCookie = req.cookies.get(MOD_COOKIE_NAME)?.value;
  if (modCookie && verifyModToken(modCookie)) {
    return true;
  }

  return false;
}

/**
 * Checks if the incoming request has a valid session cookie for the given group OR is a Moderator.
 */
export function hasValidGroupSession(
  req: NextRequest,
  slug: string
): boolean {
  // Master Moderator bypass
  if (isModerator(req)) return true;

  const cookieName = getGroupCookieName(slug);
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return false;
  return verifyGroupToken(token, slug);
}

/**
 * Server Component / Action helper to verify session from Next.js headers cookies.
 */
export async function checkServerGroupSession(slug: string): Promise<boolean> {
  try {
    const cookieStore = cookies();

    // Check Moderator cookie
    const modToken = cookieStore.get(MOD_COOKIE_NAME)?.value;
    if (modToken && verifyModToken(modToken)) {
      return true;
    }

    const cookieName = getGroupCookieName(slug);
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return false;
    return verifyGroupToken(token, slug);
  } catch {
    return false;
  }
}
