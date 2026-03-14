"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/icons"
import { Download, Send, X } from "lucide-react"

interface EmailPreviewProps {
  isOpen: boolean
  onClose: () => void
  html: string
  subject: string
}

export function EmailPreview({ isOpen, onClose, html, subject }: EmailPreviewProps) {
  const downloadHTML = () => {
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendTestEmail = () => {
    console.log("[v0] Sending test email with HTML:", html)
    // In a real implementation, this would send the email via API
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle>Email Preview</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Subject: {subject}</p>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={downloadHTML}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div> */}
        </DialogHeader>

        <div className="flex-1 border border-border rounded-md overflow-hidden bg-white">
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
