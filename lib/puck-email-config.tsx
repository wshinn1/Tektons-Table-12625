import type React from "react"
import type { Config, Data } from "@measured/puck"

// Web-safe fonts for email
export const EMAIL_SAFE_FONTS = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, Times, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
]

// Common email color presets
export const EMAIL_COLOR_PRESETS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#ffffff",
  "#1a73e8",
  "#0066cc",
  "#004488",
  "#d93025",
  "#cc0000",
  "#188038",
  "#00875a",
  "#f9ab00",
  "#ff6600",
]

// Props interfaces for each email block
export interface EmailHeadingProps {
  text: string
  level: "h1" | "h2" | "h3"
  align: "left" | "center" | "right"
  color: string
  fontFamily: string
  fontSize: number
}

export interface EmailTextProps {
  content: string
  align: "left" | "center" | "right"
  color: string
  fontFamily: string
  fontSize: number
  lineHeight: number
}

export interface EmailButtonProps {
  text: string
  url: string
  align: "left" | "center" | "right"
  backgroundColor: string
  textColor: string
  fontFamily: string
  fontSize: number
  paddingX: number
  paddingY: number
  borderRadius: number
}

export interface EmailImageProps {
  src: string
  alt: string
  width: number
  align: "left" | "center" | "right"
  linkUrl?: string
}

export interface EmailDividerProps {
  color: string
  thickness: number
  width: "full" | "75" | "50" | "25"
  paddingY: number
}

export interface EmailSpacerProps {
  height: number
}

export interface EmailColumnsProps {
  columns: "2" | "3"
  gap: number
}

export interface EmailHeaderProps {
  logoUrl?: string
  logoAlt: string
  logoWidth: number
  preheaderText: string
  backgroundColor: string
}

export interface EmailFooterProps {
  organizationName: string
  address: string
  unsubscribeText: string
  showSocialLinks: boolean
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  backgroundColor: string
  textColor: string
}

export interface EmailSocialIconsProps {
  align: "left" | "center" | "right"
  iconSize: number
  gap: number
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
}

export interface EmailCardProps {
  backgroundColor: string
  borderColor: string
  borderRadius: number
  padding: number
}

// Email block components - render for Puck editor preview
// These render React for the editor, but will be converted to email HTML on send

const EmailHeading = ({ text, level, align, color, fontFamily, fontSize }: EmailHeadingProps) => {
  const Tag = level
  const sizes = { h1: 32, h2: 24, h3: 20 }
  const finalSize = fontSize || sizes[level]

  return (
    <Tag
      style={{
        margin: 0,
        padding: "10px 0",
        textAlign: align,
        color,
        fontFamily,
        fontSize: finalSize,
        fontWeight: level === "h1" ? 700 : 600,
        lineHeight: 1.3,
      }}
    >
      {text}
    </Tag>
  )
}

const EmailText = ({ content, align, color, fontFamily, fontSize, lineHeight }: EmailTextProps) => {
  return (
    <p
      style={{
        margin: 0,
        padding: "10px 0",
        textAlign: align,
        color,
        fontFamily,
        fontSize,
        lineHeight,
      }}
    >
      {content}
    </p>
  )
}

const EmailButton = ({
  text,
  url,
  align,
  backgroundColor,
  textColor,
  fontFamily,
  fontSize,
  paddingX,
  paddingY,
  borderRadius,
}: EmailButtonProps) => {
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" }

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align], padding: "10px 0" }}>
      <a
        href={url}
        style={{
          display: "inline-block",
          backgroundColor,
          color: textColor,
          fontFamily,
          fontSize,
          fontWeight: 600,
          textDecoration: "none",
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius,
        }}
      >
        {text}
      </a>
    </div>
  )
}

const EmailImage = ({ src, alt, width, align, linkUrl }: EmailImageProps) => {
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" }

  const img = (
    <img
      src={src || "/placeholder.svg?height=200&width=600&query=email+image"}
      alt={alt}
      width={width}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    />
  )

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align], padding: "10px 0" }}>
      {linkUrl ? <a href={linkUrl}>{img}</a> : img}
    </div>
  )
}

const EmailDivider = ({ color, thickness, width, paddingY }: EmailDividerProps) => {
  const widthMap = { full: "100%", "75": "75%", "50": "50%", "25": "25%" }

  return (
    <div style={{ padding: `${paddingY}px 0`, display: "flex", justifyContent: "center" }}>
      <hr
        style={{
          border: "none",
          borderTop: `${thickness}px solid ${color}`,
          width: widthMap[width],
          margin: 0,
        }}
      />
    </div>
  )
}

