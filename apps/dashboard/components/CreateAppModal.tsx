"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateApp } from "@/lib/queries";
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
import { Plus, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CreateAppModalProps {
  userId: string | undefined;
  onSuccess?: () => void;
}

export default function CreateAppModal({ userId, onSuccess }: CreateAppModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    webhook_url: "",
  });
  const [newlyCreatedApp, setNewlyCreatedApp] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const createAppMutation = useCreateApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is authenticated
    if (!userId) {
      toast.error("Authentication required", {
        description: "Please log in to create an application",
      });
      return;
    }

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Application name required", {
        description: "Please enter a valid application name",
      });
      return;
    }

    createAppMutation.mutate(
      {
        privy_did: userId,
        name: formData.name.trim(),
        webhook_url: formData.webhook_url?.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          // Ensure we have valid response data
          if (!data || !data.app_id || !data.api_key) {
            toast.error("Invalid response from server", {
              description:
                "Application was created but credentials are missing. Please contact support.",
            });
            setIsOpen(false);
            return;
          }

          setNewlyCreatedApp(data);
          setModalState("success");
          setFormData({ name: "", webhook_url: "" });

          // Show success toast
          toast.success("Application created successfully!", {
            description: `${data.name} has been created`,
          });

          // Call parent callback if provided
          onSuccess?.();
        },
        onError: (error: any) => {
          // Handle different error types
          const errorMessage =
            error?.message || error?.toString() || "Unknown error occurred";

          // Show user-friendly error message
          toast.error("Failed to create application", {
            description: errorMessage.includes("duplicate") ||
              errorMessage.includes("already exists")
              ? "An application with this name already exists"
              : errorMessage.includes("network") ||
                errorMessage.includes("fetch")
              ? "Network error. Please check your connection and try again"
              : errorMessage.includes("unauthorized") ||
                errorMessage.includes("auth")
              ? "Authentication error. Please log in again"
              : errorMessage,
          });

          // Log error for debugging
          console.error("Application creation error:", error);
        },
      }
    );
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard", {
        description: `${field === "appId" ? "App ID" : "API Key"} has been copied`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy", {
        description: "Please try selecting and copying manually",
      });
    }
  };

  const handleContinue = () => {
    if (newlyCreatedApp) {
      setIsOpen(false);
      setShowSecret(false);
      setModalState("form");
      router.push(`/dashboard/app/${newlyCreatedApp.app_id}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to form state when modal is closed
      setTimeout(() => {
        setModalState("form");
        setShowSecret(false);
        setNewlyCreatedApp(null);
        // Don't reset form data if there's an error - let user try again
        if (!createAppMutation.isError) {
          setFormData({ name: "", webhook_url: "" });
        }
      }, 200);
    }
  };

  const handleCancelForm = () => {
    setIsOpen(false);
    // Clear form data when explicitly canceling
    setTimeout(() => {
      setFormData({ name: "", webhook_url: "" });
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New app
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {modalState === "form" ? (
          <>
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
                <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      webhook_url: e.target.value,
                    })
                  }
                  placeholder="https://your-domain.com/webhook"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Receive notifications about payments and events
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  className="flex-1"
                  disabled={createAppMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={
                    createAppMutation.isPending || !formData.name.trim()
                  }
                >
                  {createAppMutation.isPending
                    ? "Creating..."
                    : "Create Application"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                🎉 Application Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Your application has been created. Please save these credentials
                securely - you won't be able to see the App Secret again.
              </DialogDescription>
            </DialogHeader>

            {newlyCreatedApp ? (
              <div className="space-y-6 mt-4">
                {/* App Details */}
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Application Name
                    </h3>
                    <p className="text-lg font-semibold">
                      {newlyCreatedApp.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created At
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(newlyCreatedApp.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* App Credentials */}
                <div className="space-y-4">
                  {/* App ID */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">App ID</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(newlyCreatedApp.app_id, "appId")
                        }
                        className="h-8 px-2"
                      >
                        {copiedField === "appId" ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-xs text-green-600">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm bg-muted p-3 rounded border break-all">
                      {newlyCreatedApp.app_id}
                    </p>
                  </div>

                  {/* App Secret */}
                  <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-amber-900 dark:text-amber-300">
                        App Secret (API Key)
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                          className="h-8 px-2"
                        >
                          {showSecret ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              <span className="text-xs">Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              <span className="text-xs">Show</span>
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              newlyCreatedApp.api_key || "",
                              "apiKey"
                            )
                          }
                          className="h-8 px-2"
                        >
                          {copiedField === "apiKey" ? (
                            <>
                              <Check className="w-4 h-4 mr-1 text-green-600" />
                              <span className="text-xs text-green-600">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-3 rounded border border-amber-300 dark:border-amber-700 break-all">
                      {showSecret
                        ? newlyCreatedApp.api_key
                        : "•".repeat(newlyCreatedApp.api_key?.length || 0)}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-400 mt-2 flex items-start gap-1">
                      <span className="text-base">⚠️</span>
                      <span className="self-center">
                        Keep this secret safe! You won't be able to see it again
                        after closing this dialog.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleContinue}
                    className="flex-1 bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No application data available. Please try creating a new
                  application.
                </p>
                <Button
                  onClick={() => setModalState("form")}
                  variant="outline"
                  className="mt-4"
                >
                  Back to Form
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

