"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Link, Video } from "lucide-react"

interface VideoElementProps {
  id: string
  properties?: {
    src?: string
    poster?: string
    width?: number
    height?: number
    alignment?: "left" | "center" | "right"
    autoplay?: boolean
    controls?: boolean
    muted?: boolean
    loop?: boolean
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

export function VideoElement({ id, properties = {}, isSelected, onSelect, onUpdate }: VideoElementProps) {
  const [showUpload, setShowUpload] = useState(!properties.src)
  const [videoUrl, setVideoUrl] = useState(properties.src || "")
  const [posterUrl, setPosterUrl] = useState(properties.poster || "")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = () => {
    if (videoUrl) {
      onUpdate?.({
        ...properties,
        src: videoUrl,
        poster: posterUrl,
        width: properties.width || 560,
        height: properties.height || 315,
        controls: properties.controls !== false,
        autoplay: properties.autoplay || false,
        muted: properties.muted || false,
        loop: properties.loop || false,
      })
      setShowUpload(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      // In a real app, this would upload to a server/database
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      onUpdate?.({
        ...properties,
        src: url,
        poster: posterUrl,
        width: properties.width || 560,
        height: properties.height || 315,
        controls: properties.controls !== false,
        autoplay: properties.autoplay || false,
        muted: properties.muted || false,
        loop: properties.loop || false,
      })
      setShowUpload(false)
    }
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {showUpload || !properties.src ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center h-40 bg-muted rounded-md border-2 border-dashed border-border">
            <div className="text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Add a video</p>
              <p className="text-xs text-muted-foreground">Upload from device or paste URL</p>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Video URL (YouTube, Vimeo, or direct link)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <Input
              placeholder="Poster image URL (optional)"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleVideoUpload} disabled={!videoUrl}>
                <Link className="w-3 h-3 mr-1" />
                Add Video
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3 h-3 mr-1" />
                Upload File
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
      ) : isConfiguring ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Width: {properties.width || 560}px</label>
            <Slider
              value={[properties.width || 560]}
              onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
              max={800}
              min={200}
              step={20}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Height: {properties.height || 315}px</label>
            <Slider
              value={[properties.height || 315]}
              onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
              max={600}
              min={150}
              step={15}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Alignment</label>
            <Select
              value={properties.alignment || "center"}
              onValueChange={(value) => onUpdate?.({ ...properties, alignment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={properties.controls !== false ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, controls: properties.controls === false })}
              className="flex-1"
            >
              Controls
            </Button>
            <Button
              size="sm"
              variant={properties.autoplay ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, autoplay: !properties.autoplay })}
              className="flex-1"
            >
              Autoplay
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={properties.muted ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, muted: !properties.muted })}
              className="flex-1"
            >
              Muted
            </Button>
            <Button
              size="sm"
              variant={properties.loop ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, loop: !properties.loop })}
              className="flex-1"
            >
              Loop
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsConfiguring(false)}>
              Done
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}>
              Change Video
            </Button>
          </div>
        </div>
      ) : (
        <div className={`flex ${alignmentClass}`}>
          <div className="relative">
            {properties.src ? (
              <video
                src={properties.src}
                poster={properties.poster}
                controls={properties.controls !== false}
                autoPlay={properties.autoplay}
                muted={properties.muted}
                loop={properties.loop}
                style={{
                  width: properties.width ? `${properties.width}px` : "560px",
                  height: properties.height ? `${properties.height}px` : "315px",
                  maxWidth: "100%",
                }}
                className="rounded-md bg-muted"
                onDoubleClick={() => setIsConfiguring(true)}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div
                className="bg-muted rounded-md flex items-center justify-center"
                style={{
                  width: properties.width ? `${properties.width}px` : "560px",
                  height: properties.height ? `${properties.height}px` : "315px",
                  maxWidth: "100%",
                }}
                onDoubleClick={() => setIsConfiguring(true)}
              >
                <div className="text-center">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Video element</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
