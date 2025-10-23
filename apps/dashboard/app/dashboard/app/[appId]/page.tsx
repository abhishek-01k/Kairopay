"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useMerchantProfile } from "@/lib/queries";
import { Chain, Transaction } from "@/types/app";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function AppDetailsPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const appId = params.appId as string;
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "withdraw">("overview");
  const [withdrawForm, setWithdrawForm] = useState({
    chain: "",
    amount: "",
    address: "",
  });

  const privyDid = user?.id;
  const { data: merchantProfile, isLoading } = useMerchantProfile(privyDid);

  // Find the specific app from the merchant's apps
  const appDetails = useMemo(() => {
    if (!merchantProfile || !appId) return null;
    
    const app = merchantProfile.apps.find((a) => a.app_id === appId);
    if (!app) return null;

    // For now, return mock data for balances and transactions until we have real endpoints
    return {
      ...app,
      name: app.name,
      description: "Application details",
      environment: "Production" as const,
      totalBalance: "0.00",
      balances: [] as Chain[],
      transactions: [] as Transaction[],
    };
  }, [merchantProfile, appId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle withdrawal logic here
    console.log("Withdraw:", withdrawForm);
    setWithdrawForm({ chain: "", amount: "", address: "" });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!appDetails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">App not found</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appDetails.name}
                </h1>
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                  {appDetails.environment}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {appDetails.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${appDetails.totalBalance}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "transactions"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "withdraw"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Chain Balances */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Balances by Chain
              </h2>
              {appDetails.balances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appDetails.balances.map((chain) => (
                    <Card key={chain.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-indigo-600" />
                            {chain.name}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {chain.balance} {chain.symbol}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ≈ ${chain.usdValue}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No balances yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Your balances will appear here once you start receiving payments
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Transactions
                </h2>
                {appDetails.transactions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("transactions")}
                  >
                    View All
                  </Button>
                )}
              </div>
              <Card>
                <CardContent className={appDetails.transactions.length === 0 ? "p-8 text-center" : "p-0"}>
                  {appDetails.transactions.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {appDetails.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(tx.status)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  {tx.hash}
                                  <button onClick={() => copyToClipboard(tx.hash)}>
                                    <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                  </button>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {tx.chain} • {formatTimestamp(tx.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {tx.amount} ETH
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ${tx.usdValue}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No transactions yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Transactions will appear here when customers make payments
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              All Transactions
            </h2>
            <Card>
              <CardContent className={appDetails.transactions.length === 0 ? "p-8 text-center" : "p-0"}>
                {appDetails.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Transaction Hash
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            From
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            To
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Chain
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {appDetails.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3">
                              <Badge className={`${getStatusColor(tx.status)} text-xs`}>
                                {tx.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-gray-900 dark:text-white">
                                  {tx.hash}
                                </span>
                                <button onClick={() => copyToClipboard(tx.hash)}>
                                  <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                </button>
                                <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                {tx.from}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                {tx.to}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {tx.amount} ETH
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  ${tx.usdValue}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {tx.chain}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTimestamp(tx.timestamp)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <>
                    <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No transactions yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Transactions will appear here when customers make payments
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "withdraw" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Withdraw Funds
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Available Balances</CardTitle>
                <CardDescription>
                  Select a chain and amount to withdraw to your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {appDetails.balances.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appDetails.balances.map((chain) => (
                      <div
                        key={chain.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {chain.name}
                          </span>
                          <Wallet className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {chain.balance} {chain.symbol}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ≈ ${chain.usdValue}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700">
                              <ArrowUpRight className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdraw {chain.name}</DialogTitle>
                              <DialogDescription>
                                Enter the amount and destination address
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleWithdraw} className="space-y-4 mt-4">
                              <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  step="0.000001"
                                  placeholder="0.00"
                                  value={withdrawForm.amount}
                                  onChange={(e) =>
                                    setWithdrawForm({ ...withdrawForm, amount: e.target.value })
                                  }
                                  required
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Available: {chain.balance} {chain.symbol}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="address">Destination Address</Label>
                                <Input
                                  id="address"
                                  placeholder="0x..."
                                  value={withdrawForm.address}
                                  onChange={(e) =>
                                    setWithdrawForm({ ...withdrawForm, address: e.target.value })
                                  }
                                  required
                                  className="mt-1"
                                />
                              </div>
                              <div className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                  Confirm Withdrawal
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No balances available</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Start accepting payments to build up your balance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </div>
    </DashboardLayout>
  );
}

