"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

const EMOJI_CATEGORIES = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
  ],
  gestures: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🫰",
    "🤟",
    "🤘",
    "🤙",
    "👍",
    "👎",
    "👊",
    "👏",
    "🙌",
    "👐",
  ],
  hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "💌",
    "💋",
  ],
  objects: [
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎀",
    "🎂",
    "🍰",
    "🧁",
    "🍪",
    "🍩",
    "🍫",
    "🍬",
    "🍭",
    "🍮",
    "🍯",
    "🍼",
    "☕",
    "🍵",
    "🍶",
    "🍾",
  ],
  nature: [
    "🌹",
    "🥀",
    "🌺",
    "🌻",
    "🌼",
    "🌷",
    "🌱",
    "🌲",
    "🌳",
    "🌴",
    "🌵",
    "🌾",
    "🌿",
    "☘️",
    "🍀",
    "🍁",
    "🍂",
    "🍃",
    "🌍",
    "🌎",
  ],
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys")

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setIsOpen(!isOpen)} title="Add emoji">
        <span className="text-lg">😊</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-lg shadow-lg p-3 z-50 w-80">
          <div className="flex gap-1 mb-3 flex-wrap">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                className="text-xs"
              >
                {category.charAt(0).toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onEmojiSelect(emoji)
                  setIsOpen(false)
                }}
                className="text-2xl hover:bg-muted p-2 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
