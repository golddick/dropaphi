"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Folder, Send, X, Mail, UserPlus, AlertCircle, Users, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useSubscriberStore } from "@/lib/stores/subscriber/subscriber-store"

interface SendEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendToSubscribers?: (campaignId: string) => void
  onSendToCustomEmails?: (emails: string[], campaignId: string) => void
  campaigns?: Array<{ 
    id: string; 
    name: string; 
  }>
  preselectedCampaignId?: string
  isSending?: boolean
  workspaceId?: string
}

export function SendEmailModal({
  open,
  onOpenChange,
  onSendToSubscribers,
  onSendToCustomEmails,
  campaigns = [],
  preselectedCampaignId,
  isSending = false,
  workspaceId,
}: SendEmailModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>(preselectedCampaignId || "")
  const [customEmailInput, setCustomEmailInput] = useState<string>("")
  const [customEmails, setCustomEmails] = useState<string[]>([])
  const [emailError, setEmailError] = useState<string>("")
  const [sendLoading, setSendLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("campaign")

 const {
    subscriberCount,
    fetchSubscriberCount,
  } = useSubscriberStore()

  const loadingSubscribers = useSubscriberStore((s) => s.isLoading)

  // Fetch subscriber count when modal opens
  useEffect(() => {
    if (open) {
      fetchSubscriberCount()
    }
  }, [open, fetchSubscriberCount])

 console.log("Subscriber count:", subscriberCount)

  // Reset state when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setCustomEmailInput("")
      setCustomEmails([])
      setEmailError("")
      setSendLoading(false)
    }
    onOpenChange(open)
  }

  // Handle adding email to list
  const handleAddEmail = () => {
    const email = customEmailInput.trim()
    
    if (!email) {
      setEmailError("Please enter an email address")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    // Check for duplicates
    if (customEmails.includes(email)) {
      setEmailError("This email has already been added")
      return
    }

    // Add email to list
    setCustomEmails([...customEmails, email])
    setCustomEmailInput("")
    setEmailError("")
  }

  // Handle adding email on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddEmail()
    }
  }

  // Remove email from list
  const handleRemoveEmail = (emailToRemove: string) => {
    setCustomEmails(customEmails.filter(email => email !== emailToRemove))
  }

  // Clear all emails
  const handleClearAll = () => {
    setCustomEmails([])
    setCustomEmailInput("")
    setEmailError("")
  }

  // Handle sending to campaign subscribers
  const handleSendToCampaign = async () => {
    if (!selectedCampaign) return
    
    // Double-check subscriber count before sending
    if (!subscriberCount || subscriberCount === 0) {
      toast.error("Cannot send email: No active subscribers found")
      return
    }

    setSendLoading(true)
    try {
      await onSendToSubscribers?.(selectedCampaign)
      handleOpenChange(false)
      toast.success(`Email sent to ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}`)
    } catch (error: any) {
      console.error("Error sending to subscribers:", error)
      toast.error(error.message || "Failed to send to subscribers")
    } finally {
      setSendLoading(false)
    }
  }

  // Handle sending to custom emails
  const handleSendToCustom = async () => {
    if (!selectedCampaign) {
      setEmailError("Please select a campaign first")
      return
    }

    if (customEmails.length === 0) {
      setEmailError("Please add at least one email address")
      return
    }

    setSendLoading(true)
    try {
      await onSendToCustomEmails?.(customEmails, selectedCampaign)
      toast.success(`Email sent to ${customEmails.length} recipient${customEmails.length !== 1 ? 's' : ''}`)
      handleOpenChange(false)
    } catch (error) {
      toast.error("Error sending to custom emails")
      console.error("Error sending to custom emails:", error)
    } finally {
      setSendLoading(false)
    }
  }

  const selectedCampaignData = campaigns.find((c) => c.id === selectedCampaign)
  const isLoading = isSending || sendLoading || loadingSubscribers

  // Check if send button should be disabled
  const isSendDisabled = () => {
    if (isLoading) return true
    
    if (activeTab === 'custom') {
      return !selectedCampaign || customEmails.length === 0
    } else {
      // For campaign tab, disable if no campaign selected OR no subscribers
      return !selectedCampaign || !subscriberCount || subscriberCount === 0
    }
  }

  // Get button text
  const getButtonText = () => {
    if (isLoading) {
      if (loadingSubscribers) return "Checking subscribers..."
      return "Sending..."
    }
    
    if (activeTab === 'custom') {
      return 'Send Email'
    } else {
      return subscriberCount 
        ? `Send to ${subscriberCount} Subscriber${subscriberCount !== 1 ? 's' : ''}` 
        : 'No Subscribers'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send className="w-5 h-5 text-red-500" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="campaign" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="campaign" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              To Subscribers
              {subscriberCount !== null && subscriberCount > 0 && (
                <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {subscriberCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              To Custom Emails
            </TabsTrigger>
          </TabsList>

          {/* Campaign Selection Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-500" />
                Select Campaign <span className="text-red-500">*</span>
              </label>
              
              {/* Refresh subscriber count button */}
              {workspaceId && (
                <Button
                  variant="ghost"
                  size="sm"
                  // onClick={() => getAllSubscribers("ACTIVE")}
                  disabled={loadingSubscribers}
                  className="h-8 px-2 text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loadingSubscribers ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
            
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign.id)}
                    disabled={isLoading}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      selectedCampaign === campaign.id
                        ? "border-red-500 bg-red-50 shadow-sm"
                        : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder className={`w-4 h-4 shrink-0 ${selectedCampaign === campaign.id ? 'text-red-500' : 'text-gray-400'}`} />
                        <div className="truncate">
                          <p className="font-medium text-sm text-gray-900 truncate capitalize">{campaign.name}</p>
                        </div>
                      </div>
                      {selectedCampaign === campaign.id && (
                        <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-white rounded-lg border border-dashed">
                <Folder className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No campaigns available</p>
                <p className="text-xs text-gray-400 mt-1">Create a campaign first</p>
              </div>
            )}

            {!selectedCampaign && campaigns.length > 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                Please select a campaign to continue
              </p>
            )}
          </div>

          {/* Campaign Subscribers Tab */}
          <TabsContent value="campaign" className="space-y-4">
            {selectedCampaignData ? (
              <div className="space-y-3">
                {/* Subscriber Count Status */}
                <div className={`p-4 rounded-lg border ${
                  subscriberCount && subscriberCount > 0 
                    ? "bg-green-50 border-green-200" 
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 ${
                      subscriberCount && subscriberCount > 0 ? "text-green-600" : "text-yellow-600"
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        subscriberCount && subscriberCount > 0 ? "text-green-800" : "text-yellow-800"
                      }`}>
                        {loadingSubscribers ? (
                          "Checking subscribers..."
                        ) : subscriberCount && subscriberCount > 0 ? (
                          `${subscriberCount} active subscriber${subscriberCount !== 1 ? 's' : ''} found`
                        ) : (
                          "No active subscribers found"
                        )}
                      </p>
                      {(!subscriberCount || subscriberCount === 0) && !loadingSubscribers && (
                        <p className="text-sm text-yellow-600 mt-1">
                          Add subscribers to your workspace before sending emails
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Ready to send: "{selectedCampaignData.name}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                <Folder className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-600">Select a campaign to send to subscribers</p>
              </div>
            )}
          </TabsContent>

          {/* Custom Emails Tab */}
          <TabsContent value="custom" className="space-y-4">
            {/* Email Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">Add Email Addresses</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address (e.g., user@example.com)"
                  value={customEmailInput}
                  onChange={(e) => {
                    setCustomEmailInput(e.target.value)
                    setEmailError("")
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !selectedCampaign}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddEmail}
                  disabled={!customEmailInput.trim() || isLoading || !selectedCampaign}
                  variant="outline"
                  className="shrink-0"
                >
                  Add Email
                </Button>
              </div>
              {!selectedCampaign && (
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Select a campaign first to add emails
                </p>
              )}
              {emailError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Email List Section */}
            {customEmails.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Recipients ({customEmails.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-600 h-auto px-2"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {customEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-red-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {customEmails.length === 0 && !emailError && selectedCampaign && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No emails added yet</p>
                <p className="text-xs text-gray-400 mt-1">Add email addresses above to send</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (activeTab === 'custom') {
                handleSendToCustom()
              } else {
                handleSendToCampaign()
              }
            }}
            disabled={isSendDisabled()}
            className="bg-red-500 hover:bg-red-600 text-white min-w-25"
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

