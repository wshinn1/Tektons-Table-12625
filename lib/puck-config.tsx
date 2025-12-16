import type { Config } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react" // Import JSX to declare the variable

// Define the Puck configuration with reusable components
export const puckConfig: Config = {
  components: {
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
      },
      defaultProps: {
        title: "Heading",
        level: "h2",
      },
      render: ({ title, level }) => {
        const Tag = level as keyof JSX.IntrinsicElements
        const classes = {
          h1: "text-4xl font-bold",
          h2: "text-3xl font-bold",
          h3: "text-2xl font-semibold",
          h4: "text-xl font-semibold",
        }
        return <Tag className={classes[level as keyof typeof classes]}>{title}</Tag>
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
        return (
          <p className={`text-${align}`} style={{ textAlign: align }}>
            {content}
          </p>
        )
      },
    },
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
      },
      defaultProps: {
        label: "Click me",
        href: "#",
        variant: "default",
      },
      render: ({ label, href, variant }) => {
        return (
          <Button variant={variant as any} asChild>
            <a href={href}>{label}</a>
          </Button>
        )
      },
    },
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
    SpacerBlock: {
      fields: {
        height: {
          type: "number",
          min: 8,
          max: 128,
        },
      },
      defaultProps: {
        height: 24,
      },
      render: ({ height }) => {
        return <div style={{ height: `${height}px` }} />
      },
    },
  },
  categories: {
    typography: {
      components: ["HeadingBlock", "TextBlock"],
      title: "Typography",
    },
    interactive: {
      components: ["ButtonBlock"],
      title: "Interactive",
    },
    layout: {
      components: ["CardBlock", "SpacerBlock"],
      title: "Layout",
    },
  },
}
