"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Link, AlignLeft, AlignCenter, AlignRight, Underline, Palette, List } from "lucide-react"
import { EmojiPicker } from "@/components/emoji-picker/emoji-picker"

interface RichTextSpan {
  text: string
  color?: string
  link?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

interface TextElementProps {
  id: string
  content?: string
  richContent?: RichTextSpan[]
  properties?: {
    fontSize?: number
    fontFamily?: string
    color?: string
    alignment?: "left" | "center" | "right"
    bold?: boolean
    italic?: boolean
    underline?: boolean
    link?: string
    lineHeight?: number
    bulletPoints?: boolean
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
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

export function TextElement({
  id,
  content = "Click to edit text",
  richContent = [],
  properties = {},
  isSelected,
  onSelect,
  onUpdate,
}: TextElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [highlightColor, setHighlightColor] = useState("#ff0000")
  const [linkUrl, setLinkUrl] = useState("")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selected = editContent.substring(start, end)

      setSelectedText(selected)
      setSelectionStart(start)
      setSelectionEnd(end)
    }
  }

  const applyHighlight = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const highlighted = `<span style="color: ${highlightColor}">${selectedText}</span>`

      const newContent = before + highlighted + after
      setEditContent(newContent)
      setShowColorPicker(false)
    }
  }

  const applyLink = () => {
    if (selectedText && linkUrl && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const linked = `<a href="${linkUrl}" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`

      const newContent = before + linked + after
      setEditContent(newContent)
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    onUpdate?.({ content: editContent })
  }

  const textStyle = {
    fontSize: `${properties.fontSize || 16}px`,
    fontFamily: properties.fontFamily || "Arial, sans-serif",
    color: properties.color || "#000000",
    textAlign: properties.alignment || ("left" as const),
    fontWeight: properties.bold ? "bold" : "normal",
    fontStyle: properties.italic ? "italic" : "normal",
    textDecoration: properties.underline ? "underline" : "none",
    lineHeight: properties.lineHeight || 1.5,
    whiteSpace: "pre-wrap" as const,
  }

 const toggleFormat = (format: string) => {
    const newProperties = { ...properties }
    ;(newProperties as any)[format] = !(properties as any)[format]
    onUpdate?.(newProperties)
  }

  const renderContent = () => {
    if (properties.bulletPoints) {
      const lines = content.split("\n").filter((line) => line.trim())
      return (
        <ul style={{ ...textStyle, paddingLeft: "20px" }}>
          {lines.map((line, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </ul>
      )
    }
    return <div style={textStyle} dangerouslySetInnerHTML={{ __html: content }} />
  }

  // Fixed: Insert emoji at cursor position in editContent
  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart || editContent.length
      const before = editContent.substring(0, cursorPos)
      const after = editContent.substring(cursorPos)
      const newContent = before + emoji + after
      
      setEditContent(newContent)
      
      // Restore focus and set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newPos = cursorPos + emoji.length
          textareaRef.current.setSelectionRange(newPos, newPos)
        }
      }, 0)
    } else {
      // Fallback if no textarea ref
      setEditContent(editContent + emoji)
    }
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-2 bg-muted rounded-md flex-wrap">
            <Select
              value={properties.fontFamily || "Arial, sans-serif"}
              onValueChange={(value) => onUpdate?.({ ...properties, fontFamily: value })}
            >
              <SelectTrigger className="w-40 h-8">
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
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={properties.bold ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => toggleFormat("bold")}
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.italic ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => toggleFormat("italic")}
            >
              <Italic className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.underline ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => toggleFormat("underline")}
            >
              <Underline className="w-3 h-3" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={properties.bulletPoints ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => toggleFormat("bulletPoints")}
              title="Toggle bullet points"
            >
              <List className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={showColorPicker ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={!selectedText}
            >
              <Palette className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={showLinkInput ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setShowLinkInput(!showLinkInput)}
              disabled={!selectedText}
            >
              <Link className="w-3 h-3" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={properties.alignment === "left" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "left" })}
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.alignment === "center" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "center" })}
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.alignment === "right" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "right" })}
            >
              <AlignRight className="w-3 h-3" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            {/* Fixed EmojiPicker with proper sizing and handler */}
            <div className="h-8">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>

          {showColorPicker && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <span className="text-sm">Highlight selected text</span>
              <Button size="sm" onClick={applyHighlight}>
                Apply
              </Button>
            </div>
          )}
 
          {showLinkInput && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <Input
                type="url"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={applyLink}>
                Apply Link
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Select text to highlight or add links. Press Enter for line breaks.
            </p>
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onSelect={handleTextSelection}
              className="w-full p-3 text-sm border border-border rounded-md bg-input resize-none"
              style={{ fontFamily: properties.fontFamily || "Arial, sans-serif" }}
              rows={4}
              autoFocus
            />
          </div>

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
        <div onDoubleClick={() => setIsEditing(true)} className="min-h-6">
          {renderContent()}
        </div>
      )}
    </div>
  )
}













