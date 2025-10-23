/**
 * Client-side types for frontend applications
 * Use these types in your React/Next.js components
 */

import type {
  ApiResponse,
  RegisterMerchantRequest,
  RegisterMerchantResponse,
  CreateAppRequest,
  CreateAppResponse,
  GetMerchantResponse,
  GetBalancesResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  GetOrderResponse,
  CompleteOrderResponse,
} from "./api";

/**
 * KairoPay API Client configuration
 */
export interface KairoPayConfig {
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Type-safe API client methods
 */
export interface KairoPayClient {
  // Merchant methods
  merchant: {
    register(
      data: RegisterMerchantRequest
    ): Promise<ApiResponse<RegisterMerchantResponse>>;
    createApp(data: CreateAppRequest): Promise<ApiResponse<CreateAppResponse>>;
    get(privyDid: string): Promise<ApiResponse<GetMerchantResponse>>;
    getBalances(privyDid: string): Promise<ApiResponse<GetBalancesResponse>>;
  };

  // Order methods
  orders: {
    create(data: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>>;
    get(orderId: string): Promise<ApiResponse<GetOrderResponse>>;
    submitTransaction(
      orderId: string,
      data: SubmitTransactionRequest
    ): Promise<ApiResponse<SubmitTransactionResponse>>;
    complete(orderId: string): Promise<ApiResponse<CompleteOrderResponse>>;
  };
}

/**
 * Order status display helpers
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  created: "Created",
  pending: "Payment Pending",
  completed: "Payment Completed",
  verified: "Verified",
  failed: "Failed",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  created: "gray",
  pending: "yellow",
  completed: "blue",
  verified: "green",
  failed: "red",
};

/**
 * Transaction status display helpers
 */
export const TX_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
};

export const TX_STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "green",
  failed: "red",
};

/**
 * Error messages for common error codes
 */
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_REQUEST: "Invalid request. Please check your input.",
  UNAUTHORIZED: "Unauthorized. Please check your API key.",
  MERCHANT_NOT_FOUND: "Merchant not found.",
  ORDER_NOT_FOUND: "Order not found.",
  ORDER_EXPIRED: "Order has expired.",
  MERCHANT_EXISTS: "Merchant already exists.",
  TRANSACTION_EXISTS: "Transaction already recorded.",
  NO_CONFIRMED_TRANSACTION: "No confirmed transaction found.",
  INTERNAL_ERROR: "An internal error occurred. Please try again.",
  DATABASE_CONNECTION_FAILED: "Database connection failed.",
};

/**
 * Common chain display names
 */
export const CHAIN_NAMES: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  base: "Base",
  optimism: "Optimism",
  arbitrum: "Arbitrum",
  solana: "Solana",
};

/**
 * Common asset display names
 */
export const ASSET_NAMES: Record<string, string> = {
  USDC: "USD Coin",
  USDT: "Tether",
  PYUSD: "PayPal USD",
  DAI: "Dai",
  ETH: "Ethereum",
  MATIC: "Polygon",
  SOL: "Solana",
  WETH: "Wrapped Ethereum",
};
