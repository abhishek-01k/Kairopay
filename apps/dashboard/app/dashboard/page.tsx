"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useMerchantProfile } from "@/lib/queries";
import type { MerchantApp } from "@/lib/queries/types";
import DashboardLayout from "@/components/DashboardLayout";
import CreateAppModal from "@/components/CreateAppModal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  // Get merchant profile with apps
  const { data: merchant, isLoading, refetch } = useMerchantProfile(
    authenticated && user?.id ? user.id : null
  );

  const apps: MerchantApp[] = merchant?.apps || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAppCreated = () => {
    // Refetch merchant data to update the apps list
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-white dark:bg-black">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-blue-900/30">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Welcome, {user?.email?.address || user?.google?.email || "User"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-blue-300/70">
                Manage your applications and track your payment integrations
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">Applications</h2>
              <p className="text-sm text-gray-600 dark:text-blue-300/70 mt-1">
                {apps.length} {apps.length === 1 ? 'application' : 'applications'} total
              </p>
            </div>
            <CreateAppModal userId={user?.id} onSuccess={handleAppCreated} />
          </div>

          {/* Apps Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-blue-500"></div>
              <p className="mt-4 text-gray-600 dark:text-blue-300/70">Loading your applications...</p>
            </div>
          ) : apps && apps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apps.map((app) => (
                <div
                  key={app.app_id}
                  onClick={() => router.push(`/dashboard/app/${app.app_id}`)}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-blue-900/30 rounded-lg p-6 hover:border-black dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="w-12 h-12 bg-gray-100 dark:bg-blue-950 border border-gray-200 dark:border-blue-900">
                      <AvatarFallback className="bg-gray-100 dark:bg-blue-950 text-black dark:text-blue-400 text-sm font-semibold">
                        {getInitials(app.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-blue-950 text-gray-700 dark:text-blue-300 text-xs border-0"
                    >
                      {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-black dark:text-white mb-2">
                    {app.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-blue-300/50 font-mono truncate">
                    {app.app_id}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-blue-900/30">
              <div className="mx-auto w-16 h-16 bg-black dark:bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-blue-300/70 mb-6 max-w-md mx-auto">
                Get started by creating your first application to integrate payment processing
              </p>
              <CreateAppModal userId={user?.id} onSuccess={handleAppCreated} />
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
