import type { Config } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react"

export const puckConfig: Config = {
  components: {
    // Typography
    HeadingBlock: {
      fields: {
        title: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Heading",
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
      fields: {
        content: { type: "textarea" },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        content: "Enter your text here...",
        align: "left",
      },
      render: ({ content, align }) => {
        return <p style={{ textAlign: align }}>{content}</p>
      },
    },
    RichTextBlock: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: {
        content: "<p>Enter rich content here...</p>",
      },
      render: ({ content }) => {
        return <div dangerouslySetInnerHTML={{ __html: content }} />
      },
    },

    // Interactive
    ButtonBlock: {
      fields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
          ],
        },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "sm" },
            { label: "Default", value: "default" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      defaultProps: {
        label: "Click me",
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
      fields: {
        text: { type: "text" },
        href: { type: "text" },
        openInNewTab: {
          type: "radio",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      },
      defaultProps: {
        text: "Link text",
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

    // Media
    ImageBlock: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        width: { type: "number" },
        height: { type: "number" },
        rounded: {
          type: "select",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Full", value: "full" },
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
        const roundedClasses = {
          none: "",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          full: "rounded-full",
        }
        return (
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className={`max-w-full h-auto ${roundedClasses[rounded as keyof typeof roundedClasses]}`}
          />
        )
      },
    },
    VideoBlock: {
      fields: {
        src: { type: "text" },
        autoplay: {
          type: "radio",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        controls: {
          type: "radio",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        loop: {
          type: "radio",
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
      fields: {
        embedCode: { type: "textarea" },
      },
      defaultProps: {
        embedCode: "",
      },
      render: ({ embedCode }) => {
        return <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      },
    },

    // Layout
    CardBlock: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        content: { type: "textarea" },
      },
      defaultProps: {
        title: "Card Title",
        description: "Card description",
        content: "Card content goes here...",
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
      fields: {
        maxWidth: {
          type: "select",
          options: [
            { label: "Small (640px)", value: "sm" },
            { label: "Medium (768px)", value: "md" },
            { label: "Large (1024px)", value: "lg" },
            { label: "XL (1280px)", value: "xl" },
            { label: "Full", value: "full" },
          ],
        },
        padding: {
          type: "select",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "12" },
          ],
        },
        background: { type: "text" },
      },
      defaultProps: {
        maxWidth: "lg",
        padding: "4",
        background: "",
      },
      render: ({ maxWidth, padding, background, puck }) => {
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
            {(puck as any)?.renderDropZone?.({ zone: "content" })}
          </div>
        )
      },
    },
    ColumnsBlock: {
      fields: {
        columns: {
          type: "select",
          options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" },
          ],
        },
        gap: {
          type: "select",
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
      render: ({ columns, gap, puck }) => {
        const cols = Number.parseInt(columns)
        return (
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap}`}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i}>{(puck as any)?.renderDropZone?.({ zone: `column-${i}` })}</div>
            ))}
          </div>
        )
      },
    },
    SpacerBlock: {
      fields: {
        height: {
          type: "select",
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
      fields: {
        color: { type: "text" },
        thickness: {
          type: "select",
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

    // Sections
    HeroBlock: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        buttonText: { type: "text" },
        buttonHref: { type: "text" },
        backgroundImage: { type: "text" },
        backgroundColor: { type: "text" },
        textColor: { type: "text" },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Welcome to Our Site",
        subtitle: "Discover amazing content and features",
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
    FeatureGridBlock: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        features: { type: "textarea" },
      },
      defaultProps: {
        title: "Our Features",
        subtitle: "Everything you need to succeed",
        features: JSON.stringify([
          { title: "Feature 1", description: "Description of feature 1", icon: "⚡" },
          { title: "Feature 2", description: "Description of feature 2", icon: "🎯" },
          { title: "Feature 3", description: "Description of feature 3", icon: "💡" },
        ]),
      },
      render: ({ title, subtitle, features }) => {
        let featureList = []
        try {
          featureList = JSON.parse(features)
        } catch {
          featureList = []
        }
        return (
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
              <p className="text-muted-foreground mb-12">{subtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featureList.map((feature: any, i: number) => (
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
      fields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        image: { type: "text" },
      },
      defaultProps: {
        quote: "This is an amazing product that changed my life!",
        author: "John Doe",
        role: "CEO, Company",
        image: "/placeholder.svg?height=80&width=80",
      },
      render: ({ quote, author, role, image }) => {
        return (
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <p className="text-lg italic mb-6">"{quote}"</p>
            <div className="flex items-center justify-center gap-4">
              <img src={image || "/placeholder.svg"} alt={author} className="w-12 h-12 rounded-full" />
              <div className="text-left">
                <p className="font-semibold">{author}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
            </div>
          </Card>
        )
      },
    },
    CTABlock: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        buttonText: { type: "text" },
        buttonHref: { type: "text" },
        backgroundColor: { type: "text" },
        textColor: { type: "text" },
      },
      defaultProps: {
        title: "Ready to get started?",
        subtitle: "Join thousands of satisfied customers today.",
        buttonText: "Sign Up Now",
        buttonHref: "/signup",
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
      },
      render: ({ title, subtitle, buttonText, buttonHref, backgroundColor, textColor }) => {
        return (
          <section className="py-16 px-6" style={{ backgroundColor, color: textColor }}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              <p className="text-lg mb-8 opacity-90">{subtitle}</p>
              <Button size="lg" variant="secondary" asChild>
                <a href={buttonHref}>{buttonText}</a>
              </Button>
            </div>
          </section>
        )
      },
    },

    // Forms
    ContactFormBlock: {
      fields: {
        title: { type: "text" },
        submitText: { type: "text" },
        successMessage: { type: "text" },
      },
      defaultProps: {
        title: "Contact Us",
        submitText: "Send Message",
        successMessage: "Thank you for your message!",
      },
      render: ({ title, submitText }) => {
        return (
          <Card className="p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-md" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea className="w-full px-3 py-2 border rounded-md" rows={4} placeholder="Your message" />
              </div>
              <Button type="submit" className="w-full">
                {submitText}
              </Button>
            </form>
          </Card>
        )
      },
    },
    DonationBlock: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        amounts: { type: "text" },
        buttonText: { type: "text" },
      },
      defaultProps: {
        title: "Support Our Mission",
        description: "Your donation helps us continue our work.",
        amounts: "25,50,100,250",
        buttonText: "Donate Now",
      },
      render: ({ title, description, amounts, buttonText }) => {
        const amountList = amounts.split(",").map((a: string) => Number.parseInt(a.trim()))
        return (
          <Card className="p-8 max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6">{description}</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {amountList.map((amount: number) => (
                <Button key={amount} variant="outline">
                  ${amount}
                </Button>
              ))}
            </div>
            <Button size="lg" className="w-full">
              {buttonText}
            </Button>
          </Card>
        )
      },
    },
  },
  categories: {
    typography: {
      components: ["HeadingBlock", "TextBlock", "RichTextBlock"],
      title: "Typography",
    },
    interactive: {
      components: ["ButtonBlock", "LinkBlock"],
      title: "Interactive",
    },
    media: {
      components: ["ImageBlock", "VideoBlock", "EmbedBlock"],
      title: "Media",
    },
    layout: {
      components: ["CardBlock", "ContainerBlock", "ColumnsBlock", "SpacerBlock", "DividerBlock"],
      title: "Layout",
    },
    sections: {
      components: ["HeroBlock", "FeatureGridBlock", "TestimonialBlock", "CTABlock"],
      title: "Sections",
    },
    forms: {
      components: ["ContactFormBlock", "DonationBlock"],
      title: "Forms",
    },
  },
}
