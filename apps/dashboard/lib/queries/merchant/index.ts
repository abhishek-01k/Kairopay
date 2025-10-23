/**
 * Merchant API
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../config';
import type {
  RegisterMerchantRequest,
  RegisterMerchantResponse,
  CreateAppRequest,
  CreateAppResponse,
  GetMerchantResponse,
  GetBalancesResponse,
} from '../types';

/**
 * Register a new merchant
 */
export async function registerMerchant(
  data: RegisterMerchantRequest
): Promise<RegisterMerchantResponse> {
  return apiFetch<RegisterMerchantResponse>('/merchant/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Create a new app for a merchant
 */
export async function createApp(
  data: CreateAppRequest
): Promise<CreateAppResponse> {
  return apiFetch<CreateAppResponse>('/merchant/register/app', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get merchant profile by Privy DID
 */
export async function getMerchantProfile(
  privyDid: string
): Promise<GetMerchantResponse> {
  return apiFetch<GetMerchantResponse>(`/merchant/${privyDid}`);
}

/**
 * Get merchant wallet balances
 */
export async function getMerchantBalances(
  privyDid: string
): Promise<GetBalancesResponse> {
  return apiFetch<GetBalancesResponse>(`/merchant/${privyDid}/balances`);
}

// ==================== React Query Hooks ====================

/**
 * Hook to register a merchant
 */
export function useRegisterMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerMerchant,
    onSuccess: (data) => {
      // Invalidate merchant queries to refetch
      queryClient.invalidateQueries({ queryKey: ['merchant', data.privy_did] });
    },
  });
}

/**
 * Hook to create an app
 */
export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApp,
    onSuccess: (_, variables) => {
      // Invalidate merchant profile to show new app
      queryClient.invalidateQueries({
        queryKey: ['merchant', variables.privy_did],
      });
    },
  });
}

/**
 * Hook to get merchant profile
 */
export function useMerchantProfile(privyDid: string | null | undefined) {
  return useQuery({
    queryKey: ['merchant', privyDid],
    queryFn: () => getMerchantProfile(privyDid!),
    enabled: !!privyDid, // Only run if privyDid exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get merchant balances
 */
export function useMerchantBalances(privyDid: string | null | undefined) {
  return useQuery({
    queryKey: ['merchant', privyDid, 'balances'],
    queryFn: () => getMerchantBalances(privyDid!),
    enabled: !!privyDid,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // 30 seconds
  });
}

