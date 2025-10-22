"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Team
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your team members and their permissions
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Coming soon - Invite and manage team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Team management features will be available here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}

