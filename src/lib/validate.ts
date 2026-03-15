const MAX_TEXT_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 320;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized: { text: string; email: string | null };
}

export function validateSubmission(text: unknown, email: unknown): ValidationResult {
  // Text validation
  if (!text || typeof text !== "string") {
    return { valid: false, error: "Text is required", sanitized: { text: "", email: null } };
  }

  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return { valid: false, error: "Text cannot be empty", sanitized: { text: "", email: null } };
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text must be ${MAX_TEXT_LENGTH} characters or less (got ${trimmedText.length})`,
      sanitized: { text: "", email: null },
    };
  }

  // Strip HTML tags (defense in depth — React escapes anyway but API responses might be used elsewhere)
  const sanitizedText = trimmedText.replace(/<[^>]*>/g, "");

  // Email validation (optional field)
  let sanitizedEmail: string | null = null;

  if (email && typeof email === "string" && email.trim().length > 0) {
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
      return {
        valid: false,
        error: `Email must be ${MAX_EMAIL_LENGTH} characters or less`,
        sanitized: { text: sanitizedText, email: null },
      };
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        valid: false,
        error: "Invalid email format",
        sanitized: { text: sanitizedText, email: null },
      };
    }

    sanitizedEmail = trimmedEmail;
  }

  return { valid: true, sanitized: { text: sanitizedText, email: sanitizedEmail } };
}
