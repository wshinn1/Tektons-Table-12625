"use client"

import type React from "react"

import type { Config } from "@measured/puck"
import { DropZone } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react"
import { cn } from "@/lib/utils" // Assuming cn is available for class merging

import { createImagePickerField } from "@/components/puck/image-picker-field"
import { PuckContactForm } from "@/components/puck/puck-contact-form"
import { createFontPickerField, getGoogleFontsLink } from "@/components/puck/font-picker-field"
import { createColorPickerField } from "@/components/puck/color-picker-field"
import { createFontSizeField } from "@/components/puck/font-size-field"

const createExternalFetcher = (type: string, tenantId?: string, schemaType: "string" | "object" = "string") => ({
  fetchList: async ({ query }: { query?: string }) => {
    if (!tenantId) return []
    try {
      const params = new URLSearchParams({ type })
      if (query) params.set("query", query)
      const res = await fetch(`/api/tenant/${tenantId}/puck-external?${params}`)
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  ai: {
    schema: { type: schemaType },
  },
})

const createExternalFieldWithSchema = (type: string, tenantId: string, label: string) => ({
  type: "external" as const,
  label,
  placeholder: `Select ${label.toLowerCase()}...`,
  ...createExternalFetcher(type, tenantId),
  getItemSummary: (item: any) => item?.label || `Select ${label}`,
  // AI schema for Puck AI to understand the field
  ai: {
    schema: {
      type: "string",
      description: `The ${label.toLowerCase()} to display. This is fetched from the database.`,
    },
  },
})

export const createPuckConfig = (tenantId?: string): Config => ({
  root: {
    fields: {
      title: { type: "text", label: "Page Title" },
    },
    defaultProps: {
      title: "Page",
    },
    render: ({ children }) => {
      return <div className="min-h-screen">{children}</div>
    },
  },
  categories: {
    layout: { title: "Layout", components: ["Columns", "ColumnsBlock", "Flex", "ContainerBlock", "DividerBlock"] },
    typography: { title: "Typography", components: ["HeadingBlock", "TextBlock", "RichTextBlock"] },
    actions: { title: "Actions", components: ["ButtonBlock", "ButtonGroup", "LinkBlock"] },
    media: { title: "Media", components: ["ImageBlock", "VideoBlock", "EmbedBlock"] },
    sections: {
      title: "Sections",
      components: [
        "HeroBlock",
        "Hero",
        "FeatureGridBlock",
        "TestimonialBlock",
        "CTABlock",
        "Stats",
        "Logos",
        "CardBlock",
      ],
    },
    content: { title: "Content", components: ["BlogPostsBlock", "BlogCategoriesBlock"] },
    forms: { title: "Forms & Donations", components: ["ContactFormBlock", "DonationBlock", "GivingWidgetBlock"] },
  },
  components: {
    // ========== TYPOGRAPHY ==========
    HeadingBlock: {
      label: "Heading",
      fields: {
        title: { type: "text", label: "Heading Text" },
        level: {
          type: "select",
          label: "Heading Level",
          options: [
            { label: "H1 - Main Title", value: "h1" },
            { label: "H2 - Section Title", value: "h2" },
            { label: "H3 - Subsection", value: "h3" },
            { label: "H4 - Minor Heading", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: createColorPickerField("Text Color"),
        fontFamily: createFontPickerField("Font Family"),
        fontSize: createFontSizeField("Font Size (pt)", 32),
        fontWeight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Light", value: "300" },
            { label: "Normal", value: "400" },
            { label: "Medium", value: "500" },
            { label: "Semibold", value: "600" },
            { label: "Bold", value: "700" },
            { label: "Extra Bold", value: "800" },
          ],
        },
        fontStyle: {
          type: "radio",
          label: "Font Style",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Italic", value: "italic" },
          ],
        },
        textDecoration: {
          type: "select",
          label: "Text Decoration",
          options: [
            { label: "None", value: "none" },
            { label: "Underline", value: "underline" },
            { label: "Line Through", value: "line-through" },
          ],
        },
        textTransform: {
          type: "select",
          label: "Text Transform",
          options: [
            { label: "None", value: "none" },
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Capitalize", value: "capitalize" },
          ],
        },
        letterSpacing: {
          type: "select",
          label: "Letter Spacing",
          options: [
            { label: "Tighter", value: "-0.05em" },
            { label: "Tight", value: "-0.025em" },
            { label: "Normal", value: "0" },
            { label: "Wide", value: "0.025em" },
            { label: "Wider", value: "0.05em" },
            { label: "Widest", value: "0.1em" },
          ],
        },
        link: { type: "text", label: "Link URL (optional)" },
        openInNewTab: {
          type: "radio",
          label: "Open link in",
          options: [
            { label: "Same tab", value: "false" },
            { label: "New tab", value: "true" },
          ],
        },
      },
      defaultProps: {
        title: "Your Heading Here",
        level: "h2",
        align: "left",
        color: "",
        fontFamily: "inherit",
        fontSize: 32,
        fontWeight: "700",
        fontStyle: "normal",
        textDecoration: "none",
        textTransform: "none",
        letterSpacing: "0",
        link: "",
        openInNewTab: "false",
      },
      render: ({
        title,
        level,
        align,
        color,
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        textDecoration,
        textTransform,
        letterSpacing,
        link,
        openInNewTab,
      }) => {
        const Tag = level as keyof JSX.IntrinsicElements

        const style: React.CSSProperties = {
          textAlign: align as any,
          color: color || undefined,
          fontFamily: fontFamily !== "inherit" ? fontFamily : undefined,
          fontSize: fontSize ? `${fontSize}pt` : undefined,
          fontWeight: fontWeight,
          fontStyle: fontStyle !== "normal" ? fontStyle : undefined,
          textDecoration: textDecoration !== "none" ? textDecoration : undefined,
          textTransform: textTransform !== "none" ? (textTransform as any) : undefined,
          letterSpacing: letterSpacing !== "0" ? letterSpacing : undefined,
        }

        // Load Google Font if needed
        const fontLink = fontFamily && fontFamily !== "inherit" ? getGoogleFontsLink([fontFamily]) : null

        const content = (
          <>
            {fontLink && <link href={fontLink} rel="stylesheet" />}
            <Tag style={style}>{title}</Tag>
          </>
        )

        if (link) {
          return (
            <a
              href={link}
              target={openInNewTab === "true" ? "_blank" : "_self"}
              rel={openInNewTab === "true" ? "noopener noreferrer" : undefined}
              className="hover:opacity-80 transition-opacity"
            >
              {content}
            </a>
          )
        }

        return content
      },
    },

    TextBlock: {
      label: "Text Paragraph",
      fields: {
        content: { type: "textarea", label: "Content" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        fontSize: createFontSizeField("Font Size (pt)", 16),
        color: createColorPickerField("Text Color"),
        fontFamily: createFontPickerField("Font Family"),
        fontWeight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Light", value: "300" },
            { label: "Normal", value: "400" },
            { label: "Medium", value: "500" },
            { label: "Semibold", value: "600" },
            { label: "Bold", value: "700" },
          ],
        },
        lineHeight: {
          type: "select",
          label: "Line Height",
          options: [
            { label: "Tight (1.25)", value: "1.25" },
            { label: "Normal (1.5)", value: "1.5" },
            { label: "Relaxed (1.75)", value: "1.75" },
            { label: "Loose (2)", value: "2" },
          ],
        },
        link: { type: "text", label: "Link URL (optional)" },
        openInNewTab: {
          type: "radio",
          label: "Open link in",
          options: [
            { label: "Same tab", value: "false" },
            { label: "New tab", value: "true" },
          ],
        },
      },
      defaultProps: {
        content: "Enter your text here. This block is perfect for paragraphs and body content.",
        align: "left",
        fontSize: 16,
        color: "",
        fontFamily: "inherit",
        fontWeight: "400",
        lineHeight: "1.5",
        link: "",
        openInNewTab: "false",
      },
      render: ({ content, align, fontSize, color, fontFamily, fontWeight, lineHeight, link, openInNewTab }) => {
        const style: React.CSSProperties = {
          textAlign: align as any,
          fontSize: fontSize ? `${fontSize}pt` : undefined,
          color: color || undefined,
          fontFamily: fontFamily !== "inherit" ? fontFamily : undefined,
          fontWeight,
          lineHeight,
        }

        const fontLink = fontFamily && fontFamily !== "inherit" ? getGoogleFontsLink([fontFamily]) : null

        const textContent = (
          <>
            {fontLink && <link href={fontLink} rel="stylesheet" />}
            <p style={style}>{content}</p>
          </>
        )

        if (link) {
          return (
            <a
              href={link}
              target={openInNewTab === "true" ? "_blank" : "_self"}
              rel={openInNewTab === "true" ? "noopener noreferrer" : undefined}
              className="hover:opacity-80 transition-opacity"
            >
              {textContent}
            </a>
          )
        }

        return textContent
      },
    },
    RichTextBlock: {
      label: "Rich Text",
      fields: {
        content: { type: "textarea", label: "HTML Content" },
      },
      defaultProps: {
        content:
          "<p>Enter rich HTML content here. You can use <strong>bold</strong>, <em>italic</em>, and other HTML tags.</p>",
      },
      render: ({ content }) => {
        return <div dangerouslySetInnerHTML={{ __html: content }} />
      },
    },

    // ========== INTERACTIVE ==========
    ButtonBlock: {
      label: "Button",
      fields: {
        label: { type: "text", label: "Button Text" },
        href: { type: "text", label: "Link URL" },
        variant: {
          type: "select",
          label: "Style",
          options: [
            { label: "Primary", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
            { label: "Custom", value: "custom" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Default", value: "default" },
            { label: "Large", value: "lg" },
          ],
        },
        backgroundColor: createColorPickerField("Background Color"),
        textColor: createColorPickerField("Text Color"),
        hoverBackgroundColor: createColorPickerField("Hover Background"),
        fontFamily: createFontPickerField("Font Family"),
        fontSize: createFontSizeField("Font Size (pt)", 14),
        fontWeight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Normal", value: "400" },
            { label: "Medium", value: "500" },
            { label: "Semibold", value: "600" },
            { label: "Bold", value: "700" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "12" },
            { label: "Full", value: "9999" },
          ],
        },
        openInNewTab: {
          type: "radio",
          label: "Open link in",
          options: [
            { label: "Same tab", value: "false" },
            { label: "New tab", value: "true" },
          ],
        },
      },
      defaultProps: {
        label: "Click Me",
        href: "#",
        variant: "default",
        size: "default",
        backgroundColor: "",
        textColor: "",
        hoverBackgroundColor: "",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: "500",
        borderRadius: "8",
        openInNewTab: "false",
      },
      render: ({
        label,
        href,
        variant,
        size,
        backgroundColor,
        textColor,
        hoverBackgroundColor,
        fontFamily,
        fontSize,
        fontWeight,
        borderRadius,
        openInNewTab,
      }) => {
        const isCustom = variant === "custom" || backgroundColor || textColor

        const customStyle: React.CSSProperties = {
          backgroundColor: backgroundColor || undefined,
          color: textColor || undefined,
          fontFamily: fontFamily !== "inherit" ? fontFamily : undefined,
          fontSize: fontSize ? `${fontSize}pt` : undefined,
          fontWeight,
          borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        }

        const fontLink = fontFamily && fontFamily !== "inherit" ? getGoogleFontsLink([fontFamily]) : null

        if (isCustom) {
          return (
            <>
              {fontLink && <link href={fontLink} rel="stylesheet" />}
              <a
                href={href}
                target={openInNewTab === "true" ? "_blank" : "_self"}
                rel={openInNewTab === "true" ? "noopener noreferrer" : undefined}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  size === "sm" && "h-9 px-3",
                  size === "default" && "h-10 px-4 py-2",
                  size === "lg" && "h-11 px-8",
                  !backgroundColor && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                style={customStyle}
                onMouseEnter={(e) => {
                  if (hoverBackgroundColor) {
                    ;(e.target as HTMLElement).style.backgroundColor = hoverBackgroundColor
                  }
                }}
                onMouseLeave={(e) => {
                  if (hoverBackgroundColor && backgroundColor) {
                    ;(e.target as HTMLElement).style.backgroundColor = backgroundColor
                  }
                }}
              >
                {label}
              </a>
            </>
          )
        }

        return (
          <>
            {fontLink && <link href={fontLink} rel="stylesheet" />}
            <Button variant={variant as any} size={size as any} asChild style={customStyle}>
              <a
                href={href}
                target={openInNewTab === "true" ? "_blank" : "_self"}
                rel={openInNewTab === "true" ? "noopener noreferrer" : undefined}
              >
                {label}
              </a>
            </Button>
          </>
        )
      },
    },
    LinkBlock: {
      label: "Link",
      fields: {
        text: { type: "text", label: "Link Text" },
        href: { type: "text", label: "URL" },
        openInNewTab: {
          type: "radio",
          label: "Open in New Tab",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      },
      defaultProps: {
        text: "Click here",
        href: "#",
        openInNewTab: "no",
      },
      render: ({ text, href, openInNewTab }) => {
        return (
          <a
            href={href}
            target={openInNewTab === "yes" ? "_blank" : undefined}
            rel={openInNewTab === "yes" ? "noopener noreferrer" : undefined}
            className="text-primary underline hover:no-underline"
          >
            {text}
          </a>
        )
      },
    },

    // ========== MEDIA ==========
    ImageBlock: {
      label: "Image",
      fields: {
        // Use custom image picker with thumbnail grid
        src: tenantId
          ? createImagePickerField(tenantId, "Select Image")
          : { type: "text" as const, label: "Image URL" },
        alt: { type: "text" as const, label: "Alt Text", placeholder: "Describe the image for accessibility" },
        width: {
          type: "select" as const,
          label: "Width",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Full Width", value: "100%" },
            { label: "3/4 Width", value: "75%" },
            { label: "Half Width", value: "50%" },
            { label: "1/3 Width", value: "33%" },
            { label: "1/4 Width", value: "25%" },
            { label: "Custom (px)", value: "custom" },
          ],
        },
        customWidth: {
          type: "number" as const,
          label: "Custom Width (px)",
        },
        height: {
          type: "select" as const,
          label: "Height",
          options: [
            { label: "Auto", value: "auto" },
            { label: "200px", value: "200px" },
            { label: "300px", value: "300px" },
            { label: "400px", value: "400px" },
            { label: "500px", value: "500px" },
            { label: "Custom (px)", value: "custom" },
          ],
        },
        customHeight: {
          type: "number" as const,
          label: "Custom Height (px)",
        },
        objectFit: {
          type: "select" as const,
          label: "Image Fit",
          options: [
            { label: "Cover (fill, crop)", value: "cover" },
            { label: "Contain (fit inside)", value: "contain" },
            { label: "Fill (stretch)", value: "fill" },
            { label: "None (original size)", value: "none" },
          ],
        },
        borderRadius: {
          type: "select" as const,
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
            { label: "Full (Circle)", value: "full" },
          ],
        },
        shadow: {
          type: "select" as const,
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
          ],
        },
        link: { type: "text" as const, label: "Link URL", placeholder: "https://..." },
        linkTarget: {
          type: "select" as const,
          label: "Link Opens In",
          options: [
            { label: "Same Tab", value: "_self" },
            { label: "New Tab", value: "_blank" },
          ],
        },
      },
      defaultProps: {
        src: "",
        alt: "",
        width: "100%",
        height: "auto",
        objectFit: "cover",
        borderRadius: "md",
        shadow: "none",
        link: "",
        linkTarget: "_self",
      },
      render: ({
        src,
        alt,
        width,
        customWidth,
        height,
        customHeight,
        objectFit,
        borderRadius,
        shadow,
        link,
        linkTarget,
      }) => {
        const radiusMap: Record<string, string> = {
          none: "rounded-none",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          xl: "rounded-xl",
          full: "rounded-full",
        }
        const shadowMap: Record<string, string> = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
          xl: "shadow-xl",
        }

        const finalWidth = width === "custom" && customWidth ? `${customWidth}px` : width
        const finalHeight = height === "custom" && customHeight ? `${customHeight}px` : height

        const imageElement = src ? (
          <img
            src={src || "/placeholder.svg"}
            alt={alt || ""}
            className={cn(radiusMap[borderRadius] || "", shadowMap[shadow] || "")}
            style={{
              width: finalWidth,
              height: finalHeight,
              objectFit: objectFit as any,
            }}
          />
        ) : (
          <div
            className={cn(
              "bg-muted flex items-center justify-center text-muted-foreground",
              radiusMap[borderRadius] || "",
            )}
            style={{ width: finalWidth || "100%", height: finalHeight || "200px" }}
          >
            <span>Select an image</span>
          </div>
        )

        if (link) {
          return (
            <a href={link} target={linkTarget} rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}>
              {imageElement}
            </a>
          )
        }

        return imageElement
      },
    },
    VideoBlock: {
      label: "Video",
      fields: {
        src: { type: "text", label: "Video URL" },
        autoplay: {
          type: "radio",
          label: "Autoplay",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        controls: {
          type: "radio",
          label: "Show Controls",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        loop: {
          type: "radio",
          label: "Loop",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      },
      defaultProps: {
        src: "",
        autoplay: "no",
        controls: "yes",
        loop: "no",
      },
      render: ({ src, autoplay, controls, loop }) => {
        return (
          <video
            src={src}
            autoPlay={autoplay === "yes"}
            controls={controls === "yes"}
            loop={loop === "yes"}
            className="w-full max-w-full"
          />
        )
      },
    },
    EmbedBlock: {
      label: "Embed Code",
      fields: {
        embedCode: { type: "textarea", label: "Embed HTML" },
        minHeight: {
          type: "select",
          label: "Minimum Height",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Small (200px)", value: "200px" },
            { label: "Medium (400px)", value: "400px" },
            { label: "Large (600px)", value: "600px" },
            { label: "Extra Large (800px)", value: "800px" },
          ],
        },
        aspectRatio: {
          type: "select",
          label: "Aspect Ratio",
          options: [
            { label: "None", value: "none" },
            { label: "16:9 (Video)", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "9:16 (Vertical)", value: "9/16" },
          ],
        },
      },
      defaultProps: {
        embedCode: "<!-- Paste your embed code here (YouTube, Vimeo, etc.) -->",
        minHeight: "auto",
        aspectRatio: "none",
      },
      render: ({ embedCode, minHeight, aspectRatio }) => {
        const isPlaceholder = !embedCode || embedCode.includes("<!-- Paste your embed code here")

        const containerStyle: React.CSSProperties = {
          minHeight: minHeight !== "auto" ? minHeight : undefined,
          aspectRatio: aspectRatio !== "none" ? aspectRatio : undefined,
        }

        if (isPlaceholder) {
          return (
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30 flex flex-col items-center justify-center p-8"
              style={{ ...containerStyle, minHeight: containerStyle.minHeight || "200px" }}
            >
              <div className="text-muted-foreground text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <p className="font-medium">Embed Code Block</p>
                <p className="text-sm mt-1">Click to add YouTube, Vimeo, or other embed code</p>
              </div>
            </div>
          )
        }

        return (
          <div
            style={containerStyle}
            className="[&>iframe]:w-full [&>iframe]:h-full"
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        )
      },
    },

    // ========== LAYOUT ==========
    Flex: {
      label: "Flex Container",
      fields: {
        direction: {
          type: "radio",
          label: "Direction",
          options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
          ],
        },
        justifyContent: {
          type: "select",
          label: "Justify Content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space Between", value: "space-between" },
            { label: "Space Around", value: "space-around" },
          ],
        },
        alignItems: {
          type: "select",
          label: "Align Items",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        gap: {
          type: "select",
          label: "Gap",
          options: [
            { label: "None", value: "0" },
            { label: "Small (8px)", value: "8" },
            { label: "Medium (16px)", value: "16" },
            { label: "Large (24px)", value: "24" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "None", value: "0" },
            { label: "Small (16px)", value: "16" },
            { label: "Medium (24px)", value: "24" },
            { label: "Large (32px)", value: "32" },
          ],
        },
      },
      defaultProps: {
        direction: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "16",
        padding: "0",
      },
      render: ({ direction, justifyContent, alignItems, gap, padding }) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: direction,
              justifyContent,
              alignItems,
              gap: `${gap}px`,
              padding: `${padding}px`,
            }}
          >
            <DropZone zone="flex-content" />
          </div>
        )
      },
    },

    VerticalSpace: {
      label: "Vertical Space",
      fields: {
        size: {
          type: "select",
          label: "Height",
          options: [
            { label: "8px", value: "8" },
            { label: "16px", value: "16" },
            { label: "24px", value: "24" },
            { label: "32px", value: "32" },
            { label: "48px", value: "48" },
            { label: "64px", value: "64" },
            { label: "96px", value: "96" },
            { label: "128px", value: "128" },
          ],
        },
      },
      defaultProps: {
        size: "24",
      },
      render: ({ size }) => {
        return <div style={{ height: `${size}px`, width: "100%" }} />
      },
    },

    CardBlock: {
      label: "Card",
      fields: {
        title: { type: "text" as const, label: "Title" },
        description: { type: "textarea" as const, label: "Description" },
        content: { type: "textarea" as const, label: "Content" },
        image: tenantId
          ? createImagePickerField(tenantId, "Card Image")
          : { type: "text" as const, label: "Image URL" },
        titleColor: { type: "text", label: "Title Color" },
        textColor: { type: "text", label: "Text Color" },
        backgroundColor: { type: "text", label: "Background Color" },
        borderColor: { type: "text", label: "Border Color" },
        borderWidth: {
          type: "select",
          label: "Border Width",
          options: [
            { label: "None", value: "0" },
            { label: "1px", value: "1" },
            { label: "2px", value: "2" },
            { label: "4px", value: "4" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "12" },
            { label: "Extra Large", value: "16" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "Small", value: "4" },
            { label: "Medium", value: "6" },
            { label: "Large", value: "8" },
            { label: "Extra Large", value: "10" },
          ],
        },
        hoverEffect: {
          type: "select",
          label: "Hover Effect",
          options: [
            { label: "None", value: "none" },
            { label: "Lift", value: "lift" },
            { label: "Shadow Grow", value: "shadow" },
            { label: "Scale", value: "scale" },
          ],
        },
      },
      defaultProps: {
        title: "Card Title",
        description: "A brief description of this card",
        content: "Card content goes here. Add any details you want to share.",
        image: "",
        titleColor: "",
        textColor: "",
        backgroundColor: "",
        borderColor: "",
        borderWidth: "1",
        borderRadius: "8",
        shadow: "sm",
        padding: "6",
        hoverEffect: "none",
      },
      render: ({
        title,
        description,
        content,
        image,
        titleColor,
        textColor,
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
        shadow,
        padding,
        hoverEffect,
      }) => {
        const shadowClasses = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
          xl: "shadow-xl",
        }

        const hoverEffectClasses = {
          none: "",
          lift: "hover:-translate-y-2 transition-transform",
          shadow: "hover:shadow-xl transition-shadow",
          scale: "hover:scale-105 transition-transform",
        }

        const cardStyles = {
          backgroundColor: backgroundColor || undefined,
          color: textColor || undefined,
          borderColor: borderColor || undefined,
          borderWidth: borderWidth ? `${borderWidth}px` : undefined,
          borderRadius: `${borderRadius}px`,
          borderStyle: borderWidth !== "0" ? "solid" : undefined,
        }

        return (
          <Card
            className={`p-${padding} ${shadowClasses[shadow as keyof typeof shadowClasses]} ${hoverEffectClasses[hoverEffect as keyof typeof hoverEffectClasses]}`}
            style={cardStyles}
          >
            {image && (
              <img
                src={image || "/placeholder.svg"}
                alt={title || "Card image"}
                className="w-full h-48 object-cover rounded-t-md mb-4"
              />
            )}
            <CardHeader>
              <CardTitle style={{ color: titleColor || undefined }}>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{content}</p>
            </CardContent>
          </Card>
        )
      },
    },
    ContainerBlock: {
      label: "Container",
      fields: {
        maxWidth: {
          type: "select",
          label: "Max Width",
          options: [
            { label: "Small (640px)", value: "sm" },
            { label: "Medium (768px)", value: "md" },
            { label: "Large (1024px)", value: "lg" },
            { label: "XL (1280px)", value: "xl" },
            { label: "Full Width", value: "full" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "12" },
          ],
        },
        background: { type: "text", label: "Background Color" },
      },
      defaultProps: {
        maxWidth: "lg",
        padding: "4",
        background: "",
      },
      render: ({ maxWidth, padding, background }) => {
        const maxWidthClasses = {
          sm: "max-w-sm",
          md: "max-w-md",
          lg: "max-w-lg",
          xl: "max-w-xl",
          full: "max-w-full",
        }
        return (
          <div
            className={`mx-auto ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]} p-${padding}`}
            style={{ backgroundColor: background || undefined }}
          >
            <DropZone zone="content" />
          </div>
        )
      },
    },
    Columns: {
      label: "Columns (Advanced)",
      fields: {
        distribution: {
          type: "radio",
          label: "Column Distribution",
          options: [
            { label: "Auto (Equal)", value: "auto" },
            { label: "Manual", value: "manual" },
          ],
        },
        columns: {
          type: "array",
          label: "Columns",
          arrayFields: {
            span: {
              type: "number",
              label: "Column Span",
            },
          },
          defaultItemProps: {
            span: 6,
          },
        },
      },
      defaultProps: {
        distribution: "auto",
        columns: [{ span: 6 }, { span: 6 }],
      },
      render: ({ columns, distribution }) => {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                distribution === "manual"
                  ? columns.map((col: any) => `${col.span || 1}fr`).join(" ")
                  : `repeat(${columns.length}, 1fr)`,
              gap: "24px",
            }}
          >
            {columns.map((_col: any, idx: number) => (
              <div key={idx} style={{ minHeight: "100px" }}>
                <DropZone zone={`column-${idx}`} />
              </div>
            ))}
          </div>
        )
      },
    },
    ColumnsBlock: {
      label: "Columns (Simple)",
      fields: {
        columns: {
          type: "select",
          label: "Number of Columns",
          options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" },
          ],
        },
        gap: {
          type: "select",
          label: "Gap Size",
          options: [
            { label: "Small", value: "4" },
            { label: "Medium", value: "6" },
            { label: "Large", value: "8" },
          ],
        },
      },
      defaultProps: {
        columns: "2",
        gap: "6",
      },
      render: ({ columns, gap }) => {
        const cols = Number.parseInt(columns)
        const gridClasses: Record<string, string> = {
          "2": "grid-cols-1 md:grid-cols-2",
          "3": "grid-cols-1 md:grid-cols-3",
          "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        }
        const gapClasses: Record<string, string> = {
          "4": "gap-4",
          "6": "gap-6",
          "8": "gap-8",
        }
        return (
          <div className={`grid ${gridClasses[columns] || gridClasses["2"]} ${gapClasses[gap] || gapClasses["6"]}`}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-4">
                <DropZone zone={`column-${i}`} />
              </div>
            ))}
          </div>
        )
      },
    },
    SpacerBlock: {
      label: "Spacer",
      fields: {
        height: {
          type: "select",
          label: "Height",
          options: [
            { label: "Small (16px)", value: "16" },
            { label: "Medium (32px)", value: "32" },
            { label: "Large (64px)", value: "64" },
            { label: "XL (96px)", value: "96" },
          ],
        },
      },
      defaultProps: {
        height: "32",
      },
      render: ({ height }) => {
        return <div style={{ height: `${height}px` }} />
      },
    },
    DividerBlock: {
      label: "Divider",
      fields: {
        color: { type: "text", label: "Color" },
        thickness: {
          type: "select",
          label: "Thickness",
          options: [
            { label: "Thin", value: "1" },
            { label: "Medium", value: "2" },
            { label: "Thick", value: "4" },
          ],
        },
      },
      defaultProps: {
        color: "#e5e7eb",
        thickness: "1",
      },
      render: ({ color, thickness }) => {
        return <hr style={{ borderColor: color, borderWidth: `${thickness}px` }} className="w-full" />
      },
    },

    // ========== DATA BLOCKS ==========
    Stats: {
      label: "Statistics",
      fields: {
        items: {
          type: "array",
          label: "Stats",
          arrayFields: {
            value: { type: "text", label: "Value" },
            label: { type: "text", label: "Label" },
          },
          defaultItemProps: {
            value: "100+",
            label: "Customers",
          },
        },
      },
      defaultProps: {
        items: [
          { value: "10k+", label: "Users" },
          { value: "99%", label: "Uptime" },
          { value: "24/7", label: "Support" },
        ],
      },
      render: ({ items }) => {
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-primary">{item.value}</div>
                <div className="text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        )
      },
    },

    Logos: {
      label: "Logo Grid",
      fields: {
        title: { type: "text", label: "Title" },
        logos: {
          type: "array",
          label: "Logos",
          arrayFields: {
            src: { type: "text", label: "Image URL" },
            alt: { type: "text", label: "Alt Text" },
          },
          defaultItemProps: {
            src: "/generic-company-logo.png",
            alt: "Company logo",
          },
        },
      },
      defaultProps: {
        title: "Trusted by leading organizations",
        logos: [
          { src: "/abstract-company-logo.png", alt: "Company 1" },
          { src: "/abstract-company-logo.png", alt: "Company 2" },
          { src: "/abstract-geometric-logo.png", alt: "Company 3" },
          { src: "/abstract-geometric-logo.png", alt: "Company 4" },
        ],
      },
      render: ({ title, logos }) => {
        return (
          <div className="py-12 text-center">
            {title && <p className="text-muted-foreground mb-8">{title}</p>}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {logos.map((logo: any, idx: number) => (
                <img
                  key={idx}
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.alt}
                  className="h-8 md:h-10 w-auto opacity-60 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          </div>
        )
      },
    },

    ButtonGroup: {
      label: "Button Group",
      fields: {
        buttons: {
          type: "array",
          label: "Buttons",
          arrayFields: {
            label: { type: "text", label: "Text" },
            href: { type: "text", label: "URL" },
            variant: {
              type: "select",
              label: "Style",
              options: [
                { label: "Primary", value: "default" },
                { label: "Secondary", value: "secondary" },
                { label: "Outline", value: "outline" },
                { label: "Ghost", value: "ghost" },
                { label: "Destructive", value: "destructive" },
                { label: "Custom", value: "custom" },
              ],
            },
            size: {
              type: "select",
              label: "Size",
              options: [
                { label: "Small", value: "sm" },
                { label: "Medium", value: "default" },
                { label: "Large", value: "lg" },
              ],
            },
            backgroundColor: { type: "text", label: "Background Color (hex)" },
            hoverBackgroundColor: { type: "text", label: "Hover Background (hex)" },
            textColor: { type: "text", label: "Text Color (hex)" },
            hoverTextColor: { type: "text", label: "Hover Text Color (hex)" },
            borderColor: { type: "text", label: "Border Color (hex)" },
            borderWidth: {
              type: "select",
              label: "Border Width",
              options: [
                { label: "None", value: "0" },
                { label: "1px", value: "1" },
                { label: "2px", value: "2" },
                { label: "4px", value: "4" },
              ],
            },
            borderRadius: {
              type: "select",
              label: "Border Radius",
              options: [
                { label: "None", value: "0" },
                { label: "Small", value: "4" },
                { label: "Medium", value: "8" },
                { label: "Large", value: "12" },
                { label: "Full", value: "9999" },
              ],
            },
            shadow: {
              type: "select",
              label: "Shadow",
              options: [
                { label: "None", value: "none" },
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
                { label: "Extra Large", value: "xl" },
              ],
            },
            effect: {
              type: "select",
              label: "Hover Effect",
              options: [
                { label: "None", value: "none" },
                { label: "Scale Up", value: "scale" },
                { label: "Lift Up", value: "lift" },
                { label: "Glow", value: "glow" },
              ],
            },
          },
          defaultItemProps: {
            label: "Button",
            href: "#",
            variant: "default",
            size: "default",
            backgroundColor: "",
            hoverBackgroundColor: "",
            textColor: "",
            hoverTextColor: "",
            borderColor: "",
            borderWidth: "0",
            borderRadius: "8",
            shadow: "none",
            effect: "none",
          },
        },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        gap: {
          type: "select",
          label: "Spacing Between Buttons",
          options: [
            { label: "Small", value: "2" },
            { label: "Medium", value: "4" },
            { label: "Large", value: "6" },
            { label: "Extra Large", value: "8" },
          ],
        },
        fontFamily: createFontPickerField("Button Font Family"),
        fontSize: createFontSizeField("Button Font Size (pt)", 14),
      },
      defaultProps: {
        buttons: [
          {
            label: "Get Started",
            href: "#",
            variant: "default",
            size: "default",
            backgroundColor: "",
            hoverBackgroundColor: "",
            textColor: "",
            hoverTextColor: "",
            borderColor: "",
            borderWidth: "0",
            borderRadius: "8",
            shadow: "none",
            effect: "none",
          },
          {
            label: "Learn More",
            href: "#",
            variant: "outline",
            size: "default",
            backgroundColor: "",
            hoverBackgroundColor: "",
            textColor: "",
            hoverTextColor: "",
            borderColor: "",
            borderWidth: "0",
            borderRadius: "8",
            shadow: "none",
            effect: "none",
          },
        ],
        align: "center",
        gap: "4",
        fontFamily: "inherit",
        fontSize: 14,
      },
      render: ({ buttons, align, gap, fontFamily, fontSize }) => {
        const alignClasses = {
          left: "justify-start",
          center: "justify-center",
          right: "justify-end",
        }

        const shadowClasses = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
          xl: "shadow-xl",
        }

        const effectClasses = {
          none: "",
          scale: "hover:scale-105 transition-transform",
          lift: "hover:-translate-y-1 transition-transform",
          glow: "hover:shadow-lg transition-shadow",
        }

        const fontLink = fontFamily && fontFamily !== "inherit" ? getGoogleFontsLink([fontFamily]) : null

        return (
          <>
            {fontLink && <link href={fontLink} rel="stylesheet" />}
            <div className={`flex flex-wrap gap-${gap} ${alignClasses[align as keyof typeof alignClasses]}`}>
              {buttons.map((btn: any, idx: number) => {
                const customStyles: React.CSSProperties = {
                  backgroundColor: btn.backgroundColor || undefined,
                  color: btn.textColor || undefined,
                  borderColor: btn.borderColor || undefined,
                  borderWidth: btn.borderWidth ? `${btn.borderWidth}px` : undefined,
                  borderRadius: `${btn.borderRadius}px`,
                  borderStyle: btn.borderWidth !== "0" ? "solid" : undefined,
                  fontFamily: fontFamily !== "inherit" ? fontFamily : undefined,
                  fontSize: fontSize ? `${fontSize}pt` : undefined,
                }

                return (
                  <Button
                    key={idx}
                    variant={btn.variant as any}
                    size={btn.size as any}
                    asChild
                    className={`${shadowClasses[btn.shadow as keyof typeof shadowClasses]} ${effectClasses[btn.effect as keyof typeof effectClasses]}`}
                    style={customStyles}
                  >
                    <a href={btn.href}>{btn.label}</a>
                  </Button>
                )
              })}
            </div>
          </>
        )
      },
    },

    // ========== SECTIONS ==========
    HeroBlock: {
      label: "Hero Section",
      fields: {
        title: { type: "text" as const, label: "Title" },
        subtitle: { type: "textarea" as const, label: "Subtitle" },
        buttonText: { type: "text" as const, label: "Button Text" },
        buttonHref: { type: "text" as const, label: "Button URL" },
        buttonVariant: {
          type: "select" as const,
          label: "Button Style",
          options: [
            { label: "Primary", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
        buttonSize: {
          type: "select" as const,
          label: "Button Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "default" },
            { label: "Large", value: "lg" },
          ],
        },
        backgroundImage: tenantId
          ? createImagePickerField(tenantId, "Background Image")
          : { type: "text" as const, label: "Background Image URL" },
        backgroundColor: { type: "text", label: "Background Color" },
        gradientFrom: { type: "text", label: "Gradient From Color" },
        gradientTo: { type: "text", label: "Gradient To Color" },
        overlayOpacity: {
          type: "select" as const,
          label: "Image Overlay Opacity",
          options: [
            { label: "None", value: "0" },
            { label: "10%", value: "10" },
            { label: "20%", value: "20" },
            { label: "30%", value: "30" },
            { label: "40%", value: "40" },
            { label: "50%", value: "50" },
            { label: "60%", value: "60" },
            { label: "70%", value: "70" },
          ],
        },
        textColor: { type: "text", label: "Text Color" },
        titleSize: {
          type: "select" as const,
          label: "Title Size",
          options: [
            { label: "Small", value: "text-3xl md:text-4xl" },
            { label: "Medium", value: "text-4xl md:text-5xl" },
            { label: "Large", value: "text-5xl md:text-6xl" },
            { label: "Extra Large", value: "text-6xl md:text-7xl" },
          ],
        },
        subtitleSize: {
          type: "select" as const,
          label: "Subtitle Size",
          options: [
            { label: "Small", value: "text-base" },
            { label: "Medium", value: "text-lg" },
            { label: "Large", value: "text-xl" },
            { label: "Extra Large", value: "text-2xl" },
          ],
        },
        align: {
          type: "radio" as const,
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        paddingY: {
          type: "select" as const,
          label: "Vertical Padding",
          options: [
            { label: "Small", value: "12" },
            { label: "Medium", value: "20" },
            { label: "Large", value: "32" },
            { label: "Extra Large", value: "40" },
          ],
        },
      },
      defaultProps: {
        title: "Welcome to Our Site",
        subtitle: "Discover amazing content and features that will transform your experience.",
        buttonText: "Get Started",
        buttonHref: "#",
        buttonVariant: "default",
        buttonSize: "lg",
        backgroundImage: "",
        backgroundColor: "#1f2937",
        gradientFrom: "",
        gradientTo: "",
        overlayOpacity: "50",
        textColor: "#ffffff",
        titleSize: "text-4xl md:text-5xl",
        subtitleSize: "text-xl",
        align: "center",
        paddingY: "20",
      },
      render: ({
        title,
        subtitle,
        buttonText,
        buttonHref,
        buttonVariant,
        buttonSize,
        backgroundImage,
        backgroundColor,
        gradientFrom,
        gradientTo,
        overlayOpacity,
        textColor,
        titleSize,
        subtitleSize,
        align,
        paddingY,
      }) => {
        const hasGradient = gradientFrom && gradientTo
        const backgroundStyle = hasGradient
          ? { backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }
          : {
              backgroundColor,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }

        return (
          <section
            className={`py-${paddingY} px-6 relative`}
            style={{
              ...backgroundStyle,
              color: textColor,
              textAlign: align,
            }}
          >
            {backgroundImage && overlayOpacity !== "0" && (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0, 0, 0, ${Number.parseInt(overlayOpacity) / 100})` }}
              />
            )}
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className={`${titleSize} font-bold mb-4`}>{title}</h1>
              <p className={`${subtitleSize} mb-8 opacity-90`}>{subtitle}</p>
              {buttonText && (
                <Button size={buttonSize as any} variant={buttonVariant as any} asChild>
                  <a href={buttonHref}>{buttonText}</a>
                </Button>
              )}
            </div>
          </section>
        )
      },
    },
    Hero: {
      label: "Hero (Advanced)",
      fields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "Small", value: "32" },
            { label: "Medium", value: "64" },
            { label: "Large", value: "128" },
          ],
        },
        // Typography options
        titleFontFamily: createFontPickerField("Title Font"),
        titleFontSize: createFontSizeField("Title Font Size (pt)", 48),
        titleColor: createColorPickerField("Title Color"),
        descriptionFontFamily: createFontPickerField("Description Font"),
        descriptionFontSize: createFontSizeField("Description Font Size (pt)", 18),
        descriptionColor: createColorPickerField("Description Color"),
        // Image options
        ...(tenantId
          ? { imageUrl: createImagePickerField(tenantId, "Image") }
          : { imageUrl: { type: "text", label: "Image URL" } }),
        imageMode: {
          type: "radio",
          label: "Image Mode",
          options: [
            { label: "Inline", value: "inline" },
            { label: "Background", value: "background" },
          ],
        },
        overlayOpacity: {
          type: "select",
          label: "Background Overlay",
          options: [
            { label: "None", value: "0" },
            { label: "Light (30%)", value: "0.3" },
            { label: "Medium (50%)", value: "0.5" },
            { label: "Dark (70%)", value: "0.7" },
            { label: "Very Dark (90%)", value: "0.9" },
          ],
        },
      },
      defaultProps: {
        title: "Hero Title",
        description: "A compelling description goes here to engage your visitors.",
        align: "center",
        padding: "64",
        titleFontFamily: "inherit",
        titleFontSize: 48,
        titleColor: "",
        descriptionFontFamily: "inherit",
        descriptionFontSize: 18,
        descriptionColor: "",
        imageUrl: "",
        imageMode: "inline",
        overlayOpacity: "0.5",
      },
      render: ({
        title,
        description,
        align,
        padding,
        titleFontFamily,
        titleFontSize,
        titleColor,
        descriptionFontFamily,
        descriptionFontSize,
        descriptionColor,
        imageUrl,
        imageMode,
        overlayOpacity,
      }) => {
        const fonts = [titleFontFamily, descriptionFontFamily].filter((f) => f && f !== "inherit")
        const fontLink = fonts.length > 0 ? getGoogleFontsLink(fonts) : null

        const titleStyle: React.CSSProperties = {
          fontFamily: titleFontFamily !== "inherit" ? titleFontFamily : undefined,
          fontSize: titleFontSize ? `${titleFontSize}pt` : undefined,
          color: titleColor || undefined,
        }

        const descriptionStyle: React.CSSProperties = {
          fontFamily: descriptionFontFamily !== "inherit" ? descriptionFontFamily : undefined,
          fontSize: descriptionFontSize ? `${descriptionFontSize}pt` : undefined,
          color: descriptionColor || undefined,
        }

        return (
          <section
            className="relative"
            style={{
              padding: `${padding}px 24px`,
              textAlign: align,
              backgroundImage: imageMode === "background" && imageUrl ? `url(${imageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {fontLink && <link href={fontLink} rel="stylesheet" />}
            {imageMode === "background" && imageUrl && (
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
            )}
            <div className={`relative max-w-4xl ${align === "center" ? "mx-auto" : ""}`}>
              <h1 className="font-bold mb-4" style={titleStyle}>
                {title}
              </h1>
              <p className="text-muted-foreground mb-8 max-w-2xl" style={descriptionStyle}>
                {description}
              </p>
              <DropZone zone="hero-actions" />
              {imageMode === "inline" && imageUrl && (
                <img src={imageUrl || "/placeholder.svg"} alt="" className="mt-8 rounded-lg shadow-lg max-w-full" />
              )}
            </div>
          </section>
        )
      },
    },
    FeatureGridBlock: {
      label: "Feature Grid",
      fields: {
        title: { type: "text", label: "Section Title" },
        subtitle: { type: "text", label: "Section Subtitle" },
        titleColor: { type: "text", label: "Title Color" },
        subtitleColor: { type: "text", label: "Subtitle Color" },
        backgroundColor: { type: "text", label: "Background Color" },
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" },
          ],
        },
        gap: {
          type: "select",
          label: "Gap Between Items",
          options: [
            { label: "Small", value: "4" },
            { label: "Medium", value: "6" },
            { label: "Large", value: "8" },
            { label: "Extra Large", value: "10" },
          ],
        },
        cardBackgroundColor: { type: "text", label: "Card Background" },
        cardBorderColor: { type: "text", label: "Card Border Color" },
        cardShadow: {
          type: "select",
          label: "Card Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        cardHoverEffect: {
          type: "select",
          label: "Card Hover Effect",
          options: [
            { label: "None", value: "none" },
            { label: "Lift", value: "lift" },
            { label: "Scale", value: "scale" },
            { label: "Shadow", value: "shadow" },
          ],
        },
        features: {
          type: "array",
          label: "Features",
          arrayFields: {
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
            icon: { type: "text", label: "Icon (emoji or URL)" },
            iconColor: { type: "text", label: "Icon Color" },
          },
          defaultItemProps: {
            title: "Feature",
            description: "Feature description",
            icon: "⚡",
            iconColor: "",
          },
        },
      },
      defaultProps: {
        title: "Our Features",
        subtitle: "Everything you need to succeed",
        titleColor: "",
        subtitleColor: "",
        backgroundColor: "",
        columns: "3",
        gap: "8",
        cardBackgroundColor: "",
        cardBorderColor: "",
        cardShadow: "sm",
        cardHoverEffect: "none",
        features: [
          {
            title: "Fast & Reliable",
            description: "Lightning fast performance you can count on",
            icon: "⚡",
            iconColor: "",
          },
          {
            title: "Easy to Use",
            description: "Intuitive interface that anyone can master",
            icon: "🎯",
            iconColor: "",
          },
          {
            title: "Secure",
            description: "Your data is protected with enterprise-grade security",
            icon: "🔒",
            iconColor: "",
          },
        ],
      },
      render: ({
        title,
        subtitle,
        titleColor,
        subtitleColor,
        backgroundColor,
        columns,
        gap,
        cardBackgroundColor,
        cardBorderColor,
        cardShadow,
        cardHoverEffect,
        features,
      }) => {
        const shadowClasses = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
        }

        const hoverEffectClasses = {
          none: "",
          lift: "hover:-translate-y-2 transition-transform",
          scale: "hover:scale-105 transition-transform",
          shadow: "hover:shadow-xl transition-shadow",
        }

        return (
          <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: titleColor || undefined }}>
                {title}
              </h2>
              <p className="text-muted-foreground mb-12" style={{ color: subtitleColor || undefined }}>
                {subtitle}
              </p>
              <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap}`}>
                {features.map((feature: any, i: number) => (
                  <Card
                    key={i}
                    className={`p-6 ${shadowClasses[cardShadow as keyof typeof shadowClasses]} ${hoverEffectClasses[cardHoverEffect as keyof typeof cardHoverEffect]}`}
                    style={{
                      backgroundColor: cardBackgroundColor || undefined,
                      borderColor: cardBorderColor || undefined,
                    }}
                  >
                    <div className="text-4xl mb-4" style={{ color: feature.iconColor || undefined }}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )
      },
    },
    TestimonialBlock: {
      label: "Testimonial",
      fields: {
        quote: { type: "textarea", label: "Quote" },
        author: { type: "text", label: "Author Name" },
        role: { type: "text", label: "Author Role" },
        image: { type: "text", label: "Author Image URL" },
        quoteColor: { type: "text", label: "Quote Text Color" },
        authorColor: { type: "text", label: "Author Name Color" },
        roleColor: { type: "text", label: "Role Color" },
        backgroundColor: { type: "text", label: "Background Color" },
        borderColor: { type: "text", label: "Border Color" },
        borderWidth: {
          type: "select",
          label: "Border Width",
          options: [
            { label: "None", value: "0" },
            { label: "1px", value: "1" },
            { label: "2px", value: "2" },
            { label: "4px", value: "4" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "16" },
            { label: "Extra Large", value: "24" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "Small", value: "4" },
            { label: "Medium", value: "6" },
            { label: "Large", value: "8" },
            { label: "Extra Large", value: "10" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      defaultProps: {
        quote:
          "This is an amazing product that has transformed how we work. I highly recommend it to anyone looking for a reliable solution.",
        author: "Jane Doe",
        role: "CEO, Company Inc.",
        image: "/diverse-person-portrait.png",
        quoteColor: "",
        authorColor: "",
        roleColor: "",
        backgroundColor: "",
        borderColor: "",
        borderWidth: "0",
        borderRadius: "8",
        padding: "8",
        shadow: "none",
      },
      render: ({
        quote,
        author,
        role,
        image,
        quoteColor,
        authorColor,
        roleColor,
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
        padding,
        shadow,
      }) => {
        const shadowClasses = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
        }

        const blockStyles = {
          backgroundColor: backgroundColor || undefined,
          borderColor: borderColor || undefined,
          borderWidth: borderWidth ? `${borderWidth}px` : undefined,
          borderRadius: `${borderRadius}px`,
          borderStyle: borderWidth !== "0" ? "solid" : undefined,
        }

        return (
          <div
            className={`p-${padding} text-center max-w-2xl mx-auto ${shadowClasses[shadow as keyof typeof shadowClasses]}`}
            style={blockStyles}
          >
            <p className="text-lg italic mb-6" style={{ color: quoteColor || undefined }}>
              &ldquo;{quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              {image && (
                <img src={image || "/placeholder.svg"} alt={author} className="w-12 h-12 rounded-full object-cover" />
              )}
              <div className="text-left">
                <p className="font-semibold" style={{ color: authorColor || undefined }}>
                  {author}
                </p>
                <p className="text-sm text-muted-foreground" style={{ color: roleColor || undefined }}>
                  {role}
                </p>
              </div>
            </div>
          </div>
        )
      },
    },
    CTABlock: {
      label: "Call to Action",
      fields: {
        title: { type: "text", label: "Title" },
        subtitle: { type: "text", label: "Subtitle" },
        buttonText: { type: "text", label: "Button Text" },
        buttonHref: { type: "text", label: "Button URL" },
        buttonVariant: {
          type: "select",
          label: "Button Style",
          options: [
            { label: "Primary", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
        buttonSize: {
          type: "select",
          label: "Button Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "default" },
            { label: "Large", value: "lg" },
          ],
        },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "8" },
            { label: "Medium", value: "16" },
            { label: "Large", value: "24" },
          ],
        },
        paddingY: {
          type: "select",
          label: "Vertical Padding",
          options: [
            { label: "Small", value: "8" },
            { label: "Medium", value: "16" },
            { label: "Large", value: "24" },
            { label: "Extra Large", value: "32" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      defaultProps: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of satisfied users today.",
        buttonText: "Sign Up Now",
        buttonHref: "#",
        buttonVariant: "secondary",
        buttonSize: "lg",
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        borderRadius: "0",
        paddingY: "16",
        shadow: "none",
      },
      render: ({
        title,
        subtitle,
        buttonText,
        buttonHref,
        buttonVariant,
        buttonSize,
        backgroundColor,
        textColor,
        borderRadius,
        paddingY,
        shadow,
      }) => {
        const shadowClasses = {
          none: "",
          sm: "shadow-sm",
          md: "shadow-md",
          lg: "shadow-lg",
        }

        return (
          <section
            className={`py-${paddingY} px-6 text-center ${shadowClasses[shadow as keyof typeof shadowClasses]}`}
            style={{
              backgroundColor,
              color: textColor,
              borderRadius: `${borderRadius}px`,
            }}
          >
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-xl mb-8 opacity-90">{subtitle}</p>
            <Button size={buttonSize as any} variant={buttonVariant as any} asChild>
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </section>
        )
      },
    },

    // ========== CONTENT BLOCKS (External Fields) ==========
    BlogPostsBlock: {
      label: "Blog Posts",
      fields: {
        title: { type: "text", label: "Section Title" },
        category: tenantId
          ? createExternalFieldWithSchema("blog-categories", tenantId, "string")
          : { type: "text", label: "Category ID" },
        limit: {
          type: "select",
          label: "Number of Posts",
          options: [
            { label: "3 Posts", value: "3" },
            { label: "6 Posts", value: "6" },
            { label: "9 Posts", value: "9" },
          ],
        },
        layout: {
          type: "radio",
          label: "Layout",
          options: [
            { label: "Grid", value: "grid" },
            { label: "List", value: "list" },
          ],
        },
      },
      defaultProps: {
        title: "Latest Blog Posts",
        category: null,
        limit: "3",
        layout: "grid",
      },
      render: ({ title, category, limit, layout }) => {
        const categoryName = typeof category === "object" ? (category as any)?.label : "All"
        return (
          <section className="py-12 px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
            <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {Array.from({ length: Number.parseInt(limit) }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="aspect-video bg-muted rounded mb-4" />
                  <h3 className="font-semibold mb-2">Blog Post {i + 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryName !== "All" ? `Category: ${categoryName}` : "Preview - Posts will load dynamically"}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )
      },
    },
    BlogCategoriesBlock: {
      label: "Blog Categories",
      fields: {
        title: { type: "text", label: "Title" },
        layout: {
          type: "radio",
          label: "Layout",
          options: [
            { label: "Pills", value: "pills" },
            { label: "List", value: "list" },
          ],
        },
      },
      defaultProps: {
        title: "Browse by Category",
        layout: "pills",
      },
      render: ({ title, layout }) => {
        return (
          <section className="py-8 px-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className={layout === "pills" ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
              {["Category 1", "Category 2", "Category 3"].map((cat, i) => (
                <span
                  key={i}
                  className={layout === "pills" ? "px-4 py-2 bg-muted rounded-full text-sm" : "py-2 border-b text-sm"}
                >
                  {cat}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Categories will load dynamically from your blog</p>
          </section>
        )
      },
    },

    // ========== FORMS ==========
    ContactFormBlock: {
      label: "Contact Form",
      fields: {
        title: { type: "text", label: "Form Title" },
        description: { type: "textarea", label: "Description" },
        submitText: { type: "text", label: "Submit Button Text" },
        showSubject: {
          type: "radio",
          label: "Show Subject Field",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      },
      defaultProps: {
        title: "Contact Us",
        description: "Have a question? We'd love to hear from you.",
        submitText: "Send Message",
        showSubject: "yes",
      },
      permissions: {
        delete: true,
        duplicate: true,
        drag: true,
      },
      render: ({ title, description, submitText, showSubject, puck }) => {
        // Get tenantId from window location in browser
        const tenantId = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : ""

        // In editor mode (puck.isEditing), show preview
        // On published page, show working form
        const isEditing = puck?.isEditing

        if (isEditing) {
          return (
            <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              {description && <p className="text-muted-foreground mb-4">{description}</p>}
              <p className="text-xs text-muted-foreground mb-4 bg-muted p-2 rounded">
                Editor Preview: The published page will have a working contact form that saves submissions to your
                dashboard.
              </p>
              <div className="space-y-4 opacity-60">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled
                  />
                </div>
                {showSubject === "yes" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Subject"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      disabled
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    placeholder="Your message"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled
                  />
                </div>
                <Button type="button" className="w-full" disabled>
                  {submitText}
                </Button>
              </div>
            </div>
          )
        }

        // Published page - render working form
        return (
          <PuckContactForm
            tenantId={tenantId}
            title={title}
            description={description}
            submitText={submitText}
            showSubject={showSubject}
          />
        )
      },
    },
    DonationBlock: {
      label: "Donation Widget",
      fields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        donationUrl: { type: "text", label: "Donation Page URL (e.g., /donate or full URL)" },
        suggestedAmounts: { type: "text", label: "Suggested Amounts (comma-separated)" },
        buttonText: { type: "text", label: "Button Text" },
      },
      defaultProps: {
        title: "Support Our Mission",
        description: "Your donation helps us continue our important work.",
        donationUrl: "/donate",
        suggestedAmounts: "25,50,100,250",
        buttonText: "Donate Now",
      },
      permissions: {
        delete: true,
        duplicate: true,
        drag: true,
      },
      render: ({ title, description, donationUrl, suggestedAmounts, buttonText }) => {
        const amounts = suggestedAmounts.split(",").map((a: string) => a.trim())
        return (
          <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && <p className="text-muted-foreground mb-4">{description}</p>}
            {donationUrl && (
              <p className="text-xs text-muted-foreground mb-4 bg-muted p-2 rounded">Links to: {donationUrl}</p>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {amounts.map((amount: string) => (
                <button
                  key={amount}
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <input
                type="number"
                placeholder="Custom amount"
                className="w-full px-3 py-2 border rounded-md bg-background"
                readOnly
              />
            </div>
            <Button className="w-full" asChild>
              <a href={donationUrl || "/donate"}>{buttonText}</a>
            </Button>
          </div>
        )
      },
    },
    GivingWidgetBlock: {
      label: "Giving Widget",
      fields: {
        title: { type: "text", label: "Widget Title" },
        description: { type: "textarea", label: "Description" },
        source: {
          type: "radio",
          label: "Donation Source",
          options: [
            { label: "Main Giving Page", value: "main" },
            { label: "Campaign", value: "campaign" },
          ],
        },
        campaignId: tenantId
          ? {
              ...createExternalFieldWithSchema("campaigns", tenantId, "object"),
              // Only show when source is "campaign"
            }
          : { type: "text", label: "Campaign ID" },
        style: {
          type: "radio",
          label: "Widget Style",
          options: [
            { label: "Full", value: "full" },
            { label: "Compact", value: "compact" },
            { label: "Inline", value: "inline" },
          ],
        },
        showProgress: {
          type: "radio",
          label: "Show Progress Bar",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        buttonText: { type: "text", label: "Button Text" },
      },
      defaultProps: {
        source: "main",
        campaignId: null,
        style: "full",
        showProgress: true,
        buttonText: "Donate Now",
      },
      resolveFields: async (data: any) => {
        // Show campaign selector only when source is "campaign"
        const fields: any = {
          title: { type: "text", label: "Widget Title" },
          description: { type: "textarea", label: "Description" },
          source: {
            type: "radio",
            label: "Donation Source",
            options: [
              { label: "Main Giving Page", value: "main" },
              { label: "Campaign", value: "campaign" },
            ],
          },
        }

        if (data.props?.source === "campaign") {
          fields.campaignId = {
            type: "external",
            label: "Select Campaign",
            placeholder: "Choose a campaign",
            fetchList: async () => {
              try {
                const tenantId = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : ""
                if (!tenantId) return []
                const res = await fetch(`/api/tenant/${tenantId}/puck-external?type=campaigns`)
                if (!res.ok) return []
                return await res.json()
              } catch {
                return []
              }
            },
            getItemSummary: (item: any) => item?.label || "Select campaign",
            ai: {
              schema: {
                type: "object",
                description: "The campaign to display. This is fetched from the database.",
              },
            },
          }
        }

        return {
          ...fields,
          style: {
            type: "radio",
            label: "Widget Style",
            options: [
              { label: "Full", value: "full" },
              { label: "Compact", value: "compact" },
              { label: "Inline", value: "inline" },
            ],
          },
          showProgress: {
            type: "radio",
            label: "Show Progress Bar",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          buttonText: { type: "text", label: "Button Text" },
        }
      },
      permissions: {
        delete: true,
        duplicate: true,
        drag: true,
      },
      render: ({ source, campaignId, style, showProgress, buttonText, title, description }) => {
        const isCompact = style === "compact"
        const isInline = style === "inline"
        const isCampaign = source === "campaign"
        const campaign = campaignId as any

        // Default values for preview
        const widgetTitle = title || (isCampaign && campaign?.label ? campaign.label : "Support Our Mission")
        const widgetDescription =
          description ||
          (isCampaign && campaign?.description
            ? campaign.description
            : "Your generous donation helps us continue our important work in the community.")
        const goalAmount = isCampaign && campaign?.goalAmount ? campaign.goalAmount : 10000
        const currentAmount = isCampaign && campaign?.currentAmount ? campaign.currentAmount : 2500
        const suggestedAmounts =
          isCampaign && campaign?.suggestedAmounts ? campaign.suggestedAmounts : [25, 50, 100, 250]
        const progressPercent = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0

        if (isInline) {
          return (
            <div className="w-full p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{widgetTitle}</h3>
                  {showProgress === true && (
                    <p className="text-sm text-muted-foreground">
                      ${currentAmount.toLocaleString()} of ${goalAmount.toLocaleString()} raised
                    </p>
                  )}
                </div>
                {showProgress === true && (
                  <div className="w-full sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                )}
                <Button size="lg">{buttonText}</Button>
              </div>
            </div>
          )
        }

        return (
          <div
            className={`mx-auto bg-card rounded-xl border shadow-sm overflow-hidden ${isCompact ? "max-w-sm" : "max-w-md"}`}
          >
            {/* Header */}
            <div className={`bg-primary/5 ${isCompact ? "p-4" : "p-6"}`}>
              <h3 className={`font-bold text-center ${isCompact ? "text-lg" : "text-xl"}`}>{widgetTitle}</h3>
              {widgetDescription && !isCompact && (
                <p className="text-muted-foreground text-center mt-2 text-sm">{widgetDescription}</p>
              )}
            </div>

            {/* Progress Section */}
            {showProgress === true && (
              <div className={`${isCompact ? "px-4 py-3" : "px-6 py-4"} border-b`}>
                <div className="flex justify-center mb-3">
                  <div className={`relative ${isCompact ? "w-20 h-20" : "w-24 h-24"}`}>
                    <svg className={`transform -rotate-90 ${isCompact ? "w-20 h-20" : "w-24 h-24"}`}>
                      <circle
                        cx={isCompact ? "40" : "48"}
                        cy={isCompact ? "40" : "48"}
                        r={isCompact ? "32" : "40"}
                        stroke="currentColor"
                        strokeWidth={isCompact ? "6" : "8"}
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx={isCompact ? "40" : "48"}
                        cy={isCompact ? "40" : "48"}
                        r={isCompact ? "32" : "40"}
                        stroke="currentColor"
                        strokeWidth={isCompact ? "6" : "8"}
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * (isCompact ? 32 : 40)}`}
                        strokeDashoffset={`${2 * Math.PI * (isCompact ? 32 : 40) * (1 - progressPercent / 100)}`}
                        className="text-primary transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-bold ${isCompact ? "text-lg" : "text-xl"}`}>
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                </div>
                {showProgress === true && (
                  <div className="text-center">
                    <p className={`font-semibold ${isCompact ? "text-base" : "text-lg"}`}>
                      ${currentAmount.toLocaleString()} raised
                    </p>
                    <p className="text-sm text-muted-foreground">of ${goalAmount.toLocaleString()} goal</p>
                  </div>
                )}
              </div>
            )}

            {/* Donation Amounts */}
            <div className={`${isCompact ? "p-4" : "p-6"}`}>
              <div className={`grid gap-2 mb-4 ${isCompact ? "grid-cols-2" : "grid-cols-4"}`}>
                {(Array.isArray(suggestedAmounts) ? suggestedAmounts : [25, 50, 100, 250])
                  .slice(0, isCompact ? 4 : 4)
                  .map((amount: number) => (
                    <button
                      key={amount}
                      type="button"
                      className="px-3 py-2 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                    >
                      ${amount}
                    </button>
                  ))}
              </div>
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Custom amount"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button className="w-full" size={isCompact ? "default" : "lg"}>
                {buttonText}
              </Button>
              {isCampaign && campaign?.label && (
                <p className="text-xs text-center text-muted-foreground mt-3">Donating to: {campaign.label}</p>
              )}
            </div>
          </div>
        )
      },
    },
  },
})

export const puckConfig = createPuckConfig()

export const PuckPageRender = ({ data }: { data: any }) => {
  const { Render } = require("@measured/puck")
  return <Render config={puckConfig} data={data} />
}
