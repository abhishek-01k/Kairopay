// ============================================================================
// API Request/Response Types
// ============================================================================
export * from "./api";

// ============================================================================
// Database Model Types (from Mongoose schemas)
// ============================================================================
export type { IMerchant, IApp, IOrder, ITransaction } from "../lib/db/models";

// ============================================================================
// Constants & Enums
// ============================================================================
export {
  ORDER_STATUS,
  TRANSACTION_STATUS,
  COMMON_CHAINS,
  COMMON_ASSETS,
  COMMON_CHAIN_IDS,
} from "../lib/constants";

export type {
  OrderStatus,
  TransactionStatus,
  Chain,
  Asset,
} from "../lib/constants";

// ============================================================================
// Webhook Types
// ============================================================================
export interface WebhookEvent {
  event: WebhookEventType;
  order_id: string;
  tx_hash?: string;
  chain?: string;
  asset?: string;
  amount?: number;
  merchant_id: string;
  app_id: string;
  timestamp: string;
  signature: string;
}

export type WebhookEventType =
  | "order.created"
  | "order.pending"
  | "order.payment.completed"
  | "order.payment.verified"
  | "order.complete"
  | "order.payment.denied";

// ============================================================================
// Authentication Types
// ============================================================================
export interface AuthContext {
  merchant_id: string;
  app_id: string;
  privy_did: string;
}

// ============================================================================
// Error Codes
// ============================================================================
export const ERROR_CODES = {
  // Client errors (4xx)
  INVALID_REQUEST: "INVALID_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  MERCHANT_NOT_FOUND: "MERCHANT_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  ORDER_EXPIRED: "ORDER_EXPIRED",
  MERCHANT_EXISTS: "MERCHANT_EXISTS",
  TRANSACTION_EXISTS: "TRANSACTION_EXISTS",
  NO_CONFIRMED_TRANSACTION: "NO_CONFIRMED_TRANSACTION",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_CONNECTION_FAILED: "DATABASE_CONNECTION_FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the data type from ApiResponse
 */
export type ExtractData<T> = T extends { success: true; data: infer D }
  ? D
  : never;

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
