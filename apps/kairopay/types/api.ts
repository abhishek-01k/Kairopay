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

// Standard API Response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Order API Types
export interface CreateOrderRequest {
  amount_usd: number;
  currency?: string;
  order_id?: string;
  metadata?: Record<string, unknown>;
  webhook_url?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  checkout_url: string;
  expires_at: Date;
}

export interface SubmitTransactionRequest {
  tx_hash: string;
  chain: string;
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface SubmitTransactionResponse {
  status: string;
  message: string;
  tx_hash: string;
  order_id: string;
}

export interface TransactionDetails {
  tx_hash: string;
  chain: string;
  asset: string;
  amount: number;
  usd_value: number;
  from: string;
  to: string;
  status: string;
  confirmed_at?: Date;
  created_at: Date;
}

export interface GetOrderResponse {
  order_id: string;
  merchant_id: string;
  app_id: string;
  customer_did?: string;
  amount_usd: number;
  currency: string;
  metadata?: Record<string, unknown>;
  status: string;
  checkout_url: string;
  expires_at: Date;
  transactions: TransactionDetails[];
  created_at: Date;
  updated_at: Date;
}

export interface CompleteOrderResponse {
  order_id: string;
  status: string;
  message: string;
}
