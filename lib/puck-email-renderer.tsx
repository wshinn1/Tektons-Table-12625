import type { Data } from "@measured/puck"

// Email-safe inline styles
const baseStyles = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333333",
}

// Render a single block to email HTML
function renderBlock(block: { type: string; props: Record<string, unknown> }): string {
  const { type, props } = block

  switch (type) {
    case "EmailHeader":
      return renderEmailHeader(props)
    case "EmailHeading":
      return renderEmailHeading(props)
    case "EmailText":
      return renderEmailText(props)
    case "EmailButton":
      return renderEmailButton(props)
    case "EmailImage":
      return renderEmailImage(props)
    case "EmailDivider":
      return renderEmailDivider(props)
    case "EmailSpacer":
      return renderEmailSpacer(props)
    case "EmailColumns":
      return renderEmailColumns(props)
    case "EmailCard":
      return renderEmailCard(props)
    case "EmailSocialIcons":
      return renderEmailSocialIcons(props)
    case "EmailFooter":
      return renderEmailFooter(props)
    default:
      return ""
  }
}

function renderEmailHeader(props: Record<string, unknown>): string {
  const logoUrl = props.logoUrl as string
  const logoAlt = (props.logoAlt as string) || "Logo"
  const preheaderText = (props.preheaderText as string) || ""
  const backgroundColor = (props.backgroundColor as string) || "#ffffff"
  const alignment = (props.alignment as string) || "center"

  const preheader = preheaderText
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheaderText}</div>`
    : ""

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${logoAlt}" style="max-width:200px;height:auto;display:block;margin:0 ${alignment === "center" ? "auto" : alignment === "right" ? "0 0 auto" : "0"};" />`
    : ""

  return `${preheader}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${backgroundColor};">
  <tr>
    <td style="padding:20px;text-align:${alignment};">
      ${logoHtml}
    </td>
  </tr>
</table>`
}

function renderEmailHeading(props: Record<string, unknown>): string {
  const text = (props.text as string) || ""
  const level = (props.level as string) || "h1"
  const alignment = (props.alignment as string) || "left"
  const color = (props.color as string) || "#333333"
  const fontFamily = (props.fontFamily as string) || "Arial, Helvetica, sans-serif"

  const fontSizes: Record<string, string> = {
    h1: "32px",
    h2: "28px",
    h3: "24px",
    h4: "20px",
  }
  const fontSize = fontSizes[level] || "32px"

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;text-align:${alignment};">
      <${level} style="margin:0;font-family:${fontFamily};font-size:${fontSize};font-weight:bold;color:${color};line-height:1.2;">${text}</${level}>
    </td>
  </tr>
</table>`
}

function renderEmailText(props: Record<string, unknown>): string {
  const text = (props.text as string) || ""
  const alignment = (props.alignment as string) || "left"
  const color = (props.color as string) || "#333333"
  const fontSize = (props.fontSize as string) || "16px"
  const fontFamily = (props.fontFamily as string) || "Arial, Helvetica, sans-serif"

  // Convert newlines to <br> tags
  const formattedText = text.replace(/\n/g, "<br>")

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;text-align:${alignment};font-family:${fontFamily};font-size:${fontSize};line-height:1.6;color:${color};">
      ${formattedText}
    </td>
  </tr>
</table>`
}

