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
