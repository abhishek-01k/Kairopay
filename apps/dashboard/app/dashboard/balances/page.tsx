"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Copy,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMerchantBalances } from "@/lib/queries/merchant";

export default function BalancesPage() {
  const { user } = usePrivy();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Fetch merchant balances
  const { data: balancesData, isLoading, error, refetch, isRefetching } = useMerchantBalances(
    user?.id
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const getExplorerUrl = (address: string, chain: "evm" | "sol") => {
    if (chain === "evm") {
      return `https://etherscan.io/address/${address}`;
    } else {
      return `https://explorer.solana.com/address/${address}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTokenIcon = (token: string) => {
    const tokenMap: Record<string, string> = {
      eth: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      usdc: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
      usdt: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
      pyusd: "https://assets.coingecko.com/coins/images/31212/small/PYUSD_Logo_%282%29.png",
      matic: "https://assets.coingecko.com/coins/images/32440/standard/pol.png",
      btc: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
      sol: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
      dai: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png",
    };
    return tokenMap[token.toLowerCase()] || null;
  };

  const getTokenName = (token: string) => {
    const tokenNames: Record<string, string> = {
      eth: "Ethereum",
      usdc: "USD Coin",
      usdt: "Tether",
      pyusd: "PayPal USD",
      matic: "Polygon",
      btc: "Bitcoin",
      sol: "Solana",
      dai: "Dai",
    };
    return tokenNames[token.toLowerCase()] || token.toUpperCase();
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your balances.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 py-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Wallet Balances
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your wallet addresses and token balances
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            className="flex items-center gap-2 border-black/10 dark:border-blue-900/30"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-gray-500 dark:text-gray-400">Loading balances...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-6">
              <p className="text-red-600 dark:text-red-400">
                Failed to load balances. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Balances Data */}
        {!isLoading && !error && balancesData && (
          <>
            {/* Last Updated */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {formatDate(balancesData.updated_at)}
            </div>

            {/* Total Value Card (Placeholder) */}
            <Card className="bg-gradient-to-br from-black to-gray-800 dark:from-blue-700 dark:to-blue-950 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5" />
                  Total Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-8 h-8" />
                    <span className="text-4xl font-bold">
                      {formatBalance(
                        Object.values(balancesData.balances)
                          .reduce((acc, val) => acc + parseFloat(val), 0)
                          .toString()
                      )}
                    </span>
                    <span className="text-lg">USD</span>
                  </div>
                  <p className="text-gray-200 dark:text-blue-200 text-sm">
                    Estimated total value across all wallets
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* EVM Wallet */}
            {balancesData.wallets.evm && (
              <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Wallet className="w-5 h-5" />
                    EVM Wallet (Ethereum, Base, etc.)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-black text-white dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                          EVM
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-black dark:text-white">
                          {truncateAddress(balancesData.wallets.evm)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(balancesData.wallets.evm!, "evm")
                          }
                        >
                          {copiedAddress === "evm" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Full address: {balancesData.wallets.evm}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          getExplorerUrl(balancesData.wallets.evm!, "evm"),
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solana Wallet */}
            {balancesData.wallets.sol && (
              <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Wallet className="w-5 h-5" />
                    Solana Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-black text-white dark:bg-purple-900/30 dark:text-purple-400 border-0 text-xs">
                          Solana
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-black dark:text-white">
                          {truncateAddress(balancesData.wallets.sol)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(balancesData.wallets.sol!, "sol")
                          }
                        >
                          {copiedAddress === "sol" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Full address: {balancesData.wallets.sol}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          getExplorerUrl(balancesData.wallets.sol!, "sol"),
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Token Balances */}
            <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <DollarSign className="w-5 h-5" />
                  Token Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(balancesData.balances).map(([token, balance]) => {
                    const tokenIcon = getTokenIcon(token);
                    return (
                      <div
                        key={token}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20 hover:bg-black/5 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-black/10 dark:border-blue-900/20 flex items-center justify-center overflow-hidden">
                            {tokenIcon ? (
                              <Image
                                src={tokenIcon}
                                alt={token.toUpperCase()}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 dark:from-blue-700 dark:to-blue-950 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {token.toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-black dark:text-white">
                              {token.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getTokenName(token)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-black dark:text-white">
                            {formatBalance(balance)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {token.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

