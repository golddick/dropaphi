

"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons/icons"
import { useHistory } from "@/hooks/mail/use-history"
import { generateEmailHTML } from "./code-editor/html-generator"
import { TextElement } from "./email-elements/text.element"
import { ImageElement } from "./email-elements/image-element"
import { VideoElement } from "./email-elements/video-element"
import { ButtonElement } from "./email-elements/button-element"
import { SocialElement } from "./email-elements/soscial-element"
import { DividerElement } from "./email-elements/divider-element"
import { LogoElement } from "./email-elements/logo-element"
import { ColumnsElement } from "./email-elements/columns-element"
import { SortableElement } from "./drag-drop/sortable-element"
import { EmailBuilderHeader } from "./builder/header"
import { SendEmailModal } from "./builder/send-email-modal"
import { CampaignSelector } from "./builder/campaign-selector"
import { EmailPreview } from "./preview/mail-preview"
import { ActivitySquare, ChevronLeft, ChevronRight } from "lucide-react"
import { DraggableComponent } from "./drag-drop/draggable-component"
import { DroppableCanvas } from "./drag-drop/droppable-canvas"
import { PropertiesPanel } from "./properties/properties-panel"
import { TextModeEditor } from "./builder/text-mode-editor"
import { CodeEditor } from "./code-editor/code-editor"

// Import the email store
import { useWorkspaceStore } from "@/lib/stores/workspace"
import { useEmailStore } from "@/lib/stores/email"
import { parseHTMLToElements } from "@/lib/email/generator/html-generator"
import { dropid } from "dropid"
// import { generateEmailHTML } from "@/lib/email/generator/html-generator"

