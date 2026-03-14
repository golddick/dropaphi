    "use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/icons"
import { Upload } from "lucide-react"

interface LogoElementProps {
  id: string
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: any) => void
  properties?: {
    src?: string
    width?: number
    height?: number
    alignment?: "left" | "center" | "right"
    borderRadius?: number
  }
}

export function LogoElement({ id, isSelected, onSelect, onUpdate, properties = {} }: LogoElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempSrc, setTempSrc] = useState(properties.src || "")

  const width = properties.width || 120
  const height = properties.height || 60
  const alignment = properties.alignment || "center"
  const borderRadius = properties.borderRadius || 0

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        setTempSrc(src)
        onUpdate({ src })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = () => {
    if (tempSrc) {
      onUpdate({ src: tempSrc })
      setIsEditing(false)
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className={`flex ${alignmentClasses[alignment]} mb-3`}>
        {properties.src ? (
          <img
            src={properties.src || "/placeholder.svg"}
            alt="Logo"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              borderRadius: `${borderRadius}px`,
              objectFit: "contain",
            }}
            className="max-w-full"
          />
        ) : (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              borderRadius: `${borderRadius}px`,
            }}
            className="bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30"
          >
            <div className="text-center">
              <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Logo</p>
            </div>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="space-y-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              document.getElementById(`logo-upload-${id}`)?.click()
            }}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload Logo
          </Button>
          <input
            id={`logo-upload-${id}`}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
