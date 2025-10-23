"use client";

import { usePrivy } from "@privy-io/react-auth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Shield,
  Wallet,
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMerchantProfile } from "@/lib/queries/merchant";

export default function ProfilePage() {
  const { user } = usePrivy();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const privyDid = user?.id;
  const { data: merchantProfile, isLoading } = useMerchantProfile(privyDid);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getUserEmail = () => {
    return (
      user?.email?.address ||
      user?.google?.email ||
      user?.farcaster?.username ||
      "Not available"
    );
  };

  const getUserInitial = () => {
    const email = getUserEmail();
    return email[0]?.toUpperCase() || "U";
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
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
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-white dark:bg-blue-950 border-2 border-black/10 dark:border-blue-900">
                <AvatarFallback className="bg-white dark:bg-blue-950 text-black dark:text-blue-400 text-2xl font-bold">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-black dark:text-white">
                  {getUserEmail()}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Merchant Account
                </CardDescription>
              </div>
              <Badge className="bg-black text-white dark:bg-green-900/30 dark:text-green-400 border-0">
                Active
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-blue-950 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-700 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-black dark:text-white">{getUserEmail()}</p>
                </div>
              </div>
            </div>

            {/* Privy DID */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-blue-950 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Privy DID</p>
                  <p className="font-mono text-sm text-black dark:text-white truncate">
                    {user.id}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(user.id, "privy")}
                className="ml-2"
              >
                {copiedField === "privy" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Merchant ID */}
            {merchantProfile && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-blue-950 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-700 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Merchant ID</p>
                    <p className="font-mono text-sm text-black dark:text-white truncate">
                      {merchantProfile.merchant_id}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(merchantProfile.merchant_id, "merchant")}
                  className="ml-2"
                >
                  {copiedField === "merchant" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Account Created */}
            {merchantProfile && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-blue-950 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
                    <p className="font-medium text-black dark:text-white">
                      {formatDate(merchantProfile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Wallets */}
        {merchantProfile && (
          <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Wallet className="w-5 h-5" />
                Connected Wallets
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Wallets associated with your merchant account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* EVM Wallet */}
              {merchantProfile.evm_wallet && (
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-black text-white dark:bg-blue-900/30 dark:text-blue-400 border-0">
                      EVM
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://etherscan.io/address/${merchantProfile.evm_wallet}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-black dark:text-white">
                      {truncateAddress(merchantProfile.evm_wallet)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(merchantProfile.evm_wallet!, "evm")
                      }
                    >
                      {copiedField === "evm" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {merchantProfile.evm_wallet}
                  </p>
                </div>
              )}

              {/* Solana Wallet */}
              {merchantProfile.sol_wallet && (
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-black text-white dark:bg-purple-900/30 dark:text-purple-400 border-0">
                      Solana
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://explorer.solana.com/address/${merchantProfile.sol_wallet}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-black dark:text-white">
                      {truncateAddress(merchantProfile.sol_wallet)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(merchantProfile.sol_wallet!, "sol")
                      }
                    >
                      {copiedField === "sol" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {merchantProfile.sol_wallet}
                  </p>
                </div>
              )}

              {!merchantProfile.evm_wallet && !merchantProfile.sol_wallet && (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No wallets connected</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Connect your wallets to start accepting payments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applications Stats */}
        {merchantProfile && merchantProfile.apps.length > 0 && (
          <Card className="bg-white dark:bg-gray-900 border-black/10 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                Application Statistics
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Overview of your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
                  <p className="text-3xl font-bold text-black dark:text-white mt-1">
                    {merchantProfile.apps.length}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latest App</p>
                  <p className="text-lg font-semibold text-black dark:text-white mt-1 truncate">
                    {merchantProfile.apps[merchantProfile.apps.length - 1]?.name || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-black/10 dark:border-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge className="bg-black text-white dark:bg-green-900/30 dark:text-green-400 border-0 mt-2">
                    All Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

