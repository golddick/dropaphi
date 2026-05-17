// app/admin/contact-info/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, Mail } from 'lucide-react';
import { ContactInfo, useComplaintStore } from '@/lib/stores/complaint/complaint.store';

const contactTypes = [
  { value: 'EMAIL', label: 'Email', prefix: 'mailto:' },
  { value: 'DISCORD', label: 'Discord', prefix: '' },
  { value: 'TWITTER', label: 'Twitter', prefix: 'https://x.com/' },
  { value: 'GITHUB', label: 'GitHub', prefix: 'https://github.com/' },
  { value: 'OTHER', label: 'Other', prefix: '' },
];

// Helper to auto-generate href based on type and value
function generateHref(type: string, value: string): string {
  const typeConfig = contactTypes.find(t => t.value === type);
  const prefix = typeConfig?.prefix || '';
  
  if (type === 'EMAIL') {
    // Ensure email has mailto: prefix
    if (value.startsWith('mailto:')) {
      return value;
    }
    return `mailto:${value}`;
  }
  
  if (type === 'TWITTER') {
    // Remove @ if present and add prefix
    const cleanValue = value.replace(/^@/, '');
    return `${prefix}${cleanValue}`;
  }
  
  if (type === 'GITHUB') {
    // Remove trailing slash and add prefix
    const cleanValue = value.replace(/\/$/, '');
    return `${prefix}${cleanValue}`;
  }
  
  if (prefix && !value.startsWith(prefix)) {
    return `${prefix}${value}`;
  }
  
  return value;
}

export default function AdminContactInfoPage() {
  const { contactInfo, fetchContactInfo, createContactInfo, updateContactInfo, deleteContactInfo } = useComplaintStore();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContactInfo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'EMAIL',
    label: '',
    value: '',
    href: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });
  const [previewHref, setPreviewHref] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchContactInfo();
    setLoading(false);
  };

  // Update href preview when type or value changes
  useEffect(() => {
    if (form.type === 'EMAIL') {
      const emailValue = form.value;
      if (emailValue && !emailValue.startsWith('mailto:')) {
        setPreviewHref(`mailto:${emailValue}`);
      } else {
        setPreviewHref(emailValue);
      }
    } else if (form.type === 'TWITTER') {
      const cleanValue = form.value.replace(/^@/, '');
      setPreviewHref(`https://x.com/${cleanValue}`);
    } else if (form.type === 'GITHUB') {
      const cleanValue = form.value.replace(/\/$/, '');
      setPreviewHref(`https://github.com/${cleanValue}`);
    } else {
      setPreviewHref(form.value);
    }
  }, [form.type, form.value]);

  const handleTypeChange = useCallback((newType: string) => {
    const oldValue = form.value;
    let newValue = oldValue;
    
    // Clear previous prefixes when switching types
    if (newType === 'EMAIL') {
      // Remove any existing prefix
      newValue = oldValue.replace(/^(mailto:|https?:\/\/[^\s]+)/, '');
    } else if (newType === 'TWITTER') {
      newValue = oldValue.replace(/^(https?:\/\/x\.com\/|@)/, '');
    } else if (newType === 'GITHUB') {
      newValue = oldValue.replace(/^(https?:\/\/github\.com\/)/, '');
    }
    
    // Auto-generate href based on new type and value
    const autoHref = generateHref(newType, newValue);
    
    setForm(prev => ({
      ...prev,
      type: newType,
      value: newValue,
      href: autoHref,
    }));
  }, [form.value]);

  const handleValueChange = useCallback((newValue: string) => {
    // Auto-generate href based on current type and new value
    const autoHref = generateHref(form.type, newValue);
    
    setForm(prev => ({
      ...prev,
      value: newValue,
      href: autoHref,
    }));
  }, [form.type]);

  const handleHrefChange = useCallback((newHref: string) => {
    setForm(prev => ({
      ...prev,
      href: newHref,
    }));
  }, []);

  const handleSubmit = async () => {
    if (!form.label || !form.value) {
      toast.error('Please fill all required fields');
      return;
    }

    // Final href validation
    let finalHref = form.href;
    if (form.type === 'EMAIL' && !finalHref.startsWith('mailto:')) {
      finalHref = `mailto:${form.value}`;
    }

    const submitData = {
      type: form.type as 'EMAIL' | 'DISCORD' | 'TWITTER' | 'GITHUB' | 'OTHER',
      label: form.label,
      value: form.value,
      href: finalHref,
      description: form.description,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    if (editing) {
      await updateContactInfo(editing.id, submitData);
    } else {
      await createContactInfo(submitData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      type: 'EMAIL',
      label: '',
      value: '',
      href: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    });
    setPreviewHref('');
  };

  const handleEdit = (item: ContactInfo) => {
    setEditing(item);
    setForm({
      type: item.type,
      label: item.label,
      value: item.value,
      href: item.href,
      description: item.description || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setPreviewHref(item.href);
    setDialogOpen(true);
  };

  const handleToggleActive = async (item: ContactInfo) => {
    await updateContactInfo(item.id, { isActive: !item.isActive });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Information</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage contact channels displayed on the public contact page.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus size={15} /> Add Contact Channel
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactInfo.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No contact channels found. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              contactInfo.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>
                    <code className="text-xs">{item.value}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.description || '-'}
                  </TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleActive(item)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Contact Channel' : 'Add Contact Channel'}
            </DialogTitle>
            <DialogDescription>
              This will appear on the public contact page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., Email, Discord, Twitter"
              />
            </div>

            <div>
              <Label>Value *</Label>
              <Input
                value={form.value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={
                  form.type === 'EMAIL' ? 'support@example.com' :
                  form.type === 'TWITTER' ? '@dropaphi' :
                  form.type === 'GITHUB' ? 'username' :
                  'Enter value'
                }
              />
              {form.type === 'EMAIL' && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Mail size={10} className="inline mr-1" />
                  Will be automatically prefixed with <code className="text-xs">mailto:</code>
                </p>
              )}
              {form.type === 'TWITTER' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Will be automatically linked to <code className="text-xs">https://x.com/username</code>
                </p>
              )}
              {form.type === 'GITHUB' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Will be automatically linked to <code className="text-xs">https://github.com/username</code>
                </p>
              )}
            </div>

            <div>
              <Label>Href/Link *</Label>
              <Input
                value={form.href}
                onChange={(e) => handleHrefChange(e.target.value)}
                placeholder="URL or link"
              />
              {previewHref && previewHref !== form.href && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <LinkIcon size={10} />
                  Preview: <code className="text-xs">{previewHref}</code>
                </p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this contact channel"
                rows={2}
              />
            </div>

            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label className="cursor-pointer">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Channel</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The contact channel will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteContactInfo(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



