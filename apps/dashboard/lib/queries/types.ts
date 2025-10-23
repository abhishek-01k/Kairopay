/**
 * Shared API Types
 * These should match the types from apps/kairopay/types/api.ts
 */

// Merchant API Types
export interface RegisterMerchantRequest {
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
}

export interface RegisterMerchantResponse {
  merchant_id: string;
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
  created_at: Date;
}

export interface CreateAppRequest {
  privy_did: string;
  name: string;
  webhook_url?: string;
}

export interface CreateAppResponse {
  app_id: string;
  api_key: string;
  name: string;
  created_at: string;
}

export interface MerchantApp {
  app_id: string;
  name: string;
  webhook_url?: string;
  created_at: Date;
}

export interface GetMerchantResponse {
  merchant_id: string;
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
  apps: MerchantApp[];
  created_at: Date;
}

export interface GetBalancesResponse {
  wallets: {
    evm?: string;
    sol?: string;
  };
  balances: Record<string, string>;
  updated_at: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  database?: string;
}

// Order API Types (prepared for future use)
export interface CreateOrderRequest {
  app_id: string;
  order_id?: string; // Optional merchant order ID
  amount_usd: number;
  currency: string;
  metadata?: Record<string, any>;
  webhook_url?: string; // Optional override
}

export interface CreateOrderResponse {
  order_id: string;
  checkout_url: string;
  expires_at: string;
}

export interface SubmitTransactionRequest {
  tx_hash: string;
  chain: string;
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface Transaction {
  tx_hash: string;
  chain: string;
  asset: string;
  amount: number;
  status: string;
}

export interface GetOrderResponse {
  order_id: string;
  merchant_id: string;
  app_id: string;
  amount_usd: number;
  status: string;
  transactions: Transaction[];
  created_at: string;
}

