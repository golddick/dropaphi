"use client"

import { useDroppable } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"
import { Type } from "lucide-react"
import type { ReactNode } from "react"

interface DroppableCanvasProps {
  children: ReactNode
  isEmpty: boolean
}

export function DroppableCanvas({ children, isEmpty }: DroppableCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "email-canvas",
  })

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-96 bg-background border-2 border-dashed p-6 transition-colors ${
        isOver ? "border-red-400 bg-accent/5" : "border-red-200"
      }`}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Type className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-balance mb-2">Start Building Your Email</h3>
          <p className="text-sm text-muted-foreground text-pretty">
            Drag components from the left sidebar to start creating your email template.
          </p>
          {isOver && (
            <div className="mt-4 px-4 py-2 bg-accent/20 border border-accent rounded-md">
              <p className="text-sm text-red-500">Drop component here</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {children}
          {isOver && (
            <div className="h-12 bg-accent/10 border-2 border-dashed border-accent rounded-md flex items-center justify-center">
              <p className="text-sm text-accent-foreground">Drop here to add below</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
