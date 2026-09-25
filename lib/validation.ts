import { NextRequest } from "next/server";

export const MAX_CODE_BYTES = 204800; // 200 KB
export const MAX_TITLE_LENGTH = 120;
export const MAX_GROUP_NAME_LENGTH = 80;
export const MIN_KEY_LENGTH = 6;

/**
 * Generate a clean, URL-friendly slug from a group name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-")  // Replace spaces and underscores with a hyphen
    .replace(/^-+|-+$/g, ""); // Strip leading and trailing hyphens
}

/**
 * Validate group creation parameters.
 */
export function validateGroupCreation(
  name: unknown,
  key: unknown,
  isPublic: unknown
): { valid: boolean; error?: string; cleanName: string; cleanKey: string; isPublicBool: boolean } {
  if (typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "Group name is required", cleanName: "", cleanKey: "", isPublicBool: true };
  }

  const cleanName = name.trim();
  if (cleanName.length < 2 || cleanName.length > MAX_GROUP_NAME_LENGTH) {
    return {
      valid: false,
      error: `Group name must be between 2 and ${MAX_GROUP_NAME_LENGTH} characters`,
      cleanName,
      cleanKey: "",
      isPublicBool: true,
    };
  }

  if (typeof key !== "string" || !key) {
    return { valid: false, error: "Access key password is required", cleanName, cleanKey: "", isPublicBool: true };
  }

  const cleanKey = key.trim();
  if (cleanKey.length < MIN_KEY_LENGTH) {
    return {
      valid: false,
      error: `Access key password must be at least ${MIN_KEY_LENGTH} characters long`,
      cleanName,
      cleanKey,
      isPublicBool: true,
    };
  }

  const isPublicBool = typeof isPublic === "boolean" ? isPublic : true;

  return { valid: true, cleanName, cleanKey, isPublicBool };
}

/**
 * Validate lab code snippet upload payload.
 */
export function validateLabCodeUpload(
  title: unknown,
  language: unknown,
  code: unknown,
  uploaderName?: unknown,
  description?: unknown
): {
  valid: boolean;
  error?: string;
  data?: {
    title: string;
    language: string;
    code: string;
    uploaderName: string;
    description: string;
  };
} {
  if (typeof title !== "string" || !title.trim()) {
    return { valid: false, error: "Snippet title is required" };
  }
  const cleanTitle = title.trim();
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title cannot exceed ${MAX_TITLE_LENGTH} characters` };
  }

  if (typeof language !== "string" || !language.trim()) {
    return { valid: false, error: "Programming language is required" };
  }
  const cleanLanguage = language.trim().toLowerCase();

  if (typeof code !== "string" || !code.trim()) {
    return { valid: false, error: "Code content cannot be empty" };
  }

  // Calculate size in UTF-8 bytes
  const codeByteLength = Buffer.byteLength(code, "utf8");
  if (codeByteLength > MAX_CODE_BYTES) {
    return {
      valid: false,
      error: `Code size exceeds the 200KB limit (current size: ${(codeByteLength / 1024).toFixed(1)}KB)`,
    };
  }

  const cleanUploader =
    typeof uploaderName === "string" && uploaderName.trim()
      ? uploaderName.trim().slice(0, 50)
      : "Anonymous";

  const cleanDescription =
    typeof description === "string" && description.trim()
      ? description.trim().slice(0, 1000)
      : "";

  return {
    valid: true,
    data: {
      title: cleanTitle,
      language: cleanLanguage,
      code,
      uploaderName: cleanUploader,
      description: cleanDescription,
    },
  };
}

/**
 * Extract client IP address safely from request headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
