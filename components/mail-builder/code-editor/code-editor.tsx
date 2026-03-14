"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download, Eye } from "lucide-react"

interface CodeEditorProps {
  html: string
  onHTMLChange: (html: string) => void
  onPreview: () => void
}

export function CodeEditor({ html, onHTMLChange, onPreview }: CodeEditorProps) {
  const [code, setCode] = useState(html)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCode(html)
  }, [html])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    onHTMLChange(newCode)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const downloadHTML = () => {
    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h3 className="text-sm font-medium">HTML Code</h3>
          <p className="text-xs text-muted-foreground">Edit your email template code directly</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="w-3 h-3 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadHTML}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        </div> */}
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="w-full h-full p-4 font-mono text-sm bg-background border-0 resize-none focus:outline-none"
            placeholder="Your HTML code will appear here..."
            spellCheck={false}
          />
          {/* Line numbers */}
          <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
            <div className="font-mono text-sm text-muted-foreground/50 leading-normal">
              {code.split("\n").map((_, index) => (
                <div key={index} className="text-right pr-2 min-w-8">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
          <style jsx>{`
            textarea {
              padding-left: 3rem !important;
            }
          `}</style>
        </div>

        {/* Live Preview */}
        <div className="w-1/2 border-l border-border">
          <div className="p-4 border-b border-border bg-muted/50">
            <h4 className="text-sm font-medium">Live Preview</h4>
            <p className="text-xs text-muted-foreground">See how your email will look</p>
          </div>
          <div className="h-full overflow-auto bg-white">
            <iframe
              srcDoc={code}
              className="w-full h-full border-0"
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
