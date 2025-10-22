"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApps, createApp } from "@/lib/api/apps";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    environment: "Dev" as const,
  });

  const { data: apps, isLoading } = useQuery({
    queryKey: ["apps"],
    queryFn: getApps,
    enabled: ready && authenticated,
  });

  const createAppMutation = useMutation({
    mutationFn: createApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "", logo: "", environment: "Dev" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900  dark:text-white mb-2">
                Welcome, {user?.email?.address || user?.google?.email || "User"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To get started select from your applications.
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Applications
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New app
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Application</DialogTitle>
                <DialogDescription>
                  Add a new application to your merchant dashboard.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Application Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Awesome App"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="A brief description of your application"
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Logo (initials or emoji)</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({ ...formData, logo: e.target.value })
                    }
                    placeholder="MA or 🚀"
                    maxLength={2}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: 2 characters max
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={createAppMutation.isPending}
                  >
                    {createAppMutation.isPending ? "Creating..." : "Register App"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : apps && apps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => router.push(`/dashboard/app/${app.id}`)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900">
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-semibold">
                      {app.logo || getInitials(app.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                  >
                    {app.environment}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {app.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No applications yet. Create your first app to get started!
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First App
            </Button>
          </div>
        )}
        </main>
      </div>
    </DashboardLayout>
  );
}
