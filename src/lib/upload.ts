/**
 * File upload validation utilities.
 * Validates file type, size, and sanitizes filenames before upload.
 */

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file against type and size constraints.
 */
export function validateFile(
  file: { type: string; size: number; name: string },
  options?: {
    allowedTypes?: string[];
    maxSize?: number;
  }
): ValidationResult {
  const allowedTypes = options?.allowedTypes ?? ALLOWED_MEDIA_TYPES;
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Accepted: ${allowedTypes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    const mb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File too large. Maximum size is ${mb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a filename: removes path separators, replaces non-alphanumeric
 * chars (except dots and hyphens), lowercases, and truncates.
 */
export function sanitizeFilename(filename: string): string {
  let name = filename.replace(/[/\\:*?"<>|]/g, "_");
  name = name.replace(/\s+/g, "_");
  name = name.replace(/[^a-zA-Z0-9._-]/g, "");
  name = name.toLowerCase();
  const maxLength = 100;
  if (name.length > maxLength) {
    const ext = name.lastIndexOf(".");
    if (ext > 0 && ext < maxLength - 10) {
      name = name.slice(0, maxLength - (name.length - ext)) + name.slice(ext);
    } else {
      name = name.slice(0, maxLength);
    }
  }
  return name || "untitled";
}

/**
 * Generates a unique, sanitized filename for storage.
 */
export function generateStorageFilename(originalName: string): string {
  const ext = originalName.lastIndexOf(".");
  const extension = ext > 0 ? originalName.slice(ext).toLowerCase() : "";
  const base = sanitizeFilename(originalName.slice(0, ext > 0 ? ext : originalName.length));
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `${base}-${uniqueId}${extension}`;
}
