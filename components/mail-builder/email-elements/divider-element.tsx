"use client"

interface DividerElementProps {
  id: string
  properties?: {
    color?: string
    thickness?: number
    style?: "solid" | "dashed" | "dotted"
    margin?: number
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

export function DividerElement({ id, properties = {}, isSelected, onSelect, onUpdate }: DividerElementProps) {
  const dividerStyle = {
    borderTopColor: properties.color || "#e5e5e5",
    borderTopWidth: `${properties.thickness || 1}px`,
    borderTopStyle: properties.style || "solid",
    margin: `${properties.margin || 16}px 0`,
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      <div className="w-full border-t" style={dividerStyle} />
    </div>
  )
}
