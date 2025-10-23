"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Github,
  Twitter,
  UserCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Applications", href: "/dashboard", icon: LayoutGrid },
  { name: "Balance", href: "/dashboard/balances", icon: Wallet },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

const resources: NavItem[] = [
  { name: "Support", href: "mailto:abhisheksingh23576@gmail.com", icon: HelpCircle },
  { name: "GitHub", href: "https://github.com/abhishek-01k/payment_gateway", icon: Github },
  { name: "Twitter", href: "https://x.com/abhish_3k", icon: Twitter },
];

export default function Sidebar() {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getUserEmail = () => {
    return (
      user?.email?.address ||
      user?.google?.email ||
      user?.farcaster?.username ||
      "User"
    );
  };

  const getUserInitial = () => {
    const email = getUserEmail();
    return email[0]?.toUpperCase() || "U";
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-gray-200 dark:border-blue-900/30 w-64">
      <div className="p-6 border-b border-gray-200 dark:border-blue-900/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black dark:text-white">Kairopay</h2>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 bg-gray-100 dark:bg-blue-950 border border-gray-200 dark:border-blue-900">
            <AvatarFallback className="bg-gray-100 dark:bg-blue-950 text-black dark:text-blue-400 font-semibold">
              {getUserInitial()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {getUserEmail()}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "bg-black text-white dark:bg-blue-600 dark:text-white"
                    : "text-gray-700 dark:text-blue-200 hover:bg-gray-100 dark:hover:bg-blue-950"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.name}</span>
                {active && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="pt-4 pb-2">
          <div className="border-t border-gray-200 dark:border-blue-900/30" />
        </div>

        {/* Resources */}
        <div className="space-y-1">
          {resources.map((item) => {
            const Icon = item.icon;
            const handleClick = () => {
              if (item.href.startsWith("mailto:")) {
                window.location.href = item.href;
              } else if (item.href.startsWith("http")) {
                window.open(item.href, "_blank", "noopener,noreferrer");
              } else {
                router.push(item.href);
              }
            };
            return (
              <button
                key={item.name}
                onClick={handleClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-blue-200 hover:bg-gray-100 dark:hover:bg-blue-950 transition-colors"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-blue-900/30">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 dark:text-blue-200 hover:bg-gray-100 dark:hover:bg-blue-950"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

