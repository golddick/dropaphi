"use client"

import { useSortable } from "@dnd-kit/sortable"
import { Icons } from "@/components/icons/icons"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"
import { GripVertical, Trash2 } from "lucide-react"

interface SortableElementProps {
  id: string
  children: ReactNode
  onDelete?: () => void
}

export function SortableElement({ id, children, onDelete }: SortableElementProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? "z-50 opacity-75" : ""}`}>
      {/* Drag handle and delete button */}
      <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing bg-transparent"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3" />
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}
