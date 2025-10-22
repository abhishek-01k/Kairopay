"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (authenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