const EmailSpacer = ({ height }: EmailSpacerProps) => {
  return <div style={{ height }} />
}

const EmailColumns = ({ columns, gap, children }: EmailColumnsProps & { children?: React.ReactNode }) => {
  const columnCount = Number.parseInt(columns)

  return (
    <div
      style={{
        display: "flex",
        gap,
        padding: "10px 0",
      }}
    >
      {Array.from({ length: columnCount }).map((_, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0 }}>
          {/* Puck will inject children here */}
        </div>
      ))}
    </div>
  )
}

const EmailHeader = ({ logoUrl, logoAlt, logoWidth, preheaderText, backgroundColor }: EmailHeaderProps) => {
  return (
    <div style={{ backgroundColor, padding: "20px", textAlign: "center" }}>
      {/* Preheader text - hidden but shows in email preview */}
      {preheaderText && (
        <div style={{ display: "none", fontSize: 1, color: backgroundColor, lineHeight: 1 }}>{preheaderText}</div>
      )}
      {logoUrl && (
        <img
          src={logoUrl || "/placeholder.svg"}
          alt={logoAlt}
          width={logoWidth}
          style={{ display: "block", margin: "0 auto" }}
        />
      )}
    </div>
  )
}

const EmailFooter = ({
  organizationName,
  address,
  unsubscribeText,
  showSocialLinks,
  facebookUrl,
  twitterUrl,
  instagramUrl,
  backgroundColor,
  textColor,
}: EmailFooterProps) => {
  return (
    <div style={{ backgroundColor, padding: "30px 20px", textAlign: "center" }}>
      {showSocialLinks && (facebookUrl || twitterUrl || instagramUrl) && (
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", gap: 15 }}>
          {facebookUrl && (
            <a href={facebookUrl} style={{ color: textColor, textDecoration: "none" }}>
              Facebook
            </a>
          )}
          {twitterUrl && (
            <a href={twitterUrl} style={{ color: textColor, textDecoration: "none" }}>
              Twitter
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} style={{ color: textColor, textDecoration: "none" }}>
              Instagram
            </a>
          )}
        </div>
      )}
      <p style={{ margin: "0 0 10px", color: textColor, fontSize: 14, fontFamily: "Arial, sans-serif" }}>
        {organizationName}
      </p>
      <p style={{ margin: "0 0 10px", color: textColor, fontSize: 12, fontFamily: "Arial, sans-serif" }}>{address}</p>
      <p style={{ margin: 0, fontSize: 12 }}>
        <a href="{{unsubscribe_url}}" style={{ color: textColor, textDecoration: "underline" }}>
          {unsubscribeText}
        </a>
      </p>
    </div>
  )
}

const EmailSocialIcons = ({
  align,
  iconSize,
  gap,
  facebookUrl,
  twitterUrl,
  instagramUrl,
  linkedinUrl,
  youtubeUrl,
}: EmailSocialIconsProps) => {
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" }
  const socials = [
    { url: facebookUrl, label: "Facebook", icon: "📘" },
    { url: twitterUrl, label: "Twitter", icon: "🐦" },
    { url: instagramUrl, label: "Instagram", icon: "📷" },
    { url: linkedinUrl, label: "LinkedIn", icon: "💼" },
    { url: youtubeUrl, label: "YouTube", icon: "📺" },
  ].filter((s) => s.url)

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align], gap, padding: "10px 0" }}>
      {socials.map(({ url, label, icon }) => (
        <a
          key={label}
          href={url}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: iconSize,
            height: iconSize,
            fontSize: iconSize * 0.6,
            textDecoration: "none",
          }}
          title={label}
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

const EmailCard = ({
  backgroundColor,
  borderColor,
  borderRadius,
  padding,
  children,
}: EmailCardProps & { children?: React.ReactNode }) => {
  return (
    <div
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding,
        margin: "10px 0",
      }}
    >
      {children}
    </div>
  )
}

