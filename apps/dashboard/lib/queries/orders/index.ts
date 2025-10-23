/**
 * Orders API
 * Note: These endpoints are not yet implemented in the backend
 * This file is prepared for future use
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../config';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  SubmitTransactionRequest,
  GetOrderResponse,
} from '../types';

/**
 * Create a new payment order
 */
export async function createOrder(
  data: CreateOrderRequest
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/orders/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Submit a transaction for an order
 */
export async function submitTransaction(
  orderId: string,
  data: SubmitTransactionRequest
): Promise<{ status: string; message: string }> {
  return apiFetch(`/orders/${orderId}/tx`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Mark an order as complete
 */
export async function completeOrder(
  orderId: string
): Promise<{ order_id: string; status: string }> {
  return apiFetch(`/orders/${orderId}/complete`, {
    method: 'POST',
  });
}

/**
 * Get order details by ID
 */
export async function getOrder(orderId: string): Promise<GetOrderResponse> {
  return apiFetch<GetOrderResponse>(`/orders/${orderId}`);
}

// ==================== React Query Hooks ====================

/**
 * Hook to create an order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook to submit a transaction
 */
export function useSubmitTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: SubmitTransactionRequest }) =>
      submitTransaction(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific order to refetch updated status
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

/**
 * Hook to complete an order
 */
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOrder,
    onSuccess: (_, orderId) => {
      // Invalidate order to show updated status
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook to get order details
 */
export function useOrder(orderId: string | null | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get all orders for an app (prepared for future endpoint)
 */
export function useOrders(appId: string | null | undefined) {
  return useQuery({
    queryKey: ['orders', appId],
    queryFn: async () => {
      // This endpoint doesn't exist yet
      // Will need to be implemented when backend is ready
      return apiFetch<GetOrderResponse[]>(`/orders?app_id=${appId}`);
    },
    enabled: !!appId,
    staleTime: 60000, // 1 minute
  });
}

