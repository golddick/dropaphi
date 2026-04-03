

// app/(dashboard)/workspace/[workspaceId]/email/campaigns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { Loader2 } from 'lucide-react';
import { useEmailStore } from '@/lib/stores/email';
import { CampaignHeader } from './_component/campaign-header';
import { CampaignStats } from './_component/campaign-stats';
import { CampaignTabs } from './_component/create-campaign-tab';
import { NewCampaignModal } from './_component/new-campaign';
import { TemplatePreviewModal } from './_component/preview';
import { CampaignDetails } from './_component/campaign-details';

export default function CampaignManagementPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { toast } = useToast();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { 
    campaigns, 
    templates, 
    isLoading,
    fetchCampaigns, 
    fetchTemplates,
    fetchStats,
    stats
  } = useEmailStore();

  
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load workspace
  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspace({ id: workspaceId } as any);
    }
  }, [workspaceId, setCurrentWorkspace]);

  // Load data
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadData();
    }
  }, [currentWorkspace?.id]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchTemplates(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign data',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Campaign data has been updated',
    });
  };

  if (isLoading && !campaigns.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <CampaignHeader 
        onRefresh={handleRefresh}
        // onNewCampaign={() => setShowNewCampaignModal(true)}
        refreshing={refreshing}
      />
 
      <CampaignStats stats={stats} />

      <CampaignTabs
        campaigns={campaigns}
        templates={templates}
        selectedCampaign={selectedCampaign}
        onSelectCampaign={setSelectedCampaign}
        onPreviewTemplate={(template) => {
          setPreviewTemplate(template);
          setShowTemplatePreview(true);
        }}
      />

      {/* <NewCampaignModal
        open={showNewCampaignModal}
        onOpenChange={setShowNewCampaignModal}
        templates={templates}
      /> */}

      <TemplatePreviewModal
        template={previewTemplate}
        open={showTemplatePreview}
        onOpenChange={setShowTemplatePreview}
      />

      {/* {selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)}
        />
      )} */}
    </div>
  );
}