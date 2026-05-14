
// app/subscribe/[workspaceId]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Mail, Phone, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import { toast } from "sonner";
import { useSubscriberStore } from "@/lib/stores/subscriber/subscriber-store";
import {useWorkspaceID} from "@/lib/id/workspace";

export default function SubscriptionPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();
  const {
    subscribe,
    isLoading,
    error,
    clearError
  } = useSubscriberStore();

  const workspaceId = useWorkspaceID();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [subscriptionType, setSubscriptionType] = useState<"email" | "phone">("email");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceId) {
      toast.error("No workspace selected");
      return;
    }

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsEmailSubmitting(true);

    try {
      await subscribe(email, name || undefined, "subscription_page");
      setSubmittedEmail(email);
      setSubmitted(true);
      setEmail("");
      setName("");
    } catch (error) {
      // Error is handled by store and toast
      console.error("Subscription error:", error);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceId) {
      toast.error("No workspace selected");
      return;
    }

    const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsPhoneSubmitting(true);

    try {
      // TODO: Implement phone subscription when ready
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      setPhone("");
      setSubscriptionType("phone");
    } catch (error) {
      toast.error("Failed to subscribe");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  if (submitted) {
    return (
        <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl shadow-lg p-8 text-center space-y-6 border border-border">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to the Family! 🎉</h2>
                <p className="text-muted-foreground space-y-2">
                  {subscriptionType === "email" ? (
                      <>
                        <span>A welcome email has been sent to <strong className="text-primary">{submittedEmail}</strong>!</span>
                        <br />
                        <span className="text-sm">Please check your inbox and confirm your subscription.</span>
                      </>
                  ) : (
                      "An SMS confirmation has been sent. Thank you for subscribing!"
                  )}
                </p>
              </div>
              <div className="pt-4 space-y-2">
                <Button
                    onClick={() => {
                      setSubmitted(false);
                      setSubmittedEmail("");
                      setSubscriptionType("email");
                    }}
                    variant="outline"
                    className="w-full"
                >
                  Subscribe Another Email
                </Button>
                <Button
                    onClick={() => router.push("/")}
                    variant="ghost"
                    className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  const isSubmitting = isEmailSubmitting || isPhoneSubmitting;

  return (
      <div className="min-h-screen bg-linear-to-br from-background via-card to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Stay Updated</h1>
            <p className="text-muted-foreground">
              Subscribe to get the latest news and updates delivered to you
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
            <Tabs value={subscriptionType} onValueChange={(value: any) => setSubscriptionType(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-1 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email Subscription</span>
                </TabsTrigger>
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Your Name (Optional)
                    </label>
                    <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isEmailSubmitting}
                        className="w-full h-10 px-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Email Address *
                    </label>
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isEmailSubmitting}
                        className="w-full h-10 px-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send you a confirmation link. No spam, ever.
                    </p>
                  </div>
                  <Button
                      type="submit"
                      disabled={isEmailSubmitting || !email}
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isEmailSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Subscribing...
                        </>
                    ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Subscribe
                        </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Phone Tab - Hidden but kept for future implementation */}

              <TabsContent value="phone" className="space-y-4">
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Phone Number
                        </label>
                        <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isPhoneSubmitting}
                            className="w-full h-10 px-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          We'll send you updates via SMS. Standard rates may apply.
                        </p>
                      </div>
                      <Button
                          type="submit"
                          disabled={isPhoneSubmitting || !phone}
                          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isPhoneSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Subscribing...
                            </>
                        ) : (
                            <>
                              <Phone className="w-4 h-4 mr-2" />
                              Subscribe
                            </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

            </Tabs>

            {/* Privacy Note */}
            <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground text-center">
                Your information is safe with us. We respect your privacy and never share your data.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}