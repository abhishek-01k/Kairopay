/**
 * Health Check API
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../config';
import type { HealthCheckResponse } from '../types';

/**
 * Fetch health check status
 */
export async function getHealthCheck(): Promise<HealthCheckResponse> {
  return apiFetch<HealthCheckResponse>('/health');
}

/**
 * React Query hook for health check
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealthCheck,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}

