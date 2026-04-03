"use client"
 
import { getSocialIconSVG, getSocialColor, youtube, linkedin, instagram, twitter, facebook } from "@/lib/social-icons"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
  children?: EmailElement[]
}

const renderElement = (element: EmailElement): string => {
  const props = element.properties || {}

  switch (element.type) {


 case "text":

  const textStyle = {
        "font-size": `${props.fontSize || 16}px`,
        "color": props.color || "#000000",
        "text-align": props.alignment || "left",
        "font-weight": props.bold ? "bold" : "normal",
        "font-style": props.italic ? "italic" : "normal",
        "margin":  props.backgroundColor ? "2px" : "0",
        "line-height": props.lineHeight || 1.5,
        "font-family": props.fontFamily || "Arial, sans-serif,Comic Sans MS, cursive,Impact, sans-serif, 'Times New Roman', serif",
        "text-decoration": props.underline ? "underline" : "none",
        "background-color": props.backgroundColor || "transparent",
        "padding": props.backgroundColor ? "4px" : "0",
        "border-radius": props.backgroundColor ? "4px" : "0",
      }

  const textContent = element.content || "Sample text"

  // ✅ ONLY newline handling (NO escaping)
  const safeText = textContent.replace(/\n/g, "<br />")

  return `<div style="${Object.entries(textStyle)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")}">${safeText}</div>`


    case "image":
      const imgStyle = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
        opacity: props.opacity ? props.opacity / 100 : 1,
        transform: props.rotation ? `rotate(${props.rotation}deg)` : "none",
      }
      if (props.width) imgStyle.maxWidth = `${props.width}px`
      if (props.height) imgStyle.height = `${props.height}px`

      return `<img src="${props.src || "/placeholder.svg?height=200&width=400"}" alt="${props.alt || "Email image"}" style="${Object.entries(
        imgStyle,
      )
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    case "video":
      const videoStyle = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
      }
      if (props.width) videoStyle.maxWidth = `${props.width}px`
      if (props.height) videoStyle.height = `${props.height}px`

      const videoAttributes = []
      if (props.controls !== false) videoAttributes.push("controls")
      if (props.autoplay) videoAttributes.push("autoplay")
      if (props.muted) videoAttributes.push("muted")
      if (props.loop) videoAttributes.push("loop")
      if (props.poster) videoAttributes.push(`poster="${props.poster}"`)

      return `<video src="${props.src || ""}" ${videoAttributes.join(" ")} style="${Object.entries(videoStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}">
        Your email client does not support video playback.
      </video>`

    case "button":
      const buttonStyle = {
        backgroundColor: props.backgroundColor || "#000000",
        color: props.textColor || "#ffffff",
        padding: props.size === "sm" ? "8px 16px" : props.size === "lg" ? "16px 32px" : "12px 24px",
        fontSize: props.size === "sm" ? "14px" : props.size === "lg" ? "18px" : "16px",
        border: "none",
        borderRadius: "4px",
        textDecoration: "none",
        display: "inline-block",
        margin: "16px 0",
        fontWeight: "500", // Added consistent font weight
      }
      const buttonContainer =
        props.alignment === "center"
          ? "text-align: center;"
          : props.alignment === "right"
            ? "text-align: right;"
            : "text-align: left;"

      return `<div style="${buttonContainer}"><a href="${props.link || "#"}" style="${Object.entries(buttonStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}">${props.text || element.content || "Click me"}</a></div>`




        case "social": {
  // Handle both single platform and multiple links
  const links = props.links || (props.platform ? [{ 
    platform: props.platform, 
    url: props.url || '#' 
  }] : [])
  
  if (!links || links.length === 0) {
    return `<div style="text-align: center; color: #666; padding: 8px; margin: 4px 0;">
      No social links configured
    </div>`
  }

  const iconSize = props.iconSize || 24
  const spacing = props.spacing || 8

  // Container alignment
  const socialContainer = props.alignment === "center"
    ? "text-align: center;"
    : props.alignment === "right"
      ? "text-align: right;"
      : "text-align: left;"

  const socialLinksHTML = links
    .map((link: any) => {
      const platform = link.platform?.toLowerCase()
      if (!platform) return ""
      
      // Get platform color for the icon (moved inside the map)
      const platformColor = getSocialColor(platform)
      
      // Icon color - use platform color if no iconColor provided
      const iconColor = props.iconColor || platformColor
      
      // Link/container style - transparent background by default
      const linkStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        backgroundColor: "transparent",
        margin: `0 ${spacing / 2}px`,
        textDecoration: "none",
        transition: "opacity 0.2s ease",
      }

      // Get the SVG and replace fill colors with iconColor
      const iconSVG = getSocialIconSVG(platform)
        .replace(/fill="[^"]*"/g, `fill="${iconColor}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${iconColor}"`)
        .replace(/currentColor/g, iconColor)

      // Convert style object to string
      const linkStyleString = Object.entries(linkStyle)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
          return `${cssKey}: ${value}`
        })
        .join("; ")

      return `
        <a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer" style="${linkStyleString}">
          ${iconSVG}
        </a>`
    })
    .join("")

  return `<div style="${socialContainer}">${socialLinksHTML}</div>`
          }

    case "divider":
      const dividerStyle = {
        border: "none",
        borderTop: `${props.thickness || 1}px ${props.style || "solid"} ${props.color || "#e5e5e5"}`,
        margin: `${props.margin || 16}px 0`,
      }

      return `<hr style="${Object.entries(dividerStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    case "columns":
      const { columns = 2, gap = 16, alignment = "top", columnElements = [] } = element.properties || {}

      const alignmentMap: { [key in "top" | "center" | "bottom"]: string } = {
        top: "vertical-align: top;",
        center: "vertical-align: middle;",
        bottom: "vertical-align: bottom;",
      }
      const alignmentStyle = alignmentMap[alignment as keyof typeof alignmentMap] || alignmentMap.top

      const columnWidth = `${Math.floor((100 - (columns - 1) * 2) / columns)}%`
      const gapStyle = gap > 0 ? `padding-right: ${gap}px;` : ""

      const columnsHTML = Array.from({ length: columns }, (_, index) => {
        const columnContent = columnElements[index] || []
        const elementsHTML = columnContent.map((el: any) => renderElement(el)).join("")

        return `
          <td style="width: ${columnWidth}; ${alignmentStyle} ${index < columns - 1 ? gapStyle : ""}" class="column">
            ${elementsHTML || `<p style="color: #666; font-size: 14px; text-align: center; padding: 20px;">Column ${index + 1}</p>`}
          </td>
        `
      }).join("")

      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
          <tr>
            ${columnsHTML}
          </tr>
        </table>
      `

    case "logo":
      const logoStyle = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
      }
      if (props.width) logoStyle.maxWidth = `${props.width}px`
      if (props.height) logoStyle.height = `${props.height}px`

      return `<img src="${props.src || "/placeholder.svg?height=60&width=120"}" alt="Logo" style="${Object.entries(
        logoStyle,
      )
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    default:
      return ` ${element.type} element `
  }
}

export function generateEmailHTML(elements: EmailElement[], subject: string, bodyBackgroundColor?: string): string {
  const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: ${bodyBackgroundColor || "#ffffff"};
        }
        * {
            box-sizing: border-box;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        a {
            color: #007bff;
        }
        table {
            border-collapse: collapse;
        }
        video {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
${elements.map(renderElement).join("\n")}
</body>
</html>`

  return emailHTML
}

export function parseHTMLToElements(html: string): EmailElement[] {
  // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
  // For now, return empty array as parsing HTML back to elements is complex
  return []
}
