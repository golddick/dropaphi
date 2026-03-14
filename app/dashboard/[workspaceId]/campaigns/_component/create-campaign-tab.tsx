
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  FileText, 
  Search, 
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TemplateCard } from './template-card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/auth/auth-client';

interface CampaignTabsProps {
  campaigns: any[];
  templates: any[];
  selectedCampaign: any;
  onSelectCampaign: (campaign: any) => void;
  onPreviewTemplate: (template: any) => void;
}

export function CampaignTabs({ 
  campaigns, 
  templates, 
  selectedCampaign, 
  onSelectCampaign,
  onPreviewTemplate 
}: CampaignTabsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);


  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: 'Copied!',
      description: 'ID copied to clipboard',
    });
  };

  const handleSelectAllCampaigns = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  const handleSelectAllTemplates = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id));
    }
  };

  const handleDeleteSelectedCampaigns = () => {
    // Implement delete functionality
    toast({
      title: 'Deleted',
      description: `${selectedCampaigns.length} campaign(s) deleted successfully`,
    });
    setSelectedCampaigns([]);
  };

  const handleDeleteSelectedTemplates = () => {
    // Implement delete functionality
    toast({
      title: 'Deleted',
      description: `${selectedTemplates.length} template(s) deleted successfully`,
    });
    setSelectedTemplates([]);
  };

  return (
    <Card className="w-full">
      <Tabs defaultValue="campaigns" className="w-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="campaigns" className="gap-2">
                <Mail size={16} />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileText size={16} />
                Templates
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
          
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Campaigns Tab Content - Now using grid layout like templates */}
          <TabsContent value="campaigns" className="mt-0">
            <div className="space-y-4">
              {/* Bulk Actions for Campaigns */}
              {selectedCampaigns.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">
                    {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSelectAllCampaigns}
                    >
                      {selectedCampaigns.length === filteredCampaigns.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteSelectedCampaigns}
                    >
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Campaigns Grid - Matching templates layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-150 overflow-y-auto p-1">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="relative group">
                    <Checkbox
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                        } else {
                          setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                        }
                      }}
                      className="absolute top-3 left-3 z-10"
                    />
                    {/* Campaign Card Component */}
                    <Card 
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:shadow-md",
                        selectedCampaign?.id === campaign.id && "ring-2 ring-primary"
                      )}
                      onClick={() => onSelectCampaign(campaign)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate capitalize">{campaign.name}</h3>
                            <p className="text-sm text-gray-500 truncate capitalize">{campaign.subject}</p>
                          </div>
                          <Badge 
                            variant={campaign.status === 'SENT' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {campaign.status}
                          </Badge>
                        </div>

                        {/* Stats Preview */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Sent</p>
                            <p className="font-medium">{campaign.stats?.sent || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Opened</p>
                            <p className="font-medium text-blue-600">{campaign.stats?.opened || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Clicked</p>
                            <p className="font-medium text-purple-600">{campaign.stats?.clicked || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Bounced</p>
                            <p className="font-medium text-red-600">{campaign.stats?.bounced || 0}</p>
                          </div>
                        </div>

                        {/* Footer with actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-400">
                            {campaign.createdAt && formatDate(campaign.createdAt)}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              className="h-8 px-2 bg-red-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyId(campaign.id);
                              }}
                            >
                              Copy ID
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}

                {filteredCampaigns.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No campaigns found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or create a new campaign
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab Content */}
          <TabsContent value="templates" className="mt-0">
            <div className="space-y-4">
              {/* Bulk Actions for Templates */}
              {selectedTemplates.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">
                    {selectedTemplates.length} template{selectedTemplates.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSelectAllTemplates}
                    >
                      {selectedTemplates.length === filteredTemplates.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteSelectedTemplates}
                    >
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-150 overflow-y-auto p-1">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="relative group">
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemplates([...selectedTemplates, template.id]);
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                        }
                      }}
                      className="absolute top-3 left-3 z-10"
                    />
                    <TemplateCard
                      template={template}
                      onPreview={() => onPreviewTemplate(template)}
                      onCopyId={() => handleCopyId(template.id)}
                      onDelete={() => {}}
                    />
                  </div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No templates found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or create a new template
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

