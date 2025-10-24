/**
 * API Request Types
 * Centralized type definitions for all API request bodies
 */

// ==================== Merchant APIs ====================

export interface RegisterMerchantRequest {
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
}

export interface CreateAppRequest {
  privy_did: string;
  name: string;
  webhook_url?: string;
}

// ==================== Order APIs ====================

export interface CreateOrderRequest {
  amount_usd: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  webhook_url?: string;
  order_id?: string;
}

export interface SubmitTransactionRequest {
  tx_hash: string;
  chain: string;
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface PrepareTransactionRequest {
  chain: string;
  asset: string;
  customer_wallet: string;
}

// ==================== Query Parameters ====================

export interface OrderQueryParams {
  status?: string;
  limit?: string;
  offset?: string;
}

export interface TransactionQueryParams {
  status?: string;
  chain?: string;
  asset?: string;
  limit?: string;
  offset?: string;
}

// ==================== Route Parameters ====================

export interface AppRouteParams {
  app_id: string;
}

export interface OrderRouteParams extends AppRouteParams {
  order_id: string;
}

export interface PrivyDidRouteParams {
  privy_did: string;
}

export interface WalletRouteParams {
  wallet_address: string;
}

