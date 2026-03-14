// app/subscribe/page.tsx
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

export default function SubscriptionPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();
  const { 
    subscribe, 
    isLoading, 
    error, 
    clearError 
  } = useSubscriberStore();
  
  const workspaceId = currentWorkspace?.id;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<"email" | "phone">("email");

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

    try {
      await subscribe(email, name || undefined, "subscription_page");
      setSubmitted(true);
      setEmail("");
      setName("");
    } catch (error) {
      // Error is handled by store and toast
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

    try {
      // TODO: Implement phone subscription when ready
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      setPhone("");
      setSubscriptionType("phone");
    } catch (error) {
      toast.error("Failed to subscribe");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Almost There!</h2>
              <p className="text-muted-foreground">
                {subscriptionType === "email"
                  ? "Please check your email to confirm your subscription. We've sent you a confirmation link."
                  : "An SMS confirmation has been sent. Thank you for subscribing!"}
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Subscribe Another Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Stay Updated</h1>
          <p className="text-muted-foreground">
            Subscribe to get the latest news and updates delivered to you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-border">
          <Tabs value={subscriptionType} onValueChange={(value: any) => setSubscriptionType(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Phone</span>
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
                    disabled={isLoading}
                    className="w-full h-10 px-4 rounded-lg border border-border focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 px-4 rounded-lg border border-border focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send you a confirmation link. No spam, ever.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-10 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Subscribe
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Phone Tab */}
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
                    disabled={isLoading}
                    className="w-full h-10 px-4 rounded-lg border border-border focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send you updates via SMS. Standard rates may apply.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full h-10 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Subscribe
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your information is safe with us. We respect your privacy and never share your data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Share this link to grow your subscriber list</p>
          {workspaceId && (
            <p className="mt-2 font-mono text-red-600 text-sm">
              {`${window.location.origin}/subscribe?workspace=${workspaceId}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}









// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Icons } from "@/components/icons/icons"
// import { Check, Mail, Phone } from "lucide-react"
// import { useWorkspaceStore } from "@/lib/stores/workspace"

// export default function SubscriptionPage() {
//   const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
//   const workspaceId = currentWorkspace?.id
//   const [email, setEmail] = useState("")
//   const [phone, setPhone] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [submitted, setSubmitted] = useState(false)
//   const [subscriptionType, setSubscriptionType] = useState<"email" | "phone">("email")

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!email || !email.includes("@")) {
//       alert("Please enter a valid email address")
//       return
//     }

//     setLoading(true)
//     try {
//       // Simulate API call - in production this would be a real endpoint
//       await new Promise((resolve) => setTimeout(resolve, 1500))
//       setSubmitted(true)
//       setEmail("")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePhoneSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/
//     if (!phone || !phoneRegex.test(phone)) {
//       alert("Please enter a valid phone number")
//       return
//     }

//     setLoading(true)
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1500))
//       setSubmitted(true)
//       setPhone("")
//       setSubscriptionType("phone")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
//             <div className="flex justify-center">
//               <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center">
//                 <Check className="w-8 h-8 text-black" />
//               </div>
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-foreground mb-2">Subscription Confirmed!</h2>
//               <p className="text-muted-foreground">
//                 {subscriptionType === "email"
//                   ? "Check your email for a confirmation link. Welcome to our newsletter!"
//                   : "An SMS confirmation has been sent. Thank you for subscribing!"}
//               </p>
//             </div>
//             <div className="pt-4">
//               <Button
//                 onClick={() => setSubmitted(false)}
//                 variant="outline"
//                 className="w-full"
//               >
//                 Subscribe Another Email or Number
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-background via-card to-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="w-12 h-12 rounded-lg bg-red-200 flex items-center justify-center">
//               <Mail className="w-6 h-6 text-black" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-foreground mb-2">Stay Updated</h1>
//           <p className="text-muted-foreground">
//             Subscribe to get the latest news and updates delivered to you
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-xl shadow-lg p-8 border border-border">
//           <Tabs value={subscriptionType} onValueChange={(value: any) => setSubscriptionType(value)} className="w-full">
//             <TabsList className="grid w-full grid-cols-2 mb-6">
//               <TabsTrigger value="email" className="flex items-center gap-2">
//                 <Mail className="w-4 h-4" />
//                 <span className="hidden sm:inline">Email</span>
//               </TabsTrigger>
//               <TabsTrigger value="phone" className="flex items-center gap-2">
//                 <Phone className="w-4 h-4" />
//                 <span className="hidden sm:inline">Phone</span>
//               </TabsTrigger>
//             </TabsList>

//             {/* Email Tab */}
//             <TabsContent value="email" className="space-y-4">
//               <form onSubmit={handleEmailSubmit} className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-foreground block mb-2">
//                     Email Address
//                   </label>
//                   <Input
//                     type="email"
//                     placeholder="your@email.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     disabled={loading}
//                     className="w-full h-10 px-4 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
//                   />
//                   <p className="text-xs text-muted-foreground mt-2">
//                     We'll send you a confirmation link. No spam, ever.
//                   </p>
//                 </div>
//                 <Button
//                   type="submit"
//                   disabled={loading || !email}
//                   className="w-full h-10 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
//                 >
//                   {loading ? (
//                     <span className="flex items-center gap-2">
//                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                       Subscribing...
//                     </span>
//                   ) : (
//                     <span className="flex items-center gap-2">
//                       <Mail className="w-4 h-4" />
//                       Subscribe
//                     </span>
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* Phone Tab */}
//             <TabsContent value="phone" className="space-y-4">
//               <form onSubmit={handlePhoneSubmit} className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-foreground block mb-2">
//                     Phone Number
//                   </label>
//                   <Input
//                     type="tel"
//                     placeholder="+1 (555) 000-0000"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     disabled={loading}
//                     className="w-full h-10 px-4 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
//                   />
//                   <p className="text-xs text-muted-foreground mt-2">
//                     We'll send you updates via SMS. Standard rates may apply.
//                   </p>
//                 </div>
//                 <Button
//                   type="submit"
//                   disabled={loading || !phone}
//                   className="w-full h-10 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
//                 >
//                   {loading ? (
//                     <span className="flex items-center gap-2">
//                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                       Subscribing...
//                     </span>
//                   ) : (
//                     <span className="flex items-center gap-2">
//                       <Phone className="w-4 h-4" />
//                       Subscribe
//                     </span>
//                   )}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>

//           {/* Privacy Note */}
//           <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
//             <p className="text-xs text-muted-foreground text-center">
//               Your information is safe with us. We respect your privacy and never share your data.
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-6 text-center text-xs text-muted-foreground">
//           <p>Share your unique link to grow your subscriber list</p>
//         </div>
//       </div>
//     </div>
//   )
// }
