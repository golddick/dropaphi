"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons/icons"
import { ArrowLeft, ArrowRight, Code, Download, Eye, Folder, Layout, LayoutTemplate, Mail, Send, Type } from "lucide-react"

interface EmailBuilderHeaderProps {
  subject: string
  onSubjectChange: (subject: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onSaveTemplate: () => void
  mode: "visual" | "code" | "text"
  onModeChange: (mode: "visual" | "code" | "text") => void
  onExport?: () => void
  onPreview?: () => void
  onSend?: () => void
  onSelectCampaign?: () => void
  selectedCampaign?: { id: string; name: string }
}

export function EmailBuilderHeader({
  subject,
  onSubjectChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  mode,
  onModeChange,
  onSaveTemplate,
  onExport,
  onPreview,
  onSend,
  onSelectCampaign,
  selectedCampaign,
}: EmailBuilderHeaderProps) {
  return (
    <header className="w-full bg-white border-none sticky top-0 z-10">
      <div className="flex flex-col w-full gap-3  sm:p-4 md:flex-row md:items-center md:justify-between">

        {/* Center section: Subject Input */}
        <div className="flex-1 w-full p-4 md:p-0 md:max-w-md mx-auto md:mx-0">
          <div className="flex border  w-full  items-center gap-2  rounded-lg px-3 py-2">
            <Mail className="w-4 h-4  text-muted-foreground shrink-0" />
            <Input
              type="text"
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="border-none w-full bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Right section: Controls */}
        <div className="flex  justify-between  p-4 md:p-0  flex-wrap items-center gap-2">
          {/* Undo/Redo buttons */}
          <div className=" gap-1 flex border-r border-border pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Mode toggle buttons */}
          <div className="flex gap-1 border-r border-border pr-2">
            <Button
              size="sm"
              variant={mode === "visual" ? "default" : "ghost"}
              onClick={() => onModeChange("visual")}
              title="Visual Editor"
              className="h-8 px-2 text-xs"
            >
              <Layout className="w-4 h-4 mr-1" />
              <span className=" ">Visual</span>
            </Button>
            <Button
              size="sm"
              variant={mode === "text" ? "default" : "ghost"}
              onClick={() => onModeChange("text")}
              title="Text Editor"
              className="h-8 px-2 text-xs"
            >
              <Type className="w-4 h-4 mr-1" />
              <span className=" ">Text</span>
            </Button>
            <Button
              size="sm"
              variant={mode === "code" ? "default" : "ghost"}
              onClick={() => onModeChange("code")}
              title="Code Editor"
              className="h-8 px-2 text-xs hidden md:flex"
            >
              <Code className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Code</span>
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            {onPreview && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPreview}
                title="Preview Email"
                className="h-8 hidden lg:flex px-2 text-xs"
              >
                <Eye className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            )}
            {onExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                title="Export"
                className="h-8 hidden lg:flex px-2 text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
            {
              onSaveTemplate && (
                <Button
                size="sm"
                onClick={onSaveTemplate}
                title="Save Template"
                className="h-8 px-2 text-xs"
              >
                <LayoutTemplate className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Save Template</span>
              </Button>

              )
            }
            {onSelectCampaign && (
              <Button
                size="sm"
                variant={selectedCampaign ? "default" : "outline"}
                onClick={onSelectCampaign}
                title="Select Campaign"
                className="h-8 px-2 text-xs"
              >
                <Folder className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline"> Campaign</span>
              </Button>
            )}
            {onSend && (
              <Button
                size="sm"
                variant="default"
                onClick={onSend}
                title="Send Email"
                className="h-8 px-2 text-xs bg-red-500 hover:bg-red-600"
              >
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Send</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
