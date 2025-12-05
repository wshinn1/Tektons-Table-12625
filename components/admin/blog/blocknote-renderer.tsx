import "@blocknote/mantine/style.css"

interface BlockNoteRendererProps {
  content: string
  codeBlockBgColor?: string
}

export async function BlockNoteRenderer({ content, codeBlockBgColor = "#f5f5f5" }: BlockNoteRendererProps) {
  if (!content) {
    return null
  }

  try {
    const blocks = JSON.parse(content)

    return (
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: await blocksToHTML(blocks, codeBlockBgColor) }} />
      </div>
    )
  } catch (error) {
    console.error("[v0] Error rendering BlockNote content:", error)
    return <p className="text-muted-foreground">Error loading content</p>
  }
}

async function blocksToHTML(blocks: any[], bgColor: string): Promise<string> {
  let html = ""

  // Helper function to process inline content with formatting
  function processInlineContent(content: any[]): string {
    if (!content) return ""

    return content
      .map((item: any) => {
        let text = item.text || ""

        // Apply inline styles
        if (item.styles) {
          if (item.styles.bold) text = `<strong>${text}</strong>`
          if (item.styles.italic) text = `<em>${text}</em>`
          if (item.styles.underline) text = `<u>${text}</u>`
          if (item.styles.strikethrough) text = `<s>${text}</s>`
          if (item.styles.code) text = `<code>${text}</code>`
        }

        // Apply link
        if (item.type === "link" && item.href) {
          text = `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        }

        return text
      })
      .join("")
  }

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        html += `<p>${processInlineContent(block.content)}</p>`
        break
      case "heading":
        const level = block.props?.level || 1
        html += `<h${level}>${processInlineContent(block.content)}</h${level}>`
        break
      case "bulletListItem":
        html += `<ul><li>${processInlineContent(block.content)}</li></ul>`
        break
      case "numberedListItem":
        html += `<ol><li>${processInlineContent(block.content)}</li></ol>`
        break
      case "image":
        html += `<img src="${block.props?.url || ""}" alt="${block.props?.caption || ""}" class="rounded-lg" />`
        if (block.props?.caption) {
          html += `<figcaption class="text-sm text-muted-foreground mt-2">${block.props.caption}</figcaption>`
        }
        break
      case "code":
        html += `<pre style="background-color: ${bgColor}; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;"><code style="font-size: 0.875rem;">${processInlineContent(block.content)}</code></pre>`
        break
      default:
        break
    }
  }

  return html
}
