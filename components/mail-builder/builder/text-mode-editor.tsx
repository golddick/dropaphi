"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"

interface TextModeEditorProps {
  initialContent: string
  subject: string
  onSave: (content: string) => void
  onSubjectChange: (subject: string) => void
}

export function TextModeEditor({ initialContent, subject, onSave, onSubjectChange }: TextModeEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleSave = () => {
    onSave(content)
  }

  // Convert URLs to clickable links in preview and preserve emoji
  const renderPreview = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is a URL
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline break-all"
              >
                {part}
              </a>
            )
          }
          // Return regular text (including emoji)
          return <span key={index}>{part}</span>
        })}
      </>
    )
  }

  // Use subject from props if available, otherwise extract from content
  const bodyContent = content

  return (
    <div className="h-(calc[100vh-100]) flex flex-col bg-background">
      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 space-y-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="flex-1 overflow-hidden p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Type your email content here...

            Add subject line at the top, then your message below.

            You can add emojis and URLs. URLs will appear as clickable links in preview.

            Separate sections with blank lines for better readability."
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="mb-6 pb-6 flex gap-2 items-center border-b border-border">
              <p className="text-sm text-muted-foreground ">Subject:</p>
              <h1 className="text-2xl font-bold text-foreground">{subject || '(No subject)'}</h1>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-foreground whitespace-pre-wrap wrap-break-word">
                {bodyContent.split('\n').map((line, index) => (
                  <div key={index} className="mb-2 flex items-start">
                    {line.trim() === '' ? <br /> : renderPreview(line)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-border p-4 flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setContent("")}
        >
          Clear
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={handleSave}
          className="bg-red-500 hover:bg-red-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Switch to Visual
        </Button>
      </div>
    </div>
  )
}
