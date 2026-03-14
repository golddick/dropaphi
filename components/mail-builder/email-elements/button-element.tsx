"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ButtonElementProps {
  id: string
  content?: string
  properties?: {
    text?: string
    link?: string
    backgroundColor?: string
    textColor?: string
    alignment?: "left" | "center" | "right"
    size?: "sm" | "md" | "lg"
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

export function ButtonElement({
  id,
  content = "Click me",
  properties = {},
  isSelected,
  onSelect,
  onUpdate,
}: ButtonElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [buttonText, setButtonText] = useState(properties.text || content)
  const [buttonLink, setButtonLink] = useState(properties.link || "")

  const handleSave = () => {
    setIsEditing(false)
    onUpdate?.({
      text: buttonText,
      link: buttonLink,
      backgroundColor: properties.backgroundColor || "#000000",
      textColor: properties.textColor || "#ffffff",
      alignment: properties.alignment || "center",
      size: properties.size || "md",
    })
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  const sizeClass = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }[properties.size || "md"]

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input placeholder="Button text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
          <Input placeholder="Link URL (optional)" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={`flex w-full ${alignmentClass}`}>
          <button
            className={`${sizeClass} rounded-md font-medium transition-colors hover:opacity-90`}
            style={{
              backgroundColor: properties.backgroundColor || "#000000",
              color: properties.textColor || "#ffffff",
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {properties.text || content}
          </button>
        </div>
      )}
    </div>
  )
}