function renderEmailButton(props: Record<string, unknown>): string {
  const text = (props.text as string) || "Click Here"
  const url = (props.url as string) || "#"
  const backgroundColor = (props.backgroundColor as string) || "#007bff"
  const textColor = (props.textColor as string) || "#ffffff"
  const alignment = (props.alignment as string) || "center"
  const borderRadius = (props.borderRadius as string) || "4px"
  const fullWidth = props.fullWidth as boolean

  const width = fullWidth ? "100%" : "auto"
  const buttonStyle = `display:inline-block;background-color:${backgroundColor};color:${textColor};text-decoration:none;padding:12px 24px;border-radius:${borderRadius};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;text-align:center;`

  // Bulletproof button for Outlook
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;text-align:${alignment};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:${fullWidth ? "100%" : "200px"};" arcsize="10%" strokecolor="${backgroundColor}" fillcolor="${backgroundColor}">
        <w:anchorlock/>
        <center style="color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">${text}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" style="${buttonStyle}${fullWidth ? `width:${width};box-sizing:border-box;` : ""}" target="_blank">${text}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}

function renderEmailImage(props: Record<string, unknown>): string {
  const src = (props.src as string) || ""
  const alt = (props.alt as string) || ""
  const width = (props.width as string) || "100%"
  const alignment = (props.alignment as string) || "center"
  const linkUrl = props.linkUrl as string

  if (!src) return ""

  const imgStyle = `max-width:${width};width:100%;height:auto;display:block;margin:0 ${alignment === "center" ? "auto" : alignment === "right" ? "0 0 auto" : "0"};`
  const imgTag = `<img src="${src}" alt="${alt}" style="${imgStyle}" />`

  const imageContent = linkUrl ? `<a href="${linkUrl}" target="_blank">${imgTag}</a>` : imgTag

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;text-align:${alignment};">
      ${imageContent}
    </td>
  </tr>
</table>`
}

function renderEmailDivider(props: Record<string, unknown>): string {
  const color = (props.color as string) || "#e0e0e0"
  const thickness = (props.thickness as string) || "1px"
  const style = (props.style as string) || "solid"
  const width = (props.width as string) || "100%"

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;">
      <table width="${width}" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="border-top:${thickness} ${style} ${color};font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

function renderEmailSpacer(props: Record<string, unknown>): string {
  const height = (props.height as string) || "20px"

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="height:${height};font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
}

function renderEmailColumns(props: Record<string, unknown>): string {
  const columns = (props.columns as Array<{ content: string }>) || []
  const gap = (props.gap as string) || "20px"
  const backgroundColor = (props.backgroundColor as string) || "transparent"

  const columnCount = columns.length || 2
  const columnWidth = Math.floor(600 / columnCount)

  const columnsHtml = columns
    .map(
      (col, index) => `
    <td style="width:${columnWidth}px;padding:${index > 0 ? `0 0 0 ${gap}` : "0"};vertical-align:top;">
      ${col.content || ""}
    </td>
  `,
    )
    .join("")

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${backgroundColor};">
  <tr>
    <td style="padding:10px 20px;">
      <!--[if mso]>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${columnsHtml}
        </tr>
      </table>
      <![endif]-->
      <!--[if !mso]><!-->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
        <tr>
          ${columnsHtml}
        </tr>
      </table>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}

function renderEmailCard(props: Record<string, unknown>): string {
  const backgroundColor = (props.backgroundColor as string) || "#ffffff"
  const borderColor = (props.borderColor as string) || "#e0e0e0"
  const borderRadius = (props.borderRadius as string) || "8px"
  const padding = (props.padding as string) || "20px"
  const content = (props.content as string) || ""

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${backgroundColor};border:1px solid ${borderColor};border-radius:${borderRadius};">
        <tr>
          <td style="padding:${padding};">
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

function renderEmailSocialIcons(props: Record<string, unknown>): string {
  const alignment = (props.alignment as string) || "center"
  const iconSize = (props.iconSize as string) || "32px"
  const iconColor = (props.iconColor as string) || "#333333"
  const facebook = props.facebook as string
  const twitter = props.twitter as string
  const instagram = props.instagram as string
  const linkedin = props.linkedin as string
  const youtube = props.youtube as string

  const socialLinks: { name: string; url: string; icon: string }[] = []

  if (facebook) socialLinks.push({ name: "Facebook", url: facebook, icon: "f" })
  if (twitter) socialLinks.push({ name: "Twitter", url: twitter, icon: "t" })
  if (instagram) socialLinks.push({ name: "Instagram", url: instagram, icon: "i" })
  if (linkedin) socialLinks.push({ name: "LinkedIn", url: linkedin, icon: "in" })
  if (youtube) socialLinks.push({ name: "YouTube", url: youtube, icon: "y" })

  const iconsHtml = socialLinks
    .map(
      (social) => `
    <td style="padding:0 8px;">
      <a href="${social.url}" target="_blank" style="display:inline-block;width:${iconSize};height:${iconSize};background-color:${iconColor};color:#ffffff;text-decoration:none;text-align:center;line-height:${iconSize};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;border-radius:50%;">${social.icon}</a>
    </td>
  `,
    )
    .join("")

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:10px 20px;text-align:${alignment};">
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 ${alignment === "center" ? "auto" : alignment === "right" ? "0 0 auto" : "0"};">
        <tr>
          ${iconsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

function renderEmailFooter(props: Record<string, unknown>): string {
  const organizationName = (props.organizationName as string) || ""
  const address = (props.address as string) || ""
  const unsubscribeUrl = (props.unsubscribeUrl as string) || "{{unsubscribe_url}}"
  const unsubscribeText = (props.unsubscribeText as string) || "Unsubscribe"
  const showSocialLinks = props.showSocialLinks as boolean
  const backgroundColor = (props.backgroundColor as string) || "#f5f5f5"
  const textColor = (props.textColor as string) || "#666666"

  const socialIcons = showSocialLinks
    ? renderEmailSocialIcons({
        alignment: "center",
        iconSize: "24px",
        iconColor: textColor,
        ...props,
      })
    : ""

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${backgroundColor};">
  <tr>
    <td style="padding:30px 20px;text-align:center;">
      ${socialIcons}
      ${organizationName ? `<p style="margin:10px 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textColor};">${organizationName}</p>` : ""}
      ${address ? `<p style="margin:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${textColor};">${address}</p>` : ""}
      <p style="margin:15px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${textColor};">
        <a href="${unsubscribeUrl}" style="color:${textColor};text-decoration:underline;">${unsubscribeText}</a>
      </p>
    </td>
  </tr>
</table>`
}

// Main function to render Puck data to email HTML
export function renderPuckToEmailHtml(data: Data, options?: { preheaderText?: string }): string {
  const content = data.content || []
  const rootProps = data.root?.props || {}

  const backgroundColor = (rootProps.backgroundColor as string) || "#f5f5f5"
  const contentBackgroundColor = (rootProps.contentBackgroundColor as string) || "#ffffff"

  // Render all blocks
  const blocksHtml = content
    .map((block) => renderBlock(block as { type: string; props: Record<string, unknown> }))
    .join("\n")

  // Preheader text (hidden preview text)
  const preheader = options?.preheaderText
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${options.preheaderText}</div>`
    : ""

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title></title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .stack-column-center { text-align: center !important; }
      .center-on-narrow { text-align: center !important; display: block !important; margin-left: auto !important; margin-right: auto !important; float: none !important; }
      table.center-on-narrow { display: inline-block !important; }
    }
    
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .email-content { background-color: #2d2d2d !important; }
      h1, h2, h3, h4, p { color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${backgroundColor};">
  ${preheader}
  <center style="width:100%;background-color:${backgroundColor};" class="email-bg">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${backgroundColor};">
      <tr>
        <td>
    <![endif]-->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;max-width:600px;background-color:${contentBackgroundColor};" class="email-container email-content">
      <tr>
        <td>
          ${blocksHtml}
        </td>
      </tr>
    </table>
    <!--[if mso | IE]>
        </td>
      </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`
}

// Render Puck data to plain text for email fallback
export function renderPuckToPlainText(data: Data): string {
  const content = data.content || []
  const lines: string[] = []

  for (const block of content) {
    const { type, props } = block as { type: string; props: Record<string, unknown> }

    switch (type) {
      case "EmailHeading":
      case "EmailText":
        if (props.text) lines.push(String(props.text))
        break
      case "EmailButton":
        if (props.text && props.url) lines.push(`${props.text}: ${props.url}`)
        break
      case "EmailImage":
        if (props.alt) lines.push(`[Image: ${props.alt}]`)
        break
      case "EmailFooter":
        if (props.organizationName) lines.push(String(props.organizationName))
        if (props.address) lines.push(String(props.address))
        if (props.unsubscribeText) lines.push(`${props.unsubscribeText}: {{unsubscribe_url}}`)
        break
      case "EmailDivider":
        lines.push("---")
        break
    }
  }

  return lines.join("\n\n")
}