// "use client"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Bold, Italic, Link, AlignLeft, AlignCenter, AlignRight, Underline, Palette, List } from "lucide-react"
// import { EmojiPicker } from "@/components/emoji-picker/emoji-picker"

// interface RichTextSpan {
//   text: string
//   color?: string
//   link?: string
//   bold?: boolean
//   italic?: boolean
//   underline?: boolean
// }

// interface TextElementProps {
//   id: string
//   content?: string
//   richContent?: RichTextSpan[]
//   properties?: {
//     fontSize?: number
//     fontFamily?: string
//     color?: string
//     alignment?: "left" | "center" | "right"
//     bold?: boolean
//     italic?: boolean
//     underline?: boolean
//     link?: string
//     lineHeight?: number
//     bulletPoints?: boolean
//   }
//   isSelected?: boolean
//   onSelect?: () => void
//   onUpdate?: (properties: any) => void
// }

// const fontOptions = [
//   { value: "Arial, sans-serif", label: "Arial" },
//   { value: "Helvetica, sans-serif", label: "Helvetica" },
//   { value: "Georgia, serif", label: "Georgia" },
//   { value: "Times New Roman, serif", label: "Times New Roman" },
//   { value: "Verdana, sans-serif", label: "Verdana" },
//   { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
//   { value: "Impact, sans-serif", label: "Impact" },
//   { value: "Courier New, monospace", label: "Courier New" },
//   { value: "Palatino, serif", label: "Palatino" },
//   { value: "Garamond, serif", label: "Garamond" },
//   { value: "Bookman, serif", label: "Bookman" },
//   { value: "Comic Sans MS, cursive", label: "Comic Sans MS" },
// ]

// export function TextElement({
//   id,
//   content = "Click to edit text",
//   richContent = [],
//   properties = {},
//   isSelected,
//   onSelect,
//   onUpdate,
// }: TextElementProps) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [editContent, setEditContent] = useState(content)
//   const [selectedText, setSelectedText] = useState("")
//   const [selectionStart, setSelectionStart] = useState(0)
//   const [selectionEnd, setSelectionEnd] = useState(0)
//   const [highlightColor, setHighlightColor] = useState("#ff0000")
//   const [linkUrl, setLinkUrl] = useState("")
//   const [showColorPicker, setShowColorPicker] = useState(false)
//   const [showLinkInput, setShowLinkInput] = useState(false)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   const handleTextSelection = () => {
//     if (textareaRef.current) {
//       const start = textareaRef.current.selectionStart
//       const end = textareaRef.current.selectionEnd
//       const selected = editContent.substring(start, end)

//       setSelectedText(selected)
//       setSelectionStart(start)
//       setSelectionEnd(end)
//     }
//   }

//   const applyHighlight = () => {
//     if (selectedText && selectionStart !== selectionEnd) {
//       const before = editContent.substring(0, selectionStart)
//       const after = editContent.substring(selectionEnd)
//       const highlighted = `<span style="color: ${highlightColor}">${selectedText}</span>`

//       const newContent = before + highlighted + after
//       setEditContent(newContent)
//       setShowColorPicker(false)
//     }
//   }

//   const applyLink = () => {
//     if (selectedText && linkUrl && selectionStart !== selectionEnd) {
//       const before = editContent.substring(0, selectionStart)
//       const after = editContent.substring(selectionEnd)
//       const linked = `<a href="${linkUrl}" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`

//       const newContent = before + linked + after
//       setEditContent(newContent)
//       setLinkUrl("")
//       setShowLinkInput(false)
//     }
//   }

//   const handleSave = () => {
//     setIsEditing(false)
//     onUpdate?.({ content: editContent })
//   }

//   const textStyle = {
//     fontSize: `${properties.fontSize || 16}px`,
//     fontFamily: properties.fontFamily || "Arial, sans-serif",
//     color: properties.color || "#000000",
//     textAlign: properties.alignment || ("left" as const),
//     fontWeight: properties.bold ? "bold" : "normal",
//     fontStyle: properties.italic ? "italic" : "normal",
//     textDecoration: properties.underline ? "underline" : "none",
//     lineHeight: properties.lineHeight || 1.5,
//     whiteSpace: "pre-wrap" as const,
//   }

//  const toggleFormat = (format: string) => {
//     const newProperties = { ...properties }
//     ;(newProperties as any)[format] = !(properties as any)[format]
//     onUpdate?.(newProperties)
//   }

