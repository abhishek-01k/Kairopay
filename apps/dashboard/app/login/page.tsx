"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRegisterMerchant, useMerchantProfile } from "@/lib/queries";
import { ApiError } from "@/lib/queries/config";

export default function LoginPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const registrationAttempted = useRef(false);

  const registerMutation = useRegisterMerchant();

  console.log("user",user);


  const { data: merchant, isLoading: checkingMerchant } = useMerchantProfile(
    authenticated && user?.id ? user.id : null
  );

  // Determine UI state
  const isRegistering = registerMutation.isPending;
  const showError = !!error;

  useEffect(() => {
    // Only proceed if user is authenticated
    if (!authenticated || !user?.id) {
      registrationAttempted.current = false;
      return;
    }

    // Still checking if merchant exists
    if (checkingMerchant) return;

    // Merchant exists - redirect to dashboard
    if (merchant) {
      router.push("/dashboard");
      return;
    }

    // Merchant doesn't exist - register (only once)
    if (!registrationAttempted.current && !isRegistering) {
      registrationAttempted.current = true;

      registerMutation.mutate(
        {
          privy_did: user.id,
          evm_wallet: user.wallet?.address,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (err) => {
            registrationAttempted.current = false;
            setError(
              err instanceof ApiError
                ? err.message
                : "Failed to register. Please try again."
            );
          },
        }
      );
    }
  }, [authenticated, user?.id, merchant, checkingMerchant]);

  const handleRetry = () => {
    setError(null);
    registrationAttempted.current = false;
  };

  if (!ready) {
    return <LoadingScreen message="Loading..." />;
  }

  if (authenticated) {
    if (showError) {
      return <ErrorScreen message={error} onRetry={handleRetry} />;
    }
    if (checkingMerchant) {
      return <LoadingScreen message="Checking your account..." />;
    }
    if (isRegistering) {
      return <LoadingScreen message="Setting up your account..." />;
    }
  }

  return <LoginScreen onLogin={login} />;
}


function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-blue-300">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-blue-900/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
            Registration Failed
          </h2>
          <p className="text-gray-600 dark:text-blue-300/70 mb-6">{message}</p>
          <button
            onClick={onRetry}
            className="w-full bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-blue-900/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-black dark:bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Welcome to KairoPay
          </h1>
          <p className="text-gray-600 dark:text-blue-300/70">
            Sign in to access your merchant dashboard
          </p>
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Connect Wallet
        </button>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-blue-300/50">
          <p>Secure authentication powered by Privy</p>
        </div>
      </div>
    </div>
  );
}
