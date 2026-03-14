// lib/email/html-generator.ts

export interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

/**
 * Generate HTML from email elements
 */
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
            text-decoration: none;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        video {
            max-width: 100%;
            height: auto;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
        }
        .divider {
            border: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, #ddd, transparent);
            margin: 30px 0;
        }
        .social-links {
            text-align: center;
            padding: 20px 0;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #666;
            text-decoration: none;
        }
        .columns-2 {
            display: table;
            width: 100%;
            table-layout: fixed;
        }
        .column {
            display: table-cell;
            padding: 10px;
            vertical-align: top;
        }
        .logo {
            text-align: center;
            padding: 20px 0;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            height: 0;
            overflow: hidden;
            margin: 20px 0;
        }
        .video-container iframe,
        .video-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        @media only screen and (max-width: 480px) {
            .columns-2, .column {
                display: block;
                width: 100%;
            }
            .column {
                padding: 10px 0;
            }
        }
    </style>
</head>
<body>
${elements.map(renderElement).join("\n")}
</body>
</html>`

  return emailHTML
}

/**
 * Render a single element to HTML
 */
function renderElement(element: EmailElement): string {
  switch (element.type) {
    case "text":
      return renderTextElement(element)
    case "image":
      return renderImageElement(element)
    case "video":
      return renderVideoElement(element)
    case "button":
      return renderButtonElement(element)
    case "social":
      return renderSocialElement(element)
    case "divider":
      return renderDividerElement(element)
    case "columns":
      return renderColumnsElement(element)
    case "logo": 
      return renderLogoElement(element)
    default:
      return ''
  }
}

function renderTextElement(element: EmailElement): string {
  const content = element.content || ''
  const align = element.properties?.align || 'left'
  const fontSize = element.properties?.fontSize || '16px'
  const color = element.properties?.color || '#333'
  const backgroundColor = element.properties?.backgroundColor || 'transparent'
  const padding = element.properties?.padding || '10px'
  
  return `
    <div style="text-align: ${align}; font-size: ${fontSize}; color: ${color}; background-color: ${backgroundColor}; padding: ${padding};">
      ${content.replace(/\n/g, '<br/>')}
    </div>
  `
}

function renderImageElement(element: EmailElement): string {
  const src = element.properties?.src || ''
  const alt = element.properties?.alt || ''
  const width = element.properties?.width || '100%'
  const height = element.properties?.height || 'auto'
  const align = element.properties?.align || 'center'
  const link = element.properties?.link || ''
  
  const imageTag = `<img src="${src}" alt="${alt}" width="${width}" height="${height}" style="display: block; max-width: 100%; height: auto;" />`
  
  if (link) {
    return `
      <div style="text-align: ${align}; margin: 10px 0;">
        <a href="${link}" style="text-decoration: none;">
          ${imageTag}
        </a>
      </div>
    `
  }
  
  return `
    <div style="text-align: ${align}; margin: 10px 0;">
      ${imageTag}
    </div>
  `
}

function renderVideoElement(element: EmailElement): string {
  const src = element.properties?.src || ''
  const type = element.properties?.videoType || 'youtube' // youtube, vimeo, mp4
  
  if (type === 'youtube') {
    return `
      <div class="video-container" style="margin: 20px 0;">
        <iframe src="${src}" frameborder="0" allowfullscreen></iframe>
      </div>
    `
  } else if (type === 'mp4') {
    return `
      <div style="margin: 20px 0;">
        <video controls style="width: 100%; height: auto;">
          <source src="${src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `
  }
  
  return ''
}

function renderButtonElement(element: EmailElement): string {
  const content = element.content || 'Click Here'
  const link = element.properties?.link || '#'
  const align = element.properties?.align || 'center'
  const backgroundColor = element.properties?.backgroundColor || '#007bff'
  const color = element.properties?.color || '#ffffff'
  const padding = element.properties?.padding || '12px 24px'
  const borderRadius = element.properties?.borderRadius || '4px'
  const fontSize = element.properties?.fontSize || '16px'
  
  return `
    <div style="text-align: ${align}; margin: 20px 0;">
      <a href="${link}" class="button" style="display: inline-block; padding: ${padding}; background-color: ${backgroundColor}; color: ${color} !important; text-decoration: none; border-radius: ${borderRadius}; font-size: ${fontSize};">
        ${content}
      </a>
    </div>
  `
}

