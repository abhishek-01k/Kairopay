'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRegisterMerchant, useMerchantProfile } from '@/lib/queries';

/**
 * Hook to automatically register merchant on first login
 * and fetch their profile
 */
export function useMerchantSetup() {
  const { user, authenticated } = usePrivy();
  const registerMerchant = useRegisterMerchant();
  const { data: merchant, isLoading, error } = useMerchantProfile(user?.id);

  useEffect(() => {
    // Register merchant if authenticated but not registered
    if (authenticated && user?.id && !isLoading && !merchant && !error) {
      registerMerchant.mutate({
        privy_did: user.id,
        // Optional: Add wallets if available from Privy
        // evm_wallet: user.wallet?.address,
        // sol_wallet: user.solanaWallet?.address,
      });
    }
  }, [authenticated, user?.id, merchant, isLoading, error]);

  return {
    merchant,
    isLoading: isLoading || registerMerchant.isPending,
    error: error || registerMerchant.error,
    isRegistering: registerMerchant.isPending,
  };
}

