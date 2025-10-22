"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 lg:hidden z-10"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

