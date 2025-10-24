/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

// ==================== Base Response Types ====================

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

// ==================== Pagination ====================

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ==================== Merchant Responses ====================

export interface MerchantApp {
  app_id: string;
  name: string;
  webhook_url?: string;
  created_at: Date;
}

export interface RegisterMerchantResponse {
  merchant_id: string;
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
  created_at: Date;
}

export interface CreateAppResponse {
  app_id: string;
  api_key: string;
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
  updated_at: Date;
}

// ==================== Order Responses ====================

export interface CreateOrderResponse {
  order_id: string;
  checkout_url: string;
  expires_at: Date;
}

export interface OrderDetails {
  order_id: string;
  merchant_id: string;
  app_id: string;
  customer_did?: string;
  amount_usd: number;
  currency: string;
  metadata: Record<string, unknown>;
  status: string;
  checkout_url: string;
  expires_at: Date;
  transaction_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface GetOrderResponse extends OrderDetails {
  merchant_wallet?: string;
  is_expired?: boolean;
  transactions?: TransactionDetails[];
}

export interface ListOrdersResponse {
  orders: OrderDetails[];
  pagination: PaginationMeta;
}

export interface CompleteOrderResponse {
  order_id: string;
  status: string;
  message: string;
}

// ==================== Transaction Responses ====================

export interface TransactionDetails {
  tx_hash: string;
  order_id: string;
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

export interface ListTransactionsResponse
  extends PaginatedResponse<TransactionDetails> {
  transactions: TransactionDetails[];
  stats?: {
    total_transactions: number;
    total_volume_usd: number;
  };
}

export interface SubmitTransactionResponse {
  status: string;
  message: string;
  tx_hash: string;
  order_id: string;
}

export interface PrepareTransactionResponse {
  order_id: string;
  chain: string;
  asset: string;
  amount_usd: number;
  transaction: {
    from: string;
    to: string;
    value: string;
    data?: string;
    chainId: number;
    gasLimit?: string;
    details: {
      asset: string;
      amount: string;
      amount_raw: string;
      decimals: number;
      usd_value: number;
    };
  };
  instructions: {
    step1: string;
    step2: string;
    step3: string;
  };
}

// ==================== Dashboard/Stats Responses ====================

export interface AppBalancesResponse {
  merchant: {
    merchant_id: string;
    evm_wallet?: string;
    sol_wallet?: string;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  transactions: {
    total: number;
    confirmed: number;
  };
  revenue: {
    total_usd: number;
    transaction_volume_usd: number;
  };
  breakdown: {
    by_asset: Array<{
      asset: string;
      count: number;
      volume_usd: number;
    }>;
    by_chain: Array<{
      chain: string;
      count: number;
      volume_usd: number;
    }>;
  };
  recent_transactions: TransactionDetails[];
  fetched_at: Date;
}

// ==================== Health Check ====================

export interface HealthCheckResponse {
  status: string;
  database: string;
  timestamp: Date;
}
