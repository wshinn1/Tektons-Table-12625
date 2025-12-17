import type { Config } from "@measured/puck"
import { DropZone } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react"

const createExternalFetcher = (type: string, tenantId?: string) => ({
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
    layout: {
      title: "Layout",
      components: ["Flex", "Columns", "ColumnsBlock", "ContainerBlock", "VerticalSpace", "SpacerBlock", "DividerBlock"],
    },
    typography: {
      title: "Typography",
      components: ["HeadingBlock", "TextBlock", "RichTextBlock"],
    },
    actions: {
      title: "Actions",
      components: ["ButtonBlock", "ButtonGroup", "LinkBlock"],
    },
    media: {
      title: "Media",
      components: ["ImageBlock", "VideoBlock", "EmbedBlock"],
    },
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
    content: {
      title: "Content",
      components: ["BlogPostsBlock", "BlogCategoriesBlock"],
    },
    forms: {
      title: "Forms",
      components: ["ContactFormBlock", "DonationBlock", "GivingWidgetBlock"],
    },
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
      },
      defaultProps: {
        title: "Your Heading Here",
        level: "h2",
        align: "left",
      },
      render: ({ title, level, align }) => {
        const Tag = level as keyof JSX.IntrinsicElements
        const classes = {
          h1: "text-4xl font-bold",
          h2: "text-3xl font-bold",
          h3: "text-2xl font-semibold",
          h4: "text-xl font-semibold",
        }
        return (
          <Tag className={classes[level as keyof typeof classes]} style={{ textAlign: align }}>
            {title}
          </Tag>
        )
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
      },
      defaultProps: {
        content: "Enter your text here. This block is perfect for paragraphs and body content.",
        align: "left",
      },
      render: ({ content, align }) => {
        return <p style={{ textAlign: align }}>{content}</p>
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
      },
      defaultProps: {
        label: "Click Me",
        href: "#",
        variant: "default",
        size: "default",
      },
      render: ({ label, href, variant, size }) => {
        return (
          <Button variant={variant as any} size={size as any} asChild>
            <a href={href}>{label}</a>
          </Button>
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
        src: tenantId
          ? {
              type: "external",
              label: "Select Image",
              placeholder: "Search media library...",
              ...createExternalFetcher("media", tenantId),
              getItemSummary: (item: any) => item?.label || "Select image",
            }
          : { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        width: { type: "number", label: "Width (px)" },
        height: { type: "number", label: "Height (px)" },
        rounded: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Full (Circle)", value: "full" },
          ],
        },
      },
      defaultProps: {
        src: "/placeholder.svg?height=300&width=400",
        alt: "Image description",
        width: 400,
        height: 300,
        rounded: "md",
      },
      render: ({ src, alt, width, height, rounded }) => {
        const imageSrc = typeof src === "object" ? (src as any)?.value || (src as any)?.url : src
        const roundedClasses = {
          none: "",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          full: "rounded-full",
        }
        return (
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className={`max-w-full h-auto ${roundedClasses[rounded as keyof typeof roundedClasses]}`}
          />
        )
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
      },
      defaultProps: {
        embedCode: "<!-- Paste your embed code here (YouTube, Vimeo, etc.) -->",
      },
      render: ({ embedCode }) => {
        return <div dangerouslySetInnerHTML={{ __html: embedCode }} />
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
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        content: { type: "textarea", label: "Content" },
      },
      defaultProps: {
        title: "Card Title",
        description: "A brief description of this card",
        content: "Card content goes here. Add any details you want to share.",
      },
      render: ({ title, description, content }) => {
        return (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
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
              ],
            },
          },
          defaultItemProps: {
            label: "Button",
            href: "#",
            variant: "default",
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
      },
      defaultProps: {
        buttons: [
          { label: "Get Started", href: "#", variant: "default" },
          { label: "Learn More", href: "#", variant: "outline" },
        ],
        align: "center",
      },
      render: ({ buttons, align }) => {
        const alignClasses = {
          left: "justify-start",
          center: "justify-center",
          right: "justify-end",
        }
        return (
          <div className={`flex flex-wrap gap-4 ${alignClasses[align as keyof typeof alignClasses]}`}>
            {buttons.map((btn: any, idx: number) => (
              <Button key={idx} variant={btn.variant as any} asChild>
                <a href={btn.href}>{btn.label}</a>
              </Button>
            ))}
          </div>
        )
      },
    },

    // ========== SECTIONS ==========
    HeroBlock: {
      label: "Hero Section",
      fields: {
        title: { type: "text", label: "Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        buttonText: { type: "text", label: "Button Text" },
        buttonHref: { type: "text", label: "Button URL" },
        backgroundImage: { type: "text", label: "Background Image URL" },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Welcome to Our Site",
        subtitle: "Discover amazing content and features that will transform your experience.",
        buttonText: "Get Started",
        buttonHref: "#",
        backgroundImage: "",
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        align: "center",
      },
      render: ({ title, subtitle, buttonText, buttonHref, backgroundImage, backgroundColor, textColor, align }) => {
        return (
          <section
            className="py-20 px-6"
            style={{
              backgroundColor,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: textColor,
              textAlign: align,
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              <p className="text-xl mb-8 opacity-90">{subtitle}</p>
              {buttonText && (
                <Button size="lg" asChild>
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
        imageUrl: { type: "text", label: "Image URL" },
        imageMode: {
          type: "radio",
          label: "Image Mode",
          options: [
            { label: "Inline", value: "inline" },
            { label: "Background", value: "background" },
          ],
        },
      },
      defaultProps: {
        title: "Hero Title",
        description: "A compelling description goes here to engage your visitors.",
        align: "center",
        padding: "64",
        imageUrl: "",
        imageMode: "inline",
      },
      render: ({ title, description, align, padding, imageUrl, imageMode }) => {
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
            {imageMode === "background" && imageUrl && <div className="absolute inset-0 bg-black/50" />}
            <div className={`relative max-w-4xl ${align === "center" ? "mx-auto" : ""}`}>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{description}</p>
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
        features: {
          type: "array",
          label: "Features",
          arrayFields: {
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
            icon: { type: "text", label: "Icon (emoji or URL)" },
          },
          defaultItemProps: {
            title: "Feature",
            description: "Feature description",
            icon: "⚡",
          },
        },
      },
      defaultProps: {
        title: "Our Features",
        subtitle: "Everything you need to succeed",
        features: [
          { title: "Fast & Reliable", description: "Lightning fast performance you can count on", icon: "⚡" },
          { title: "Easy to Use", description: "Intuitive interface that anyone can master", icon: "🎯" },
          { title: "Secure", description: "Your data is protected with enterprise-grade security", icon: "🔒" },
        ],
      },
      render: ({ title, subtitle, features }) => {
        return (
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
              <p className="text-muted-foreground mb-12">{subtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature: any, i: number) => (
                  <Card key={i} className="p-6">
                    <div className="text-4xl mb-4">{feature.icon}</div>
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
      },
      defaultProps: {
        quote:
          "This is an amazing product that has transformed how we work. I highly recommend it to anyone looking for a reliable solution.",
        author: "Jane Doe",
        role: "CEO, Company Inc.",
        image: "/diverse-person-portrait.png",
      },
      render: ({ quote, author, role, image }) => {
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <p className="text-lg italic mb-6">&ldquo;{quote}&rdquo;</p>
            <div className="flex items-center justify-center gap-4">
              {image && <img src={image || "/placeholder.svg"} alt={author} className="w-12 h-12 rounded-full" />}
              <div className="text-left">
                <p className="font-semibold">{author}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
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
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
      },
      defaultProps: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of satisfied users today.",
        buttonText: "Sign Up Now",
        buttonHref: "#",
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
      },
      render: ({ title, subtitle, buttonText, buttonHref, backgroundColor, textColor }) => {
        return (
          <section className="py-16 px-6 text-center" style={{ backgroundColor, color: textColor }}>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-xl mb-8 opacity-90">{subtitle}</p>
            <Button size="lg" variant="secondary" asChild>
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
          ? createExternalFieldWithSchema("blog-categories", tenantId, "Filter by Category")
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
      render: ({ title, description, submitText, showSubject }) => {
        return (
          <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && <p className="text-muted-foreground mb-6">{description}</p>}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" placeholder="Your name" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" placeholder="you@example.com" className="w-full px-3 py-2 border rounded-md" />
              </div>
              {showSubject === "yes" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input type="text" placeholder="Subject" className="w-full px-3 py-2 border rounded-md" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea placeholder="Your message" rows={4} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <Button type="submit" className="w-full">
                {submitText}
              </Button>
            </form>
          </div>
        )
      },
    },
    DonationBlock: {
      label: "Donation Widget",
      fields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        suggestedAmounts: { type: "text", label: "Suggested Amounts (comma-separated)" },
        buttonText: { type: "text", label: "Button Text" },
      },
      defaultProps: {
        title: "Support Our Mission",
        description: "Your donation helps us continue our important work.",
        suggestedAmounts: "25,50,100,250",
        buttonText: "Donate Now",
      },
      permissions: {
        delete: true,
        duplicate: true,
        drag: true,
      },
      render: ({ title, description, suggestedAmounts, buttonText }) => {
        const amounts = suggestedAmounts.split(",").map((a: string) => a.trim())
        return (
          <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && <p className="text-muted-foreground mb-6">{description}</p>}
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
              <input type="number" placeholder="Custom amount" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <Button className="w-full">{buttonText}</Button>
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
              ...createExternalFieldWithSchema("campaigns", tenantId, "Select Campaign"),
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
                type: "string",
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
