/**
 * Validation utilities for request data
 */

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate that required fields are present and non-empty
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): ValidationResult {
  for (const field of fields) {
    if (!data[field]) {
      return {
        success: false,
        error: `${String(field)} is required`,
      };
    }
  }
  return { success: true };
}

/**
 * Validate that a number is positive
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (typeof value !== "number" || value <= 0) {
    return {
      success: false,
      error: `${fieldName} must be a positive number`,
    };
  }
  return { success: true };
}

/**
 * Validate that a string matches a pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string
): ValidationResult {
  if (!pattern.test(value)) {
    return {
      success: false,
      error: `${fieldName} format is invalid`,
    };
  }
  return { success: true };
}

/**
 * Validate query parameters for pagination
 */
export function validatePaginationParams(searchParams: URLSearchParams): {
  limit: number;
  offset: number;
} {
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "50")),
    100
  );
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

  return { limit, offset };
}

/**
 * Validate Ethereum address format
 */
export function validateEthAddress(address: string): ValidationResult {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return validatePattern(address, ethAddressRegex, "Ethereum address");
}

/**
 * Validate Solana address format
 */
export function validateSolAddress(address: string): ValidationResult {
  // Solana addresses are base58 encoded, typically 32-44 characters
  const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return validatePattern(address, solAddressRegex, "Solana address");
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string): ValidationResult {
  try {
    new URL(url);
    return { success: true };
  } catch {
    return {
      success: false,
      error: `${fieldName} must be a valid URL`,
    };
  }
}

/**
 * Sanitize and validate metadata object
 */
export function validateMetadata(
  metadata: unknown
): ValidationResult<Record<string, unknown>> {
  if (metadata === null || metadata === undefined) {
    return { success: true, data: {} };
  }

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    return {
      success: false,
      error: "metadata must be an object",
    };
  }

  return { success: true, data: metadata as Record<string, unknown> };
}

