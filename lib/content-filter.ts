/**
 * Content moderation & profanity filter for KAGENOVA.
 * Ensures group names, slugs, and titles remain respectful and safe for student communities.
 */

// Common offensive words, slurs, hate speech, explicit terms (English & Hindi) with leetspeak resistance
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(f+[u*@#a!ie_.-]*c+k+|f+u+k+|f+c+k+|motherfucker|mf)\b/i,
  /\b(s+h+[i!1*@_.-]+t+|bullshit|shitty)\b/i,
  /\b(b+[i!1*@_.-]+t+c+h+|bitch|bitches)\b/i,
  /\b(asshole|arsehole|bastard)\b/i,
  /\b(dick|pussy|vagina|penis|cock|tits|boobs|boobies|slut|whore)\b/i,
  /\b(n+[i!1*@_.-]*g+g+[a-z]*|faggot|fag|retard)\b/i,
  /\b(porn|pornhub|xxx|nsfw|hentai|erotic)\b/i,
  /\b(chutiya|bhosdike|bhosdika|madarchod|behenchod|mc|bc|gaand|lodu|lauda|randi|harami|kamina)\b/i,
  /\b(kill yourself|kys|suicide)\b/i,
  /\b(hitler|nazi)\b/i,
];

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
}

/**
 * Checks text against offensive patterns.
 * Returns { isClean: true } if safe, or { isClean: false, reason: "..." } if blocked.
 */
export function checkInappropriateContent(text: string): ModerationResult {
  if (!text || typeof text !== "string") {
    return { isClean: true };
  }

  // Normalize text (lowercase, normalize common leetspeak substitutions)
  const normalized = text
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[$]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[_.-]/g, " ");

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text) || pattern.test(normalized)) {
      return {
        isClean: false,
        reason: "Inappropriate or offensive language detected. Please use a respectful group name.",
      };
    }
  }

  return { isClean: true };
}
