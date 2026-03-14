"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link, ImageIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface ImageElementProps {
  id: string
  properties?: {
    src?: string
    alt?: string
    width?: number
    height?: number
    alignment?: "left" | "center" | "right"
    borderRadius?: number
    opacity?: number
    rotation?: number
    objectFit?: "cover" | "contain" | "fill" | "scale-down"
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

export function ImageElement({ id, properties = {}, isSelected, onSelect, onUpdate }: ImageElementProps) {
  const [showUpload, setShowUpload] = useState(!properties.src)
  const [imageUrl, setImageUrl] = useState(properties.src || "")
  const [altText, setAltText] = useState(properties.alt || "")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = () => {
    if (imageUrl) {
      onUpdate?.({
        src: imageUrl,
        alt: altText,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
        objectFit: properties.objectFit || "cover",
      })
      setShowUpload(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      onUpdate?.({
        src: url,
        alt: altText || file.name,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
        objectFit: properties.objectFit || "cover",
      })
      setShowUpload(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImageUrl(url)
      onUpdate?.({
        src: url,
        alt: altText || imageFile.name,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
        objectFit: properties.objectFit || "cover",
      })
      setShowUpload(false)
    }
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  const imageStyle = {
    width: properties.width ? `${properties.width}px` : "auto",
    height: properties.height ? `${properties.height}px` : "auto",
    maxWidth: "100%",
    borderRadius: `${properties.borderRadius || 0}px`,
    opacity: (properties.opacity || 100) / 100,
    transform: `rotate(${properties.rotation || 0}deg)`,
    objectFit: properties.objectFit || "cover",
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {showUpload || !properties.src ? (
        <div className="space-y-3" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="flex items-center justify-center h-32 bg-muted rounded-md border-2 border-dashed border-border hover:border-accent transition-colors">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Add an image</p>
              <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
            </div>
          </div>
          <div className="space-y-2">
            <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Input placeholder="Alt text (optional)" value={altText} onChange={(e) => setAltText(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleImageUpload} disabled={!imageUrl}>
                <Link className="w-3 h-3 mr-1" />
                Add Image
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3 h-3 mr-1" />
                Upload File
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`flex ${alignmentClass}`}>
            <div className="relative group">
              <img
                src={properties.src || "/placeholder.svg"}
                alt={properties.alt || "Email image"}
                style={imageStyle}
                onDoubleClick={() => setShowUpload(true)}
              />
              {isSelected && (
                <div className="absolute inset-0 border-2 border-accent rounded-md pointer-events-none">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            Configure Image
          </Button>
          {isConfiguring && (
            <div className="space-y-2 p-2 bg-muted rounded">
              <div>
                <label className="text-xs font-medium">Width: {properties.width}px</label>
                <Slider
                  value={[properties.width || 400]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
                  max={600}
                  min={100}
                  step={10}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Height: {properties.height}px</label>
                <Slider
                  value={[properties.height || 200]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
                  max={400}
                  min={50}
                  step={10}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Border Radius: {properties.borderRadius || 0}px</label>
                <Slider
                  value={[properties.borderRadius || 0]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, borderRadius: value })}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Object Fit</label>
                <Select
                  value={properties.objectFit || "cover"}
                  onValueChange={(value) => onUpdate?.({ ...properties, objectFit: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="scale-down">Scale Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
