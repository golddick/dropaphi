"use client"

import { useState } from "react"
import { useEmailStore } from "@/lib/stores/email"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Plus, Trash2, Search, FileEdit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface TemplateLibraryProps {
  onSelect: (template: any) => void
}

export function TemplateLibrary({ onSelect }: TemplateLibraryProps) {
  const { templates, isLoading, deleteTemplate } = useEmailStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id)
      } catch (error) {
        // Error handled by store
      }
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        {isLoading && templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading your templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Mail className="h-8 w-8 mb-4 opacity-20" />
            <p className="text-sm">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="group cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                onClick={() => onSelect(template)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-semibold truncate pr-8">
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/50">
                      {template.id.split('_')[0]}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs truncate">
                    {template.subject}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between items-center bg-muted/5 group-hover:bg-primary/5 transition-colors">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: {template.id}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(e, template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