function renderSocialElement(element: EmailElement): string {
  const links = element.properties?.links || []
  const size = element.properties?.size || '24px'
  
  const socialIcons: Record<string, string> = {
    facebook: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
    twitter: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
    instagram: 'https://cdn-icons-png.flaticon.com/512/733/733558.png',
    linkedin: 'https://cdn-icons-png.flaticon.com/512/733/733561.png',
    youtube: 'https://cdn-icons-png.flaticon.com/512/733/733646.png',
    github: 'https://cdn-icons-png.flaticon.com/512/733/733553.png',
  }
  
  return `
    <div class="social-links" style="text-align: center; padding: 20px 0;">
      ${links.map((link: any) => {
        const icon = socialIcons[link.platform] || socialIcons.facebook
        return `
          <a href="${link.url}" class="social-link" style="display: inline-block; margin: 0 10px; text-decoration: none;">
            <img src="${icon}" alt="${link.platform}" width="${size}" height="${size}" style="display: block;" />
          </a>
        `
      }).join('')}
    </div>
  `
}

function renderDividerElement(element: EmailElement): string {
  const style = element.properties?.style || 'solid'
  const color = element.properties?.color || '#ddd'
  const thickness = element.properties?.thickness || '1px'
  const width = element.properties?.width || '100%'
  
  return `
    <hr class="divider" style="border: 0; height: ${thickness}; background: ${color}; width: ${width}; margin: 30px auto;" />
  `
}

function renderColumnsElement(element: EmailElement): string {
  const columns = element.properties?.columns || 2
  const columnContent = element.properties?.columnContent || ['', '']
  const gap = element.properties?.gap || '20px'
  
  if (columns === 2) {
    return `
      <div class="columns-2" style="display: table; width: 100%; table-layout: fixed; border-collapse: separate; border-spacing: ${gap};">
        <div class="column" style="display: table-cell; padding: 10px; vertical-align: top;">
          ${columnContent[0] || ''}
        </div>
        <div class="column" style="display: table-cell; padding: 10px; vertical-align: top;">
          ${columnContent[1] || ''}
        </div>
      </div>
    `
  } else {
    return `
      <div class="column" style="padding: 10px;">
        ${columnContent[0] || ''}
      </div>
    `
  }
}

function renderLogoElement(element: EmailElement): string {
  const src = element.properties?.src || ''
  const alt = element.properties?.alt || 'Logo'
  const width = element.properties?.width || '150px'
  const align = element.properties?.align || 'center'
  
  return `
    <div class="logo" style="text-align: ${align}; padding: 20px 0;">
      <img src="${src}" alt="${alt}" width="${width}" style="display: inline-block;" />
    </div>
  `
}

/**
 * Parse HTML back to elements (simplified version)
 * Note: This is a basic implementation - for production, use a proper HTML parser like 'node-html-parser'
 */

