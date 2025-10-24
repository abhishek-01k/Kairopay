/**
 * Standard error codes used across the API
 */

export const ERROR_CODES = {
  // Client errors (400s)
  INVALID_REQUEST: { code: "INVALID_REQUEST", status: 400 },
  UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 },
  FORBIDDEN: { code: "FORBIDDEN", status: 403 },
  NOT_FOUND: { code: "NOT_FOUND", status: 404 },
  CONFLICT: { code: "CONFLICT", status: 409 },

  // Specific business errors
  MERCHANT_EXISTS: { code: "MERCHANT_EXISTS", status: 409 },
  MERCHANT_NOT_FOUND: { code: "MERCHANT_NOT_FOUND", status: 404 },
  APP_NOT_FOUND: { code: "APP_NOT_FOUND", status: 404 },
  ORDER_NOT_FOUND: { code: "ORDER_NOT_FOUND", status: 404 },
  ORDER_EXPIRED: { code: "ORDER_EXPIRED", status: 400 },
  TRANSACTION_EXISTS: { code: "TRANSACTION_EXISTS", status: 409 },
  TRANSACTION_NOT_FOUND: { code: "TRANSACTION_NOT_FOUND", status: 404 },

  // Server errors (500s)
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500 },
  DATABASE_ERROR: { code: "DATABASE_ERROR", status: 500 },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

