"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Support
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get help and support for your merchant account
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Help Center
                </CardTitle>
                <CardDescription>
                  Browse our knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Send us an email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Contact via Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </CardTitle>
                <CardDescription>
                  Chat with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

