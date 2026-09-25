import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "kagenova-default-dev-secret-change-in-production";

export interface GroupTokenPayload {
  slug: string;
  role: "editor";
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
    return decoded && decoded.slug === slug.toLowerCase() && decoded.role === "editor";
  } catch {
    return false;
  }
}

/**
 * Checks if the incoming request has a valid session cookie for the given group.
 */
export function hasValidGroupSession(
  req: NextRequest,
  slug: string
): boolean {
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
    const cookieName = getGroupCookieName(slug);
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return false;
    return verifyGroupToken(token, slug);
  } catch {
    return false;
  }
}
