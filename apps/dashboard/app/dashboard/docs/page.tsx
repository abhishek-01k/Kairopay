"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Documentation
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn how to integrate and use the payment gateway
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Quick start guide to integrate payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Complete API documentation and examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View API Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

