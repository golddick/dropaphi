// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/new-campaign-modal.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEmailStore } from '@/lib/stores/email';

interface NewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: any[];
}

export function NewCampaignModal({ open, onOpenChange, templates }: NewCampaignModalProps) {
  const { toast } = useToast();
  const { createCampaign } = useEmailStore();

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [isScheduled, setIsScheduled] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    try {
      await createCampaign({
        name: campaignName,
        subject: subject,
        templateId: selectedTemplate || undefined,
        scheduledAt: isScheduled ? scheduleDate?.toISOString() : undefined,
      });

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTemplate('');
    setCampaignName('');
    setSubject('');
    setFromName('');
    setFromEmail('');
    setReplyTo('');
    setSelectedLists([]);
    setScheduleDate(undefined);
    setIsScheduled(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Choose Template' : step === 2 ? 'Campaign Details' : 'Schedule & Audience'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer hover:border-red-300 transition-all",
                      selectedTemplate === template.id && "border-red-500 ring-2 ring-red-200"
                    )}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.subject}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>Start from scratch</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card
                  className={cn(
                    "cursor-pointer hover:border-red-300 transition-all",
                    selectedTemplate === 'scratch' && "border-red-500 ring-2 ring-red-200"
                  )}
                  onClick={() => setSelectedTemplate('scratch')}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-1">Start from Scratch</h4>
                    <p className="text-xs text-gray-500">Create a new campaign without a template</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., March Newsletter"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Your March Newsletter is here!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="e.g., Your Company"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    placeholder="e.g., newsletter@company.com"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
                <Input
                  id="replyTo"
                  placeholder="e.g., support@company.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                />
                <Label htmlFor="schedule">Schedule for later</Label>
              </div>

              {isScheduled && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Separator />

              <div>
                <Label>Select Audience Lists</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {['All Subscribers', 'Active Users', 'Newsletter Subscribers', 'Customers', 'Trial Users'].map((list) => (
                    <div key={list} className="flex items-center gap-2">
                      <Checkbox
                        id={list}
                        checked={selectedLists.includes(list)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLists([...selectedLists, list]);
                          } else {
                            setSelectedLists(selectedLists.filter(l => l !== list));
                          }
                        }}
                      />
                      <Label htmlFor={list}>{list}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} style={{ backgroundColor: '#DC143C' }}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} style={{ backgroundColor: '#DC143C' }}>
              Create Campaign
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}