// Puck configuration for email builder
export const emailPuckConfig: Config = {
  categories: {
    layout: { title: "Layout", components: ["EmailColumns", "EmailCard", "EmailSpacer", "EmailDivider"] },
    typography: { title: "Typography", components: ["EmailHeading", "EmailText"] },
    media: { title: "Media", components: ["EmailImage"] },
    actions: { title: "Actions", components: ["EmailButton", "EmailSocialIcons"] },
    sections: { title: "Sections", components: ["EmailHeader", "EmailFooter"] },
  },
  components: {
    EmailHeading: {
      label: "Heading",
      defaultProps: {
        text: "Your Heading Here",
        level: "h1",
        align: "center",
        color: "#333333",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 32,
      },
      fields: {
        text: { type: "textarea", label: "Heading Text" },
        level: {
          type: "select",
          label: "Heading Level",
          options: [
            { label: "H1 - Main Title", value: "h1" },
            { label: "H2 - Section Title", value: "h2" },
            { label: "H3 - Subsection", value: "h3" },
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
        color: { type: "text", label: "Text Color (hex)" },
        fontFamily: {
          type: "select",
          label: "Font",
          options: EMAIL_SAFE_FONTS,
        },
        fontSize: { type: "number", label: "Font Size (px)" },
      },
      render: EmailHeading,
    },
    EmailText: {
      label: "Text Block",
      defaultProps: {
        content: "Add your email content here. Keep paragraphs short and scannable for better readability.",
        align: "left",
        color: "#333333",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
      },
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
        color: { type: "text", label: "Text Color (hex)" },
        fontFamily: {
          type: "select",
          label: "Font",
          options: EMAIL_SAFE_FONTS,
        },
        fontSize: { type: "number", label: "Font Size (px)" },
        lineHeight: { type: "number", label: "Line Height" },
      },
      render: EmailText,
    },
    EmailButton: {
      label: "Button",
      defaultProps: {
        text: "Click Here",
        url: "#",
        align: "center",
        backgroundColor: "#1a73e8",
        textColor: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 16,
        paddingX: 30,
        paddingY: 14,
        borderRadius: 4,
      },
      fields: {
        text: { type: "text", label: "Button Text" },
        url: { type: "text", label: "Link URL" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        backgroundColor: { type: "text", label: "Background Color (hex)" },
        textColor: { type: "text", label: "Text Color (hex)" },
        fontFamily: {
          type: "select",
          label: "Font",
          options: EMAIL_SAFE_FONTS,
        },
        fontSize: { type: "number", label: "Font Size (px)" },
        paddingX: { type: "number", label: "Horizontal Padding (px)" },
        paddingY: { type: "number", label: "Vertical Padding (px)" },
        borderRadius: { type: "number", label: "Border Radius (px)" },
      },
      render: EmailButton,
    },
    EmailImage: {
      label: "Image",
      defaultProps: {
        src: "",
        alt: "Image",
        width: 600,
        align: "center",
        linkUrl: "",
      },
      fields: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        width: { type: "number", label: "Width (px)" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        linkUrl: { type: "text", label: "Link URL (optional)" },
      },
      render: EmailImage,
    },
    EmailDivider: {
      label: "Divider",
      defaultProps: {
        color: "#e0e0e0",
        thickness: 1,
        width: "full",
        paddingY: 20,
      },
      fields: {
        color: { type: "text", label: "Color (hex)" },
        thickness: { type: "number", label: "Thickness (px)" },
        width: {
          type: "select",
          label: "Width",
          options: [
            { label: "Full Width", value: "full" },
            { label: "75%", value: "75" },
            { label: "50%", value: "50" },
            { label: "25%", value: "25" },
          ],
        },
        paddingY: { type: "number", label: "Vertical Spacing (px)" },
      },
      render: EmailDivider,
    },
    EmailSpacer: {
      label: "Spacer",
      defaultProps: {
        height: 30,
      },
      fields: {
        height: { type: "number", label: "Height (px)" },
      },
      render: EmailSpacer,
    },
    EmailColumns: {
      label: "Columns",
      defaultProps: {
        columns: "2",
        gap: 20,
      },
      fields: {
        columns: {
          type: "radio",
          label: "Number of Columns",
          options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
          ],
        },
        gap: { type: "number", label: "Gap (px)" },
      },
      render: EmailColumns,
    },
    EmailHeader: {
      label: "Email Header",
      defaultProps: {
        logoUrl: "",
        logoAlt: "Logo",
        logoWidth: 150,
        preheaderText: "",
        backgroundColor: "#ffffff",
      },
      fields: {
        logoUrl: { type: "text", label: "Logo URL" },
        logoAlt: { type: "text", label: "Logo Alt Text" },
        logoWidth: { type: "number", label: "Logo Width (px)" },
        preheaderText: { type: "textarea", label: "Preheader Text (shows in inbox preview)" },
        backgroundColor: { type: "text", label: "Background Color (hex)" },
      },
      render: EmailHeader,
    },
    EmailFooter: {
      label: "Email Footer",
      defaultProps: {
        organizationName: "Your Organization",
        address: "123 Main St, City, State 12345",
        unsubscribeText: "Unsubscribe from these emails",
        showSocialLinks: true,
        facebookUrl: "",
        twitterUrl: "",
        instagramUrl: "",
        backgroundColor: "#f5f5f5",
        textColor: "#666666",
      },
      fields: {
        organizationName: { type: "text", label: "Organization Name" },
        address: { type: "textarea", label: "Address" },
        unsubscribeText: { type: "text", label: "Unsubscribe Link Text" },
        showSocialLinks: {
          type: "radio",
          label: "Show Social Links",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        facebookUrl: { type: "text", label: "Facebook URL" },
        twitterUrl: { type: "text", label: "Twitter/X URL" },
        instagramUrl: { type: "text", label: "Instagram URL" },
        linkedinUrl: { type: "text", label: "LinkedIn URL" },
        youtubeUrl: { type: "text", label: "YouTube URL" },
      },
      render: EmailFooter,
    },
    EmailSocialIcons: {
      label: "Social Icons",
      defaultProps: {
        align: "center",
        iconSize: 32,
        gap: 10,
        facebookUrl: "",
        twitterUrl: "",
        instagramUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
      },
      fields: {
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        iconSize: { type: "number", label: "Icon Size (px)" },
        gap: { type: "number", label: "Gap Between Icons (px)" },
        facebookUrl: { type: "text", label: "Facebook URL" },
        twitterUrl: { type: "text", label: "Twitter/X URL" },
        instagramUrl: { type: "text", label: "Instagram URL" },
        linkedinUrl: { type: "text", label: "LinkedIn URL" },
        youtubeUrl: { type: "text", label: "YouTube URL" },
      },
      render: EmailSocialIcons,
    },
    EmailCard: {
      label: "Card",
      defaultProps: {
        backgroundColor: "#ffffff",
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 20,
      },
      fields: {
        backgroundColor: { type: "text", label: "Background Color (hex)" },
        borderColor: { type: "text", label: "Border Color (hex)" },
        borderRadius: { type: "number", label: "Border Radius (px)" },
        padding: { type: "number", label: "Padding (px)" },
      },
      render: EmailCard,
    },
  },
  root: {
    defaultProps: {
      title: "Newsletter",
    },
    fields: {
      title: { type: "text", label: "Email Subject" },
    },
    render: ({ children }) => (
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {children}
      </div>
    ),
  },
}

// Default email template data
export const defaultEmailData: Data = {
  root: { props: { title: "Newsletter" } },
  content: [
    {
      type: "EmailHeader",
      props: {
        id: "header-1",
        logoUrl: "",
        logoAlt: "Logo",
        logoWidth: 150,
        preheaderText: "Your newsletter preview text here",
        backgroundColor: "#ffffff",
      },
    },
    {
      type: "EmailHeading",
      props: {
        id: "heading-1",
        text: "Welcome to Our Newsletter",
        level: "h1",
        align: "center",
        color: "#333333",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 28,
      },
    },
    {
      type: "EmailText",
      props: {
        id: "text-1",
        content: "Thank you for subscribing! We're excited to share updates, news, and valuable content with you.",
        align: "center",
        color: "#666666",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
      },
    },
    {
      type: "EmailButton",
      props: {
        id: "button-1",
        text: "Read More",
        url: "#",
        align: "center",
        backgroundColor: "#1a73e8",
        textColor: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 16,
        paddingX: 30,
        paddingY: 14,
        borderRadius: 4,
      },
    },
    {
      type: "EmailDivider",
      props: {
        id: "divider-1",
        color: "#e0e0e0",
        thickness: 1,
        width: "full",
        paddingY: 30,
      },
    },
    {
      type: "EmailFooter",
      props: {
        id: "footer-1",
        organizationName: "Your Organization",
        address: "123 Main St, City, State 12345",
        unsubscribeText: "Unsubscribe from these emails",
        showSocialLinks: false,
        backgroundColor: "#f5f5f5",
        textColor: "#666666",
      },
    },
  ],
  zones: {},
}

// Function to create config with tenant name
export function createEmailPuckConfig(tenantName: string): Config {
  const config = { ...emailPuckConfig }
  if (config.components.EmailFooter?.defaultProps) {
    config.components.EmailFooter.defaultProps = {
      ...config.components.EmailFooter.defaultProps,
      organizationName: tenantName,
    }
  }
  return config
}

// Alias for backward compatibility
export const defaultEmailTemplate = defaultEmailData
