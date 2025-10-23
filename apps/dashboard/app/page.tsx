"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    // Once Privy is ready, redirect to login page
    // Login page handles both new and returning users
    if (ready) {
      router.push("/login");
    }
  }, [ready, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-blue-300">Loading...</p>
      </div>
    </div>
  );
}
