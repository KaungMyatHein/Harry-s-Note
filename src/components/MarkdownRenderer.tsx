'use client'

import { useEffect, useState } from 'react'
import type MarkdownIt from 'markdown-it'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    const processMarkdown = async () => {
      // Import markdown-it dynamically to avoid SSR issues
      const MarkdownItModule = await import('markdown-it')
      const MarkdownItClass = MarkdownItModule.default
      const md = new MarkdownItClass({
        html: true,
        linkify: true,
        typographer: true,
      })

      // Custom renderer for unordered lists
      md.renderer.rules.bullet_list_open = function (tokens: any, idx: any, options: any, env: any, renderer: any) {
        return '<ul class="markdown-list">'
      }

      // Custom renderer for lists to ensure proper styling
      md.renderer.rules.list_item_open = function (tokens: any, idx: any, options: any, env: any, renderer: any) {
        return '<li class="markdown-list-item">'
      }

      // Custom renderer for blockquotes to create callout sections
      md.renderer.rules.blockquote_open = function (tokens: any, idx: any, options: any, env: any, renderer: any) {
        // Check if the blockquote content starts with an emoji (indicating a callout)
        const nextToken = tokens[idx + 1]
        let content = ''
        let icon = null
        let isCallout = false
        
        if (nextToken && nextToken.type === 'paragraph_open') {
          const paragraphToken = tokens[idx + 2]
          if (paragraphToken && paragraphToken.type === 'inline') {
            content = paragraphToken.content
            // Check if content starts with an emoji - simple approach
            if (content.length > 0) {
              const firstChar = content.charAt(0)
              // Check if first character is an emoji (basic check for common emojis)
              const commonEmojis = ['💡', '📝', '⚠️', '✅', '❌', '🔥', '💯', '🎯', '📊', '🚀', '⭐', '🔔', '💰', '📈', '📉']
              if (commonEmojis.includes(firstChar)) {
                icon = firstChar
                content = content.substring(1).trim()
                isCallout = true
                // Update the paragraph content to remove the emoji
                paragraphToken.content = content
              }
            }
          }
        }
        
        if (isCallout) {
          return `<div class="callout-section">
            <div class="callout-icon">
              <span style="font-size: 1.5rem;">${icon}</span>
            </div>
            <div class="callout-content">`
        } else {
          // Return regular blockquote for non-callout content
          return '<blockquote>'
        }
      }

      md.renderer.rules.blockquote_close = function (tokens: any, idx: any, options: any, env: any, renderer: any) {
        // Check if this was a callout by looking at the opening token
        const openToken = tokens.find((token: any, i: number) => 
          i < idx && token.type === 'blockquote_open' && !tokens.slice(i, idx).some((t: any) => t.type === 'blockquote_close')
        )
        
        // Simple check: if we find callout-section in recent tokens, it's a callout
        const recentTokens = tokens.slice(Math.max(0, idx - 10), idx)
        const hasCalloutSection = recentTokens.some((token: any) => 
          token.content && token.content.includes('callout-section')
        )
        
        if (hasCalloutSection) {
          return '</div></div>'
        } else {
          return '</blockquote>'
        }
      }

      // Custom renderer for images to ensure proper styling and accessibility
      md.renderer.rules.image = function (tokens: any, idx: any, options: any, env: any, renderer: any) {
        const token = tokens[idx]
        const src = token.attrGet('src')
        const alt = token.content || 'Image'
        const title = token.attrGet('title') || ''
        
        return `<div class="markdown-image-container">
          <img 
            src="${src}" 
            alt="${alt}" 
            ${title ? `title="${title}"` : ''}
            class="markdown-image"
            loading="lazy"
          />
          ${alt && alt !== 'Image' ? `<p class="markdown-image-caption">${alt}</p>` : ''}
        </div>`
      }

      const result = md.render(content)
      setHtmlContent(result)
    }

    processMarkdown()
  }, [content])

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}