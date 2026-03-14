"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MousePointer, Palette, Type, Layout, Link, Video, ImageIcon } from "lucide-react"
import { EmojiPicker } from "@/components/emoji-picker/emoji-picker"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface PropertiesPanelProps {
  selectedElement: EmailElement | null
  onUpdate: (updates: any) => void
}

const fontOptions = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Palatino, serif", label: "Palatino" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Bookman, serif", label: "Bookman" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans MS" },
]

export function PropertiesPanel({ selectedElement, onUpdate }: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <MousePointer className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          Select an element from the canvas to view and edit its properties.
        </p>
      </div>
    )
  }

  const props = selectedElement.properties || {}

  const handlePropertyChange = (key: string, value: any) => {
    onUpdate({ [key]: value })
  }

  const renderTextProperties = () => (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4" />
          <h3 className="text-sm font-medium">Text Content</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Content</Label>
            <textarea
              className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-input resize-none"
              rows={3}
              value={selectedElement.content || ""}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter your text..."
            />
            <div className="mt-2">
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  const currentContent = selectedElement.content || ""
                  onUpdate({ content: currentContent + emoji })
                }}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Font Family</Label>
            <Select
              value={props.fontFamily || "Arial, sans-serif"}
              onValueChange={(value) => handlePropertyChange("fontFamily", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Font Size</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.fontSize || 16]}
                onValueChange={([value]) => handlePropertyChange("fontSize", value)}
                max={48}
                min={12}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.fontSize || 16}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Line Height</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.lineHeight || 1.5]}
                onValueChange={([value]) => handlePropertyChange("lineHeight", value)}
                max={3}
                min={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.lineHeight || 1.5}</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.color || "#000000"}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.color || "#000000"}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4" />
          <h3 className="text-sm font-medium">Layout & Formatting</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={props.alignment || "left"}
              onValueChange={(value) => handlePropertyChange("alignment", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={props.bold ? "default" : "outline"}
              onClick={() => handlePropertyChange("bold", !props.bold)}
              className="flex-1"
            >
              Bold
            </Button>
            <Button
              size="sm"
              variant={props.italic ? "default" : "outline"}
              onClick={() => handlePropertyChange("italic", !props.italic)}
              className="flex-1"
            >
              Italic
            </Button>
          </div>
          <Button
            size="sm"
            variant={props.underline ? "default" : "outline"}
            onClick={() => handlePropertyChange("underline", !props.underline)}
            className="w-full"
          >
            Underline
          </Button>
          <div>
            <Label className="text-xs">Link URL (optional)</Label>
            <Input
              value={props.link || ""}
              onChange={(e) => handlePropertyChange("link", e.target.value)}
              className="mt-1"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </Card>
    </>
  )

  const renderImageProperties = () => (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-4 h-4" />
          <h3 className="text-sm font-medium">Image Settings</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input
              value={props.src || ""}
              onChange={(e) => handlePropertyChange("src", e.target.value)}
              className="mt-1"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label className="text-xs">Alt Text</Label>
            <Input
              value={props.alt || ""}
              onChange={(e) => handlePropertyChange("alt", e.target.value)}
              className="mt-1"
              placeholder="Describe the image"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={props.width || ""}
                onChange={(e) => handlePropertyChange("width", Number.parseInt(e.target.value) || undefined)}
                className="mt-1"
                placeholder="400"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={props.height || ""}
                onChange={(e) => handlePropertyChange("height", Number.parseInt(e.target.value) || undefined)}
                className="mt-1"
                placeholder="200"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-medium">Styling</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Border Radius</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.borderRadius || 0]}
                onValueChange={([value]) => handlePropertyChange("borderRadius", value)}
                max={50}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.borderRadius || 0}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Opacity</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.opacity || 100]}
                onValueChange={([value]) => handlePropertyChange("opacity", value)}
                max={100}
                min={0}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.opacity || 100}%</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Rotation</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.rotation || 0]}
                onValueChange={([value]) => handlePropertyChange("rotation", value)}
                max={360}
                min={-360}
                step={15}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.rotation || 0}°</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={props.alignment || "center"}
              onValueChange={(value) => handlePropertyChange("alignment", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </>
  )

  const renderVideoProperties = () => (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4" />
          <h3 className="text-sm font-medium">Video Settings</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Video URL</Label>
            <Input
              value={props.src || ""}
              onChange={(e) => handlePropertyChange("src", e.target.value)}
              className="mt-1"
              placeholder="https://example.com/video.mp4"
            />
          </div>
          <div>
            <Label className="text-xs">Poster Image URL</Label>
            <Input
              value={props.poster || ""}
              onChange={(e) => handlePropertyChange("poster", e.target.value)}
              className="mt-1"
              placeholder="https://example.com/poster.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={props.width || ""}
                onChange={(e) => handlePropertyChange("width", Number.parseInt(e.target.value) || undefined)}
                className="mt-1"
                placeholder="560"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={props.height || ""}
                onChange={(e) => handlePropertyChange("height", Number.parseInt(e.target.value) || undefined)}
                className="mt-1"
                placeholder="315"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={props.controls ? "default" : "outline"}
              onClick={() => handlePropertyChange("controls", !props.controls)}
              className="flex-1"
            >
              Show Controls
            </Button>
            <Button
              size="sm"
              variant={props.autoplay ? "default" : "outline"}
              onClick={() => handlePropertyChange("autoplay", !props.autoplay)}
              className="flex-1"
            >
              Autoplay
            </Button>
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={props.alignment || "center"}
              onValueChange={(value) => handlePropertyChange("alignment", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </>
  )

  const renderSocialProperties = () => (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-4 h-4" />
          <h3 className="text-sm font-medium">Social Media</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Social Links</Label>
            <p className="text-xs text-muted-foreground mt-1">{props.links?.length || 0} link(s) configured</p>
          </div>
          <div>
            <Label className="text-xs">Style</Label>
            <Select value={props.style || "icons"} onValueChange={(value) => handlePropertyChange("style", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icons">Icons Only</SelectItem>
                <SelectItem value="buttons">Buttons with Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-medium">Customization</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Icon Size</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.iconSize || 20]}
                onValueChange={([value]) => handlePropertyChange("iconSize", value)}
                max={48}
                min={16}
                step={2}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.iconSize || 20}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Icon Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.iconColor || "#666666"}
                onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.iconColor || "#666666"}
                onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#666666"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.backgroundColor || "#666666"}
                onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.backgroundColor || "#666666"}
                onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#666666"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Border Radius</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.borderRadius || 8]}
                onValueChange={([value]) => handlePropertyChange("borderRadius", value)}
                max={25}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.borderRadius || 8}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={props.alignment || "center"}
              onValueChange={(value) => handlePropertyChange("alignment", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </>
  )

  const renderButtonProperties = () => (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MousePointer className="w-4 h-4" />
          <h3 className="text-sm font-medium">Button Settings</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Button Text</Label>
            <Input
              value={props.text || selectedElement.content || ""}
              onChange={(e) => handlePropertyChange("text", e.target.value)}
              className="mt-1"
              placeholder="Click me"
            />
          </div>
          <div>
            <Label className="text-xs">Link URL</Label>
            <Input
              value={props.link || ""}
              onChange={(e) => handlePropertyChange("link", e.target.value)}
              className="mt-1"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label className="text-xs">Size</Label>
            <Select value={props.size || "md"} onValueChange={(value) => handlePropertyChange("size", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-medium">Styling</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.backgroundColor || "#000000"}
                onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.backgroundColor || "#000000"}
                onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.textColor || "#ffffff"}
                onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.textColor || "#ffffff"}
                onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Border Width</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.borderWidth || 0]}
                onValueChange={([value]) => handlePropertyChange("borderWidth", value)}
                max={10}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.borderWidth || 0}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Border Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={props.borderColor || "#000000"}
                onChange={(e) => handlePropertyChange("borderColor", e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <Input
                value={props.borderColor || "#000000"}
                onChange={(e) => handlePropertyChange("borderColor", e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Border Radius</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[props.borderRadius || 4]}
                onValueChange={([value]) => handlePropertyChange("borderRadius", value)}
                max={50}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{props.borderRadius || 4}px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={props.alignment || "center"}
              onValueChange={(value) => handlePropertyChange("alignment", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </>
  )

  const renderDividerProperties = () => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="w-4 h-4" />
        <h3 className="text-sm font-medium">Divider Settings</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Style</Label>
          <Select value={props.style || "solid"} onValueChange={(value) => handlePropertyChange("style", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={props.color || "#e5e5e5"}
              onChange={(e) => handlePropertyChange("color", e.target.value)}
              className="w-8 h-8 border border-border rounded cursor-pointer"
            />
            <Input
              value={props.color || "#e5e5e5"}
              onChange={(e) => handlePropertyChange("color", e.target.value)}
              className="flex-1 text-xs"
              placeholder="#e5e5e5"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Thickness</Label>
          <div className="flex items-center gap-2 mt-1">
            <Slider
              value={[props.thickness || 1]}
              onValueChange={([value]) => handlePropertyChange("thickness", value)}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{props.thickness || 1}px</span>
          </div>
        </div>
        <div>
          <Label className="text-xs">Margin</Label>
          <div className="flex items-center gap-2 mt-1">
            <Slider
              value={[props.margin || 16]}
              onValueChange={([value]) => handlePropertyChange("margin", value)}
              max={48}
              min={0}
              step={4}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{props.margin || 16}px</span>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderColumnsProperties = () => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="w-4 h-4" />
        <h3 className="text-sm font-medium">Columns Layout</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Number of Columns</Label>
          <Select
            value={String(props.columns || 2)}
            onValueChange={(value) => handlePropertyChange("columns", Number.parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Gap Between Columns</Label>
          <div className="flex items-center gap-2 mt-1">
            <Slider
              value={[props.gap || 16]}
              onValueChange={([value]) => handlePropertyChange("gap", value)}
              max={48}
              min={0}
              step={4}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{props.gap || 16}px</span>
          </div>
        </div>
        <div>
          <Label className="text-xs">Vertical Alignment</Label>
          <Select value={props.alignment || "top"} onValueChange={(value) => handlePropertyChange("alignment", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )

  const renderLogoProperties = () => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4" />
        <h3 className="text-sm font-medium">Logo Settings</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Logo URL</Label>
          <Input
            value={props.src || ""}
            onChange={(e) => handlePropertyChange("src", e.target.value)}
            className="mt-1"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={props.width || ""}
              onChange={(e) => handlePropertyChange("width", Number.parseInt(e.target.value) || undefined)}
              className="mt-1"
              placeholder="120"
            />
          </div>
          <div>
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={props.height || ""}
              onChange={(e) => handlePropertyChange("height", Number.parseInt(e.target.value) || undefined)}
              className="mt-1"
              placeholder="60"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Alignment</Label>
          <Select
            value={props.alignment || "center"}
            onValueChange={(value) => handlePropertyChange("alignment", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Border Radius</Label>
          <div className="flex items-center gap-2 mt-1">
            <Slider
              value={[props.borderRadius || 0]}
              onValueChange={([value]) => handlePropertyChange("borderRadius", value)}
              max={50}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{props.borderRadius || 0}px</span>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-4">
      {/* Element Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Element Info</h3>
          <Badge variant="secondary" className="text-xs">
            {selectedElement.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">ID: {selectedElement.id}</p>
      </Card>

      <Separator />

      {/* Type-specific properties */}
      {selectedElement.type === "text" && renderTextProperties()}
      {selectedElement.type === "image" && renderImageProperties()}
      {selectedElement.type === "video" && renderVideoProperties()}
      {selectedElement.type === "button" && renderButtonProperties()}
      {selectedElement.type === "social" && renderSocialProperties()}
      {selectedElement.type === "divider" && renderDividerProperties()}
      {selectedElement.type === "columns" && renderColumnsProperties()}
      {selectedElement.type === "logo" && renderLogoProperties()}
    </div>
  )
}