interface EmailElement { 
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface EmailState {
  elements: EmailElement[]
  subject: string
  bodyBackgroundColor?: string
}

export default function DropAphiMailStudio() {
  const { toast } = useToast()
  
  // Get workspace ID
  const { currentWorkspace } = useWorkspaceStore()
  const workspaceId = currentWorkspace?.id
  
  // Get email store actions
  const { 
    campaigns, 
    templates,
    isLoading,
    isSending,
    createCampaign, 
    sendEmail, 
    sendToSubscribers,
    fetchCampaigns,
    fetchTemplates,
    createTemplate,
    updateTemplate
  } = useEmailStore()

  const {
    state: emailState,
    set: setEmailState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<EmailState>({
    elements: [],
    subject: "Your Email Subject",
    bodyBackgroundColor: "#ffffff",
  })


  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [mode, setMode] = useState<"visual" | "code" | "text">("visual")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [customHTML, setCustomHTML] = useState("")
  const [originalHTML, setOriginalHTML] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [textModeContent, setTextModeContent] = useState("")
  const [showSendModal, setShowSendModal] = useState(false)
  const [showCampaignSelector, setShowCampaignSelector] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const componentLibrary = [
    { id: "text", icon: Icons.Type, label: "Text", category: "Basics" },
    { id: "image", icon: Icons.Image, label: "Image", category: "Media" },
    { id: "video", icon: Icons.Video, label: "Video", category: "Media" },
    { id: "button", icon: Icons.Button, label: "Button", category: "Basics" },
    { id: "social", icon: Icons.Social, label: "Social", category: "Basics" },
    { id: "divider", icon: Icons.Divider, label: "Divider", category: "Layout" },
    // { id: "columns-1", icon: Icons.Columns, label: "1 Column", category: "Layout" },
    { id: "columns-2", icon: Icons.Columns, label: "2 Columns", category: "Layout" },
    { id: "logo", icon: Icons.Image, label: "Logo", category: "Media" },
  ]

  const categories = ["Basics", "Layout", "Media"]

  const generatedHTML = generateEmailHTML(emailState.elements, emailState.subject)
  const currentHTML = customHTML || generatedHTML

  // Fetch campaigns and templates when workspace loads
  useEffect(() => {
    if (workspaceId) {
      fetchCampaigns()
      fetchTemplates()
    }
  }, [workspaceId, fetchCampaigns, fetchTemplates])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (emailState.elements.length > 0) {
        localStorage.setItem("dropaphi-autosave", JSON.stringify(emailState))
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [emailState])

  // Load auto-saved data on mount
  useEffect(() => {
    const autoSaved = localStorage.getItem("dropaphi-autosave")
    if (autoSaved) {
      try {
        const savedState = JSON.parse(autoSaved)
        setEmailState(savedState)
        toast({
          title: "Auto-saved data restored",
          description: "Your previous work has been restored.",
        })
      } catch (error) {
        console.error("Failed to restore auto-saved data:", error)
      }
    }
  }, [setEmailState, toast])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    if (over.id === "email-canvas" && active.data.current?.type) {
      const componentType = active.data.current.type.replace(/-(1|2)$/, "")
      const newElement: EmailElement = {
        // id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        id: dropid(`${componentType}`),
        type: componentType as EmailElement["type"],
        properties: active.data.current.type.includes("columns")
          ? { columns: active.data.current.type.includes("2") ? 2 : 1 }
          : {},
      }
      const newElements = [...emailState.elements, newElement]
      setEmailState({ ...emailState, elements: newElements })
      setSelectedElement(newElement.id)
      return
    }

    if (active.id !== over.id) {
      const oldIndex = emailState.elements.findIndex((el) => el.id === active.id)
      const newIndex = emailState.elements.findIndex((el) => el.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newElements = arrayMove(emailState.elements, oldIndex, newIndex)
        setEmailState({ ...emailState, elements: newElements })
      }
    }
  }

  const updateElement = (id: string, updates: any) => {
    const newElements = emailState.elements.map((el) =>
      el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
    )
    setEmailState({ ...emailState, elements: newElements })

    // Real-time preview update
    if (showPreview) {
      const newHTML = generateEmailHTML(newElements, emailState.subject)
      setCustomHTML(newHTML)
    }
  }

  const deleteElement = (id: string) => {
    const newElements = emailState.elements.filter((el) => el.id !== id)
    setEmailState({ ...emailState, elements: newElements })
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const updateSubject = (subject: string) => {
    setEmailState({ ...emailState, subject })
  }

  const handleComponentClick = (componentId: string, label: string) => {
    const componentType = componentId.replace(/-(1|2)$/, "")
    const newElement: EmailElement = {
      // id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      id: dropid(`${componentType}`),
      type: componentType as EmailElement["type"],
      properties: componentId.includes("columns")
        ? { columns: componentId.includes("2") ? 2 : 1 }
        : {},
    }
    const newElements = [...emailState.elements, newElement]
    setEmailState({ ...emailState, elements: newElements })
    setSelectedElement(newElement.id)
    toast({
      title: "Element added",
      description: `${label} has been added to your email.`,
    })
  }

  const loadTemplate = (elements: EmailElement[], subject: string) => {
    setEmailState({ elements, subject })
    setSelectedElement(null)
    toast({
      title: "Template loaded",
      description: "The template has been loaded successfully.",
    })
  }

  // ========================================
  // EMAIL STORE FUNCTIONS - CALLED DIRECTLY
  // ========================================

  // Save current email as template
  const handleSaveTemplate = async () => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected",
      })
      return
    }

    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
      })
      return
    }

    try {
      await createTemplate({
        name: templateName,
        subject: emailState.subject,
        elements: emailState.elements,
      })
      
      setShowSaveTemplateModal(false)
      setTemplateName("")
      toast({
        title: "Success",
        description: "Template saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
      })
    }
  }

  // Handle campaign creation
  const handleCreateCampaign = async (name: string) => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected",
      })
      return
    }

    try {
      const newCampaign = await createCampaign({
        name,
        subject: emailState.subject,
      })
      
      if (newCampaign) {
        setSelectedCampaign(newCampaign)
        toast({
          title: "Success",
          description: `Campaign "${name}" created successfully`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
      })
    }
  }

  // Handle sending to campaign subscribers
  const handleSendToSubscribers = async (campaignId: string) => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected",
      })
      return
    }

    try {
      const html = mode === 'code' ? customHTML : generatedHTML
      
      await sendToSubscribers(
        campaignId,
        html,
        emailState.subject
      )
       
      setShowSendModal(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send to subscribers",
      })
    }
  }

  // Handle sending to custom emails
  const handleSendToCustomEmails = async (emails: string[]) => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected",
      })
      return
    }

    if (!emails.length) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
      })
      return
    }

    try {
      const html = mode === 'code' ? customHTML : generatedHTML
      
      await sendEmail({
        to: emails,
        subject: emailState.subject,
        html: html,
        text: html.replace(/<[^>]*>/g, ''), // Simple text version
        campaignId: selectedCampaign?.id,
      })
      
      setShowSendModal(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
      })
    }
  }

  const renderElement = (element: EmailElement, inOverlay = false) => {
    const commonProps = {
      id: element.id,
      isSelected: selectedElement === element.id && !inOverlay,
      onSelect: () => !inOverlay && setSelectedElement(element.id),
      onUpdate: (updates: any) => updateElement(element.id, updates),
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
        case "columns":
          return <ColumnsElement key={element.id} {...commonProps} />
        case "logo":
          return <LogoElement key={element.id} {...commonProps} />
        default:
          return null
      }
    })()

    if (inOverlay) {
      return elementComponent
    }

    return (
      <SortableElement key={element.id} id={element.id} onDelete={() => deleteElement(element.id)}>
        {elementComponent}
      </SortableElement>
    )
  }

  const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
  const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null


  const handleHTMLChange = (html: string) => {
    setCustomHTML(html)
  }

  const handleModeChange = (newMode: "visual" | "code" | "text") => {
  if (newMode === "code" && mode === "visual") {
    // VISUAL → CODE: Generate HTML
    const html = generateEmailHTML(emailState.elements, emailState.subject)
    setCustomHTML(html)
    setOriginalHTML(html)
  } 
  else if (newMode === "visual" && mode === "code") {
    // CODE → VISUAL: Parse HTML back to elements
    if (customHTML !== originalHTML) {
      // User made changes in code mode
      try {
        const parsedElements = parseHTMLToElements(customHTML)
        if (parsedElements.length > 0) {
          setEmailState({ 
            ...emailState, 
            elements: parsedElements 
          })
          toast({
            title: "Success",
            description: `Converted ${parsedElements.length} elements from HTML.`,
          })
        } else {
          // Fallback: create a text element with the HTML content
          const fallbackElement: EmailElement = {
            id: dropid('text'),
            type: "text",
            content: "HTML content could not be parsed. Please check your HTML structure.",
            properties: { color: "#ff0000" }
          }
          setEmailState({ 
            ...emailState, 
            elements: [fallbackElement] 
          })
          toast({
            title: "Parse failed",
            description: "Created fallback text element.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Parse error:", error)
        toast({
          title: "Error",
          description: "Failed to parse HTML. Switching to visual mode with existing design.",
          variant: "destructive",
        })
      }
    }
    // Clear saved HTML
    localStorage.removeItem("dropaphi-code-html")
  }
  else if (newMode === "text" && mode === "visual") {
    // VISUAL → TEXT: Generate text content
    const textContent = emailState.elements
      .filter(el => el.type === "text")
      .map(el => el.content || "")
      .join("\n\n")
    setTextModeContent(textContent)
  }
  else if (newMode === "visual" && mode === "text") {
    // TEXT → VISUAL: Handled in handleTextModeSave
  }
  
  setMode(newMode)
}

// Enhanced text mode save to preserve HTML parsing
const handleTextModeSave = (content: string) => {
  setTextModeContent(content)
  
  // Check if content looks like HTML
  if (content.trim().startsWith('<') && content.includes('</')) {
    // This is HTML content, try to parse it
    try {
      const parsedElements = parseHTMLToElements(content)
      if (parsedElements.length > 0) {
        setEmailState({ 
          ...emailState, 
          elements: parsedElements 
        })
        toast({
          title: "HTML detected",
          description: `Parsed ${parsedElements.length} elements from HTML.`,
        })
      } else {
        // Fallback to text parsing
        parseAsText(content)
      }
    } catch (error) {
      parseAsText(content)
    }
  } else {
    // Regular text content
    parseAsText(content)
  }
  
  setMode("visual")
}

// Helper function for text parsing
const parseAsText = (content: string) => {
  const lines = content.split("\n")
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    const restContent = lines.slice(1).join("\n").trim()
    
    if (firstLine) {
      updateSubject(firstLine)
    }
    
    if (restContent) {
      const textElement: EmailElement = {
        id: dropid('text'),
        type: "text",
        content: restContent,
      }
      setEmailState({ ...emailState, elements: [textElement] })
    }
  }
}

  const downloadHTML = () => {
    const blob = new Blob([currentHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Email exported",
      description: "Your email template has been downloaded.",
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        setShowSaveTemplateModal(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`h-screen flex flex-col `}>
        {/* New Responsive Header */}
        <EmailBuilderHeader
          subject={emailState.subject} 
          onSubjectChange={updateSubject}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSaveTemplate={() => setShowSaveTemplateModal(true)} 
          mode={(isMobile && mode === "code" ? "text" : mode) as "visual" | "code" | "text"}
          onModeChange={(newMode) => {
            if (isMobile && newMode === "code") {
              toast({
                title: "Code mode unavailable",
                description: "Use text mode on mobile to edit email content.",
              })
              return
            }
            handleModeChange(newMode)
          }}
          onExport={downloadHTML}
          onPreview={() => setShowPreview(true)}
          onSend={() => {
            if (!selectedCampaign) {
              setShowCampaignSelector(true)
              toast({
                title: "Select a campaign",
                description: "Please select or create a campaign to send emails.",
              })
            } else {
              setShowSendModal(true)
            }
          }}
          onSelectCampaign={() => setShowCampaignSelector(true)}
          selectedCampaign={selectedCampaign}
        />

        {/* Main Content - Responsive */}
        <div className="flex-1 hidden-scrollbar flex overflow-hidden">
          {mode === "visual" ? (
            <>
              {/* Left Sidebar - Component Library - Collapsible */}
              <aside
                className={`${
                  isMobile ? "hidden" : sidebarCollapsed ? "w-16" : "w-54"
                } bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden transition-all duration-300`}
              >
                <div className="p-2 border-b border-sidebar-border shrink-0 flex items-center justify-between">
                  {!sidebarCollapsed && <h2 className="text-sm font-semibold text-sidebar-foreground">Components</h2>}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-8 bg-red-500 text-white w-8 p-0"
                    title={sidebarCollapsed ? "Expand" : "Collapse"}
                  >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto hidden-scrollbar p-2 space-y-2">
                  {sidebarCollapsed ? (
                    // Icon-only view
                    <div className="flex flex-col gap-2">
                      {componentLibrary.map((component) => (
                        <DraggableComponent
                          key={component.id}
                          id={component.id}
                          icon={component.icon}
                          label={component.label}
                          category={component.category}
                          collapsed={true}
                          onClick={() => handleComponentClick(component.id, component.label)}
                        />
                      ))}
                    </div>
                  ) : (
                    // Full view with categories
                    <div className="space-y-6 p-2">
                      {categories.map((category) => (
                        <div key={category}>
                          <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {componentLibrary
                              .filter((component) => component.category === category)
                              .map((component) => (
                                <DraggableComponent
                                  key={component.id}
                                  id={component.id}
                                  icon={component.icon}
                                  label={component.label}
                                  category={component.category}
                                  onClick={() => handleComponentClick(component.id, component.label)}
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>

              {/* Center Canvas */}
              <main
                className="flex-1 bg-canvas canvas-grid p-4 sm:p-6 md:p-8 overflow-auto"
                style={{ backgroundColor: emailState.bodyBackgroundColor || "#ffffff" }}
              >
                <div className="max-w-2xl mx-auto">
                  <SortableContext
                    items={emailState.elements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableCanvas isEmpty={emailState.elements.length === 0}>
                      {emailState.elements.map((element) => renderElement(element))}
                    </DroppableCanvas>
                  </SortableContext>
                </div>
              </main>

              {/* Right Sidebar - Properties Panel */}
              <aside
                className={`${
                  isMobile ? "hidden" : " w-40 lg:w-80"
                } bg-properties border-l border-border flex flex-col overflow-hidden`}
              >
                <div className="p-4 border-b border-border shrink-0">
                  <h2 className="text-sm font-semibold mb-1">Properties</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedElement ? "Configure selected element" : "Select an element to edit"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <PropertiesPanel
                    selectedElement={selectedElementData || null}
                    onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
                  />
                </div>
              </aside>
            </>
          ) : mode === "text" ? (
            /* Text Editor Mode */
            <div className="flex-1 overflow-hidden">
              <TextModeEditor 
                initialContent={textModeContent} 
                subject={emailState.subject}
                onSave={handleTextModeSave}
                onSubjectChange={updateSubject}
              />
            </div>
          ) : mode === "code" && !isMobile ? (
            /* Code Editor Mode - Hidden on Mobile */
            <div className="flex-1 overflow-hidden">
              <CodeEditor html={currentHTML} onHTMLChange={handleHTMLChange} onPreview={() => setShowPreview(true)} />
            </div>
          ) : isMobile && mode === "code" ? (
            /* Mobile fallback to text editor */
            <div className="flex-1 overflow-hidden">
              <TextModeEditor 
                initialContent={textModeContent} 
                subject={emailState.subject}
                onSave={handleTextModeSave}
                onSubjectChange={updateSubject}
              />
            </div>
          ) : null}
        </div>

        <DragOverlay>
          {activeDragComponent ? (
            <div className="p-3 bg-sidebar-accent border border-red-500 rounded-md shadow-lg">
              <div className="flex items-center gap-3">
                <ActivitySquare className="w-4 h-4 text-sidebar-primary" />
                <span className="text-sm text-sidebar-foreground">{activeDragComponent.label}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Email Preview Modal */}
        <EmailPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          html={currentHTML}
          subject={emailState.subject}
        />

        {/* Send Email Modal */}
        <SendEmailModal
          open={showSendModal}
          onOpenChange={setShowSendModal}
          campaigns={campaigns}
          preselectedCampaignId={selectedCampaign?.id}
          // isSending={isSending}
          onSendToSubscribers={handleSendToSubscribers}
          onSendToCustomEmails={handleSendToCustomEmails}
        />
 
        {/* Campaign Selector Modal */}
        <CampaignSelector
          open={showCampaignSelector}
          onOpenChange={setShowCampaignSelector}
          campaigns={campaigns}
          selectedCampaignId={selectedCampaign?.id}
          onSelectCampaign={(campaign) => setSelectedCampaign(campaign)}
          onCreateCampaign={handleCreateCampaign}
          // isLoading={isLoading}
        />

        {/* Save Template Modal */}
        {showSaveTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Save as Template</h2>
              <input
                type="text"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveTemplate}
                  disabled={isLoading || !templateName.trim()}
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {isLoading ? 'Saving...' : 'Save Template'}
                </Button>
                <Button
                  onClick={() => setShowSaveTemplateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}