"use client";

import { usePrivy } from "@privy-io/react-auth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = usePrivy();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  console.log("user",user);
  

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getUserEmail = () => {
    return (
      user?.email?.address ||
      user?.google?.email ||
      user?.farcaster?.username ||
      "Not provided"
    );
  };

  const getUserName = () => {
    return user?.google?.name || user?.farcaster?.displayName || "User";
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name[0]?.toUpperCase() || "U";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 py-6 px-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your account information and connected wallets
          </p>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-semibold">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {getUserName()}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {getUserEmail()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Card */}
        {user.email && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.email.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Google Account */}
        {user.google && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.google.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.google.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Subject
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {user.google.subject}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Farcaster Account */}
        {user.farcaster && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.5 3h-19C1.67 3 1 3.67 1 4.5v15c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-19 1h19c.28 0 .5.22.5.5V6H2V4.5c0-.28.22-.5.5-.5zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Farcaster Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Username
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    @{user.farcaster.username || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display Name
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.farcaster.displayName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    FID
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.farcaster.fid || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallets Card */}
        {user.wallet && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connected Wallets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {user.wallet.walletClientType || "Embedded"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {user.wallet.chainType || "ethereum"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {truncateAddress(user.wallet.address)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          user.wallet?.address && copyToClipboard(user.wallet.address, "wallet")
                        }
                      >
                        {copiedAddress === "wallet" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Full address: {user.wallet.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/address/${user.wallet.address}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}