export function parseHTMLToElements(html: string): EmailElement[] {
  const elements: EmailElement[] = []
  
  try {
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html
    
    // Helper function to extract style properties
    const extractStyle = (styleString: string, prop: string): string | undefined => {
      const match = styleString.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`))
      return match ? match[1].trim() : undefined
    }

    // Parse different element types
    const parseElement = (elementHTML: string): EmailElement | null => {
      // Check for text elements (div with text content)
      if (elementHTML.includes('<div') && !elementHTML.includes('<img') && !elementHTML.includes('<a')) {
        const styleMatch = elementHTML.match(/style="([^"]*)"/)
        const contentMatch = elementHTML.match(/>([\s\S]*?)<\/div>/)
        
        if (contentMatch) {
          const content = contentMatch[1].replace(/<br\s*\/?>/g, '\n').trim()
          if (content) {
            return {
              id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'text',
              content: content,
              properties: {
                color: styleMatch ? extractStyle(styleMatch[1], 'color') || '#000000' : '#000000',
                fontSize: styleMatch ? extractStyle(styleMatch[1], 'font-size') || '16px' : '16px',
                alignment: styleMatch ? extractStyle(styleMatch[1], 'text-align') || 'left' : 'left',
                bold: styleMatch ? extractStyle(styleMatch[1], 'font-weight') === 'bold' : false,
                italic: styleMatch ? extractStyle(styleMatch[1], 'font-style') === 'italic' : false,
              }
            }
          }
        }
      }
      
      // Check for images
      if (elementHTML.includes('<img')) {
        const srcMatch = elementHTML.match(/src="([^"]*)"/)
        const altMatch = elementHTML.match(/alt="([^"]*)"/)
        const styleMatch = elementHTML.match(/style="([^"]*)"/)
        
        if (srcMatch) {
          return {
            id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'image',
            properties: {
              src: srcMatch[1],
              alt: altMatch ? altMatch[1] : '',
              alignment: styleMatch ? extractStyle(styleMatch[1], 'margin')?.includes('auto') ? 'center' : 'left' : 'center',
              width: styleMatch ? extractStyle(styleMatch[1], 'max-width')?.replace('px', '') : undefined,
            }
          }
        }
      }
      
      // Check for buttons
      if (elementHTML.includes('<a') && elementHTML.includes('button')) {
        const hrefMatch = elementHTML.match(/href="([^"]*)"/)
        const contentMatch = elementHTML.match(/>([\s\S]*?)<\/a>/)
        const styleMatch = elementHTML.match(/style="([^"]*)"/)
        
        if (hrefMatch && contentMatch) {
          return {
            id: `button-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'button',
            content: contentMatch[1].trim(),
            properties: {
              link: hrefMatch[1],
              backgroundColor: styleMatch ? extractStyle(styleMatch[1], 'background-color') || '#000000' : '#000000',
              textColor: styleMatch ? extractStyle(styleMatch[1], 'color') || '#ffffff' : '#ffffff',
              alignment: 'center',
            }
          }
        }
      }
      
      // Check for dividers
      if (elementHTML.includes('<hr')) {
        const styleMatch = elementHTML.match(/style="([^"]*)"/)
        
        return {
          id: `divider-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'divider',
          properties: {
            color: styleMatch ? extractStyle(styleMatch[1], 'border-top-color') || '#e5e5e5' : '#e5e5e5',
            thickness: styleMatch ? parseInt(extractStyle(styleMatch[1], 'border-top-width') || '1') : 1,
            margin: styleMatch ? parseInt(extractStyle(styleMatch[1], 'margin') || '16') : 16,
          }
        }
      }
      
      // Check for social elements
      if (elementHTML.includes('social') || (elementHTML.includes('<a') && elementHTML.includes('facebook'))) {
        const platformMatch = elementHTML.match(/platform=(["'])?([^"'\s>]+)/i)
        
        if (platformMatch) {
          return {
            id: `social-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'social',
            properties: {
              platform: platformMatch[2],
              url: elementHTML.match(/href="([^"]*)"/)?.[1] || '#',
              iconSize: 24,
              alignment: 'center',
            }
          }
        }
      }
      
      return null
    }

    // Split HTML into potential elements
    const elementRegex = /<(div|img|a|hr|table)[^>]*>[\s\S]*?<\/\1>|<img[^>]*\/>/gi
    const matches = bodyContent.matchAll(elementRegex)
    
    for (const match of matches) {
      const element = parseElement(match[0])
      if (element) {
        elements.push(element)
      }
    }
    
    // If no elements found, create a default text element
    if (elements.length === 0) {
      // Try to extract text content from body
      const textContent = bodyContent.replace(/<[^>]*>/g, '').trim()
      if (textContent) {
        elements.push({
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'text',
          content: textContent,
          properties: {
            color: '#000000',
            fontSize: '16px',
            alignment: 'left',
          }
        })
      }
    }
    
  } catch (error) {
    console.error('Error parsing HTML to elements:', error)
  }
  
  return elements
}
