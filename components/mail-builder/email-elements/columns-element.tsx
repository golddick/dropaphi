"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/icons/icons"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ImageElement } from "./image-element"
import { ButtonElement } from "./button-element"
import { DividerElement } from "./divider-element"
import { VideoElement } from "./video-element"
import type { ReactNode } from "react"
import { TextElement } from "./text.element"
import { SocialElement } from "./soscial-element"
import { SortableElement } from "../drag-drop/sortable-element"
import { Plus } from "lucide-react"

interface ColumnsElementProps {
  id: string
  properties?: {
    columns?: number
    gap?: number
    alignment?: "top" | "center" | "bottom"
    columnElements?: Array<Array<{ id: string; type: string; content?: string; properties?: any }>>
  }
  children?: ReactNode[]
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

export function ColumnsElement({
  id,
  properties = {},
  children = [],
  isSelected,
  onSelect,
  onUpdate,
}: ColumnsElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const columnCount = properties.columns || 2
  const gap = properties.gap || 16
  const alignment = properties.alignment || "top"
  const columnElements = properties.columnElements || Array(columnCount).fill([])

  const alignmentClass = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
  }[alignment]

  const handleColumnCountChange = (newCount: string) => {
    const count = Number.parseInt(newCount)
    const newColumnElements = Array(count)
      .fill([])
      .map((_, index) => columnElements[index] || [])
    onUpdate?.({
      columns: count,
      gap,
      alignment,
      columnElements: newColumnElements,
    })
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const addElementToColumn = (columnIndex: number, elementType: string) => {
    const newElement = {
      id: `${elementType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      content: elementType === "text" ? "Sample text" : elementType === "button" ? "Click me" : undefined,
      properties: {
        ...(elementType === "button" && {
          backgroundColor: "#000000",
          textColor: "#ffffff",
          alignment: "center",
          size: "md",
        }),
        ...(elementType === "image" && {
          alignment: "center",
          borderRadius: 0,
          opacity: 100,
        }),
        ...(elementType === "social" && {
          alignment: "center",
          iconSize: 20,
          borderRadius: 8,
        }),
      },
    }

    const newColumnElements = [...columnElements]
    newColumnElements[columnIndex] = [...(newColumnElements[columnIndex] || []), newElement]

    onUpdate?.({
      columns: columnCount,
      gap,
      alignment,
      columnElements: newColumnElements,
    })
  }

  const updateColumnElement = (columnIndex: number, elementId: string, updates: any) => {
    const newColumnElements = [...columnElements]
    newColumnElements[columnIndex] = newColumnElements[columnIndex].map((el: any) =>
      el.id === elementId ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
    )
    onUpdate?.({
      columns: columnCount,
      gap,
      alignment,
      columnElements: newColumnElements,
    })
  }

  const deleteColumnElement = (columnIndex: number, elementId: string) => {
    const newColumnElements = [...columnElements]
    newColumnElements[columnIndex] = newColumnElements[columnIndex].filter((el: any) => el.id !== elementId)
    onUpdate?.({
      columns: columnCount,
      gap,
      alignment,
      columnElements: newColumnElements,
    })
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Number of Columns</label>
            <Select value={columnCount.toString()} onValueChange={handleColumnCountChange}>
              <SelectTrigger>
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
            <label className="text-sm font-medium mb-2 block">Gap: {gap}px</label>
            <Slider
              value={[gap]}
              onValueChange={([value]) => onUpdate?.({ ...properties, gap: value })}
              max={40}
              min={0}
              step={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Alignment</label>
            <Select value={alignment} onValueChange={(value) => onUpdate?.({ ...properties, alignment: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleSave}>
            Done
          </Button>
        </div>
      ) : (
        <div className={`flex ${alignmentClass}`} style={{ gap: `${gap}px` }}>
          {Array.from({ length: columnCount }, (_, index) => (
            <ColumnDropZone
              key={index}
              columnIndex={index}
              elements={columnElements[index] || []}
              onAddElement={(elementType) => addElementToColumn(index, elementType)}
              onUpdateElement={(elementId, updates) => updateColumnElement(index, elementId, updates)}
              onDeleteElement={(elementId) => deleteColumnElement(index, elementId)}
              onEditColumns={() => setIsEditing(true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ColumnDropZone({
  columnIndex,
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onEditColumns,
}: {
  columnIndex: number
  elements: any[]
  onAddElement: (elementType: string) => void
  onUpdateElement: (elementId: string, updates: any) => void
  onDeleteElement: (elementId: string) => void
  onEditColumns: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnIndex}`,
    data: {
      type: "column",
      columnIndex,
    },
  })

  const renderColumnElement = (element: any) => {
    const commonProps = {
      id: element.id,
      isSelected: false,
      onSelect: () => {},
      onUpdate: (updates: any) => onUpdateElement(element.id, updates),
      properties: element.properties,
    }

    const elementComponent = (() => {
      switch (element.type) {
        case "text":
          return <TextElement key={element.id} {...commonProps} content={element.content} />
        case "image":
          return <ImageElement key={element.id} {...commonProps} />
        case "video":
          return <VideoElement key={element.id} {...commonProps} />
        case "button":
          return <ButtonElement key={element.id} {...commonProps} content={element.content} />
        case "social":
          return <SocialElement key={element.id} {...commonProps} />
        case "divider":
          return <DividerElement key={element.id} {...commonProps} />
        default:
          return null
      }
    })()

    return (
      <SortableElement key={element.id} id={element.id} onDelete={() => onDeleteElement(element.id)}>
        {elementComponent}
      </SortableElement>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-30 border-2 border-dashed rounded-md p-4 transition-colors ${
        isOver ? "border-accent bg-accent/10" : "border-muted"
      }`}
    >
      <div className="space-y-2">
        {elements.length > 0 ? (
          <SortableContext items={elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
            {elements.map((element: any) => renderColumnElement(element))}
          </SortableContext>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm mb-2">Column {columnIndex + 1}</p>
            <p className="text-xs mb-2">Drag elements here</p>
            <div className="flex flex-wrap gap-1 justify-center">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddElement("text")
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddElement("image")
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Image
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddElement("button")
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Button
              </Button>
            </div>
          </div>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full mt-2 h-6 text-xs"
        onClick={(e) => {
          e.stopPropagation()
          onEditColumns()
        }}
      >
        Configure
      </Button>
    </div>
  )
}
