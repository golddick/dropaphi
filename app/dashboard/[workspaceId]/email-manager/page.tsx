// app/(dashboard)/email-manager/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Archive, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Eye,
  Send,
  Globe,
  Copy,
  RefreshCw,
  Code,
  FileText,
  Download,
  Maximize2,
  Users,
  ChevronRight,
  X,
  Loader2,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useEmailStore } from '@/lib/stores/email';
import { Email, EmailFromType, EmailStatus } from '@/lib/email/types';

export default function EmailManagerPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'inapp' | 'api'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('All Emails');
  const [previewMode, setPreviewMode] = useState<'html' | 'raw' | 'text'>('html');
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Get store state and actions
  const {
    emails,
    recentEmails,
    selectedEmail,
    isLoading,
    error,
    fetchRecentEmails,
    fetchEmailsByType,
    fetchEmailsByStatus,
    deleteEmail,
    deleteMultipleEmails,
    retryBouncedEmail,
    setSelectedEmail,
    clearError
  } = useEmailStore();

  // Load recent emails on mount
  useEffect(() => {
    fetchRecentEmails(50);
  }, [fetchRecentEmails]);

  // Show error toast if any
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
      clearError();
    }
  }, [error, clearError]);

  // Use emails from store (recentEmails for now, could switch based on filters)
  const displayEmails = emails.length > 0 ? emails : recentEmails;

  const folders = [
    { name: 'All Emails', count: displayEmails.length, icon: Mail, status: null },
    { name: 'Delivered', count: displayEmails.filter(e => e.status === 'DELIVERED').length, icon: CheckCircle, status: 'DELIVERED' },
    { name: 'Opened', count: displayEmails.filter(e => e.status === 'OPENED').length, icon: Eye, status: 'OPENED' },
    { name: 'Bounced', count: displayEmails.filter(e => e.status === 'BOUNCED').length, icon: AlertCircle, status: 'BOUNCED' },
    { name: 'Pending', count: displayEmails.filter(e => e.status === 'PENDING').length, icon: Clock, status: 'PENDING' },
    { name: 'Clicked', count: displayEmails.filter(e => e.status === "CLICKED").length, icon: ClipboardCheck, status: 'CLICKED' },
  ];

  const getFilteredEmails = () => {
    let filtered = displayEmails;
    
    if (selectedType !== 'all') {
      const type = selectedType === 'inapp' ? 'IN_APP' : 'API';
      filtered = filtered.filter(e => e.mailSentFrom === type);
    }
    
    if (selectedFolder !== 'All Emails') {
      const folder = folders.find(f => f.name === selectedFolder);
      if (folder?.status) {
        filtered = filtered.filter(e => e.status === folder.status);
      }

    }
    
    return filtered;
  };

  const handleFolderClick = async (folder: typeof folders[0]) => {
    setSelectedFolder(folder.name);
    
    // Fetch emails by status if folder has status
    if (folder.status) {
      await fetchEmailsByStatus(folder.status as EmailStatus, 50);
    } else {
      await fetchRecentEmails(50);
    }
  };

  const handleTypeChange = async (value: string) => {
    setSelectedType(value as any);
    
    if (value !== 'all') {
      const type = value === 'inapp' ? 'IN_APP' : 'API';
      await fetchEmailsByType(type as EmailFromType, 50);
    } else {
      await fetchRecentEmails(50);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecentEmails(50);
    setRefreshing(false);
  };

  const handleDeleteEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this email?')) {
      setDeletingIds(prev => [...prev, id]);
      await deleteEmail(id);
      setDeletingIds(prev => prev.filter(did => did !== id));
      toast({
        title: 'Success',
        description: 'Email deleted successfully'
      });
    }
  };

  const handleRetryEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await retryBouncedEmail(id);
    toast({
      title: 'Success',
      description: 'Email retry initiated'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    });
  };

  const downloadHtml = (email: Email) => {
    const blob = new Blob([email.bodyHtml || email.bodyText || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${email.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: EmailStatus) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-50 border-green-200';
      case 'OPENED': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'BOUNCED': return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'CLICKED': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatStatus = (status: EmailStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Recipients Dialog
  const RecipientsDialog = ({ email, open, onOpenChange }: { email: Email; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>All Recipients - {email.subject}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm font-medium">
                Total Recipients: {email.toEmails.length}
                {email.ccEmails.length > 0 && ` (CC: ${email.ccEmails.length})`}
                {email.bccEmails.length > 0 && ` (BCC: ${email.bccEmails.length})`}
              </span>
            </div>
            
            {/* To Recipients */}
            {email.toEmails.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">TO:</h4>
                <div className="space-y-2">
                  {email.toEmails.map((recipient, index) => (
                    <RecipientRow key={`to-${index}`} recipient={recipient} />
                  ))}
                </div>
              </div>
            )}

            {/* CC Recipients */}
            {email.ccEmails.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">CC:</h4>
                <div className="space-y-2">
                  {email.ccEmails.map((recipient, index) => (
                    <RecipientRow key={`cc-${index}`} recipient={recipient} />
                  ))}
                </div>
              </div>
            )}

            {/* BCC Recipients */}
            {email.bccEmails.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">BCC:</h4>
                <div className="space-y-2">
                  {email.bccEmails.map((recipient, index) => (
                    <RecipientRow key={`bcc-${index}`} recipient={recipient} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const RecipientRow = ({ recipient }: { recipient: string }) => (
    <div className="flex items-center justify-between p-2 bg-white rounded border hover:shadow-sm">
      <div className="flex items-center gap-2">
        <Mail size={14} className="text-gray-400" />
        <span className="text-sm">{recipient}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(recipient)}
      >
        <Copy size={14} />
      </Button>
    </div>
  );

  const filteredEmails = getFilteredEmails();

  return (
    <div className="space-y-6 ">
      {/* Fullscreen Preview Modal */}
      <Dialog open={fullscreenPreview} onOpenChange={setFullscreenPreview}>
        <DialogContent className="max-w-6xl w-full h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview - {selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 hidden-scrollbar overflow-auto ">
            {selectedEmail && (
              <iframe
                srcDoc={selectedEmail.bodyHtml || selectedEmail.bodyText || ''}
                className="w-full h-full border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipients Dialog */}
      {selectedEmail && (
        <RecipientsDialog
          email={selectedEmail}
          open={showAllRecipients}
          onOpenChange={setShowAllRecipients}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Email Manager
          </h1>
          <p style={{ color: '#666666' }}>
            Monitor, debug, and preview emails from in-app notifications and API calls
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="gap-2"
          disabled={refreshing || isLoading}
        >
          {refreshing || isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </Button>
      </motion.div>

      {/* Type Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTypeChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="gap-2">
            <Mail size={16} />
            All Emails
          </TabsTrigger>
          <TabsTrigger value="inapp" className="gap-2">
            <Send size={16} />
            In-App
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Globe size={16} />
            API
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 h-[calc(100vh-250px)]">
          {/* Sidebar - Folders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-2 overflow-y-auto pr-2"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.name}
                  onClick={() => handleFolderClick(folder)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                    selectedFolder === folder.name ? 'border-red-600 ring-1 ring-red-600' : ''
                  }`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: selectedFolder === folder.name ? '#DC143C' : '#E5E5E5',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color: '#666666' }} />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {folder.count}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Main Content - Email List and Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full"
          >
            {/* Email List Column */}
            <div 
              className="lg:col-span-1 space-y-2 hidden-scrollbar overflow-y-auto pr-2"
              style={{ maxHeight: 'calc(100vh - 250px)' }}
            >
              {isLoading && filteredEmails.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
              ) : filteredEmails.length === 0 ? (
                <div
                  className="text-center py-8 rounded-lg border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                  }}
                >
                  <Mail size={32} style={{ color: '#999999' }} className="mx-auto mb-2" />
                  <p style={{ color: '#999999' }}>No emails found</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEmail?.id === email.id ? 'border-red-600 ring-1 ring-red-600' : ''
                    }`}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: selectedEmail?.id === email.id ? '#DC143C' : '#E5E5E5',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {email.mailSentFrom === 'IN_APP' ? (
                          <Send size={14} />
                        ) : (
                          <Globe size={14} />
                        )}
                        <span className="text-xs font-medium">
                          {email.mailSentFrom === 'IN_APP' ? 'In-App' : 'API'}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(email.status)}`}>
                        {formatStatus(email.status)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{email.subject}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs text-gray-500 truncate flex-1">
                        To: {email.toEmails.length > 1 
                          ? `${email.toEmails[0]} +${email.toEmails.length - 1} more` 
                          : email.toEmails[0]}
                      </p>
                      {email.toEmails.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {email.toEmails.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(email.createdAt).toLocaleString()}
                      </p>
                      <div className="flex gap-1">
                        {email.status === 'BOUNCED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleRetryEmail(email.id, e)}
                          >
                            <RefreshCw size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => handleDeleteEmail(email.id, e)}
                          disabled={deletingIds.includes(email.id)}
                        >
                          {deletingIds.includes(email.id) ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Email Details Column */}
            <div 
              className="lg:col-span-2 hidden-scrollbar overflow-y-auto pl-2"
              style={{ maxHeight: 'calc(100vh - 250px)' }}
            >
              {selectedEmail ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                  }}
                >
                  {/* Header */}
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(selectedEmail.status)}>
                            {formatStatus(selectedEmail.status)}
                          </Badge>
                          <Badge variant="outline">
                            {selectedEmail.mailSentFrom === 'IN_APP' ? 'In-App' : 'API'}
                          </Badge>
                          {selectedEmail.source && (
                            <Badge variant="outline" className="text-xs">
                              Source: {selectedEmail.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadHtml(selectedEmail)}
                        >
                          <Download size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setFullscreenPreview(true)}
                        >
                          <Maximize2 size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Email Metadata */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <span className="ml-2 font-medium">
                          {selectedEmail.fromName ? `${selectedEmail.fromName} <${selectedEmail.fromEmail}>` : selectedEmail.fromEmail}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <div className="ml-2 inline-flex items-center gap-1">
                          <span className="font-medium">
                            {selectedEmail.toEmails.length > 1 
                              ? `${selectedEmail.toEmails[0]} +${selectedEmail.toEmails.length - 1} more`
                              : selectedEmail.toEmails[0]
                            }
                          </span>
                          {selectedEmail.toEmails.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setShowAllRecipients(true)}
                            >
                              <Users size={12} className="mr-1" />
                              View all ({selectedEmail.toEmails.length})
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2">{new Date(selectedEmail.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedEmail.deliveredAt && (
                        <div>
                          <span className="text-gray-500">Delivered:</span>
                          <span className="ml-2">{new Date(selectedEmail.deliveredAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedEmail.openedAt && (
                        <div>
                          <span className="text-gray-500">Opened:</span>
                          <span className="ml-2">{new Date(selectedEmail.openedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedEmail.openCount > 0 && (
                        <div>
                          <span className="text-gray-500">Opens:</span>
                          <span className="ml-2">{selectedEmail.openCount}</span>
                        </div>
                      )}
                      {selectedEmail.clickCount > 0 && (
                        <div>
                          <span className="text-gray-500">Clicks:</span>
                          <span className="ml-2">{selectedEmail.clickCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Preview Tabs */}
                    <Tabs defaultValue="html" className="mt-4" onValueChange={(v) => setPreviewMode(v as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html" className="gap-2">
                          <Eye size={14} />
                          HTML Preview
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="html" className="mt-4">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                            <span className="text-sm font-medium">HTML Preview</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setFullscreenPreview(true)}
                            >
                              <Maximize2 size={14} className="mr-1" />
                              Fullscreen
                            </Button>
                          </div>
                          <div className="p-4 max-h-96 overflow-auto">
                            {selectedEmail.bodyHtml ? (
                              <iframe
                                srcDoc={selectedEmail.bodyHtml}
                                className="w-full min-h-75 border-0"
                                title="Email HTML Preview"
                                sandbox="allow-same-origin"
                              />
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                No HTML content available
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      {/* <TabsContent value="raw" className="mt-4">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                            <span className="text-sm font-medium">Raw HTML</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(selectedEmail.bodyHtml || selectedEmail.bodyText || '')}
                            >
                              <Copy size={14} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <pre className="p-4 max-h-96 overflow-auto text-xs font-mono bg-gray-50">
                            {selectedEmail.bodyHtml || selectedEmail.bodyText || 'No content'}
                          </pre>
                        </div>
                      </TabsContent> */}

                    </Tabs>

                  </div>
                </motion.div>
              ) : (
                <div
                  className="text-center py-12 rounded-lg border flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                    minHeight: '500px'
                  }}
                >
                  <Mail size={48} style={{ color: '#999999' }} className="mx-auto mb-4" />
                  <p style={{ color: '#999999' }}>Select an email to view details</p>
                  <p className="text-xs mt-2" style={{ color: '#999999' }}>
                    Click on any email from the list to preview its content
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Tabs>
    </div>
  );
}