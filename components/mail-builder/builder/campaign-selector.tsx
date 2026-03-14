"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons/icons"
import { Check, Folder, Plus } from "lucide-react"

interface Campaign {
  id: string
  name: string
  createdAt: string
}

interface CampaignSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaigns: Campaign[]
  onSelectCampaign?: (campaign: Campaign) => void
  onCreateCampaign?: (name: string) => void
  selectedCampaignId?: string
}

export function CampaignSelector({
  open,
  onOpenChange,
  campaigns,
  onSelectCampaign,
  onCreateCampaign,
  selectedCampaignId,
}: CampaignSelectorProps) {
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return

    setIsLoading(true)
    try {
      await onCreateCampaign?.(newCampaignName)
      setNewCampaignName("")
      setShowCreateNew(false)
    } finally {
      setIsLoading(false)
    }
  }

  return ( 
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            {showCreateNew ? "Create New Campaign" : "Select Campaign"}
          </DialogTitle>
        </DialogHeader>

        {!showCreateNew ? (
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => {
                      onSelectCampaign?.(campaign)
                      onOpenChange(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCampaignId === campaign.id
                        ? "border-red-400 bg-accent/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm capitalize">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedCampaignId === campaign.id && (
                        <Check className="w-4 h-4 text-accent shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No campaigns yet. Create one to get started.
              </p>
            )}

            <Button
              variant="default"
              onClick={() => setShowCreateNew(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                placeholder="e.g., Summer Sale, Newsletter #5"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Create a new campaign to organize your email sends and track performance.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            if (showCreateNew) {
              setShowCreateNew(false)
              setNewCampaignName("")
            } else {
              onOpenChange(false)
            }
          }}>
            {showCreateNew ? "Back" : "Cancel"}
          </Button>
          {showCreateNew && (
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim() || isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