//   const renderContent = () => {
//     if (properties.bulletPoints) {
//       const lines = content.split("\n").filter((line) => line.trim())
//       return (
//         <ul style={{ ...textStyle, paddingLeft: "20px" }}>
//           {lines.map((line, index) => (
//             <li key={index} dangerouslySetInnerHTML={{ __html: line }} />
//           ))}
//         </ul>
//       )
//     }
//     return <div style={textStyle} dangerouslySetInnerHTML={{ __html: content }} />
//   }

//   return (
//     <div
//       className={`p-4 border rounded-md cursor-pointer transition-colors ${
//         isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
//       }`}
//       onClick={onSelect}
//     >
//       {isEditing ? (
//         <div className="space-y-3">
//           <div className="flex items-center gap-1 p-2 bg-muted rounded-md flex-wrap">
//             <Select
//               value={properties.fontFamily || "Arial, sans-serif"}
//               onValueChange={(value) => onUpdate?.({ ...properties, fontFamily: value })}
//             >
//               <SelectTrigger className="w-40 h-8">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {fontOptions.map((font) => (
//                   <SelectItem key={font.value} value={font.value}>
//                     <span style={{ fontFamily: font.value }}>{font.label}</span>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <div className="w-px h-6 bg-border mx-1" />
//             <Button
//               size="sm"
//               variant={properties.bold ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => toggleFormat("bold")}
//             >
//               <Bold className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.italic ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => toggleFormat("italic")}
//             >
//               <Italic className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.underline ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => toggleFormat("underline")}
//             >
//               <Underline className="w-3 h-3" />
//             </Button>
//             <div className="w-px h-6 bg-border mx-1" />
//             <Button
//               size="sm"
//               variant={properties.bulletPoints ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => toggleFormat("bulletPoints")}
//               title="Toggle bullet points"
//             >
//               <List className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={showColorPicker ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => setShowColorPicker(!showColorPicker)}
//               disabled={!selectedText}
//             >
//               <Palette className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={showLinkInput ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => setShowLinkInput(!showLinkInput)}
//               disabled={!selectedText}
//             >
//               <Link className="w-3 h-3" />
//             </Button>
//             <div className="w-px h-6 bg-border mx-1" />
//             <Button
//               size="sm"
//               variant={properties.alignment === "left" ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => onUpdate?.({ ...properties, alignment: "left" })}
//             >
//               <AlignLeft className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.alignment === "center" ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => onUpdate?.({ ...properties, alignment: "center" })}
//             >
//               <AlignCenter className="w-3 h-3" />
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.alignment === "right" ? "default" : "outline"}
//               className="h-8 w-8 p-0"
//               onClick={() => onUpdate?.({ ...properties, alignment: "right" })}
//             >
//               <AlignRight className="w-3 h-3" />
//             </Button>
//              <EmojiPicker
//                               onEmojiSelect={(emoji) => {
//                               const currentContent = content || ""
//                               onUpdate?.({ content: currentContent + emoji })
//                             }}
//                           />
//           </div>

//           {showColorPicker && (
//             <div className="flex items-center gap-2 p-2 bg-muted rounded">
//               <input
//                 type="color"
//                 value={highlightColor}
//                 onChange={(e) => setHighlightColor(e.target.value)}
//                 className="w-8 h-8 border border-border rounded cursor-pointer"
//               />
//               <span className="text-sm">Highlight selected text</span>
//               <Button size="sm" onClick={applyHighlight}>
//                 Apply
//               </Button>
//             </div>
//           )}
 
//           {showLinkInput && (
//             <div className="flex items-center gap-2 p-2 bg-muted rounded">
//               <Input
//                 type="url"
//                 placeholder="Enter URL"
//                 value={linkUrl}
//                 onChange={(e) => setLinkUrl(e.target.value)}
//                 className="flex-1"
//               />
//               <Button size="sm" onClick={applyLink}>
//                 Apply Link
//               </Button>
//             </div>
//           )}

//           <div className="space-y-2">
//             <p className="text-xs text-muted-foreground">
//               Select text to highlight or add links. Press Enter for line breaks.
//             </p>
//             <textarea
//               ref={textareaRef}
//               value={editContent}
//               onChange={(e) => setEditContent(e.target.value)}
//               onSelect={handleTextSelection}
//               className="w-full p-3 text-sm border border-border rounded-md bg-input resize-none"
//               style={{ fontFamily: properties.fontFamily || "Arial, sans-serif" }}
//               rows={4}
//               autoFocus
//             />
//           </div>

//           <div className="flex gap-2">
//             <Button size="sm" onClick={handleSave}>
//               Save
//             </Button>
//             <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div onDoubleClick={() => setIsEditing(true)} className="min-h-6">
//           {renderContent()}
//         </div>
//       )}
//     </div>
//   )
// }
