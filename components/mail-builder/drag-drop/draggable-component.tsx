"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"

interface DraggableComponentProps {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  category: string
  collapsed?: boolean
  onClick?: () => void
}

export function DraggableComponent({ id, icon: Icon, label, category, collapsed = false, onClick }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      type: id,
      label: label,
      category: category,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  if (collapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className={`p-2 hidden-scrollbar bg-sidebar-accent hover:bg-sidebar-accent/80 rounded transition-colors ${
          isDragging ? "opacity-50 z-50" : ""
        } ${onClick ? "cursor-pointer hover:bg-sidebar-accent/90" : "cursor-grab active:cursor-grabbing"}`}
        title={label}
      >
        <Icon className="w-5 h-5 text-sidebar-primary mx-auto" />
      </div>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`p-3 bg-sidebar-accent hidden-scrollbar hover:bg-sidebar-accent/80 border-sidebar-border transition-colors ${
        isDragging ? "opacity-50 z-50" : ""
      } ${onClick ? "cursor-pointer hover:bg-sidebar-accent/90" : "cursor-grab active:cursor-grabbing"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-sidebar-primary" />
        <span className="text-sm text-sidebar-foreground">{label}</span>
      </div>
    </Card>
  )
}
