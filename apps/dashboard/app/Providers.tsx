"use client";

import { ReactNode, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ""}
        config={{
          loginMethods: ["google", "farcaster"],
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
};

export default Providers;
