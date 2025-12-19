// Server-safe Puck configuration for API routes
// This uses only basic field types that don't require client-side React components

import type { Config, Data } from "@measured/puck"

// Default empty data structure
export const defaultServerData: Data = {
  content: [],
  root: { props: { title: "Page" } },
  zones: {},
}

// Server-safe config that mirrors the client config structure
// but uses only basic field types (no custom React field components)
export function createServerPuckConfig(): Config {
  return {
    root: {
      fields: {
        title: { type: "text", label: "Page Title" },
      },
      render: () => null,
    },
    components: {
      // Hero Section
      Hero: {
        fields: {
          title: { type: "text", label: "Title" },
          subtitle: { type: "textarea", label: "Subtitle" },
          backgroundType: {
            type: "select",
            label: "Background Type",
            options: [
              { label: "Solid Color", value: "solid" },
              { label: "Gradient", value: "gradient" },
              { label: "Image", value: "image" },
            ],
          },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          gradientFrom: { type: "text", label: "Gradient From (hex)" },
          gradientTo: { type: "text", label: "Gradient To (hex)" },
          backgroundImage: { type: "text", label: "Background Image URL" },
          textColor: { type: "text", label: "Text Color (hex)" },
          alignment: {
            type: "radio",
            label: "Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          showButton: {
            type: "radio",
            label: "Show Button",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
          buttonText: { type: "text", label: "Button Text" },
          buttonLink: { type: "text", label: "Button Link" },
          buttonStyle: {
            type: "select",
            label: "Button Style",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Outline", value: "outline" },
            ],
          },
          minHeight: { type: "text", label: "Min Height (e.g., 400px)" },
          paddingY: {
            type: "select",
            label: "Vertical Padding",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
        },
        defaultProps: {
          title: "Welcome to Our Site",
          subtitle: "Discover amazing content and services",
          backgroundType: "solid",
          backgroundColor: "#1a1a2e",
          gradientFrom: "#667eea",
          gradientTo: "#764ba2",
          backgroundImage: "",
          textColor: "#ffffff",
          alignment: "center",
          showButton: "yes",
          buttonText: "Get Started",
          buttonLink: "/",
          buttonStyle: "primary",
          minHeight: "400px",
          paddingY: "large",
        },
        render: () => null,
      },

      // Text Block
      TextBlock: {
        fields: {
          content: { type: "textarea", label: "Content" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          fontSize: {
            type: "select",
            label: "Font Size",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Extra Large", value: "xlarge" },
            ],
          },
          alignment: {
            type: "radio",
            label: "Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          paddingX: {
            type: "select",
            label: "Horizontal Padding",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
          paddingY: {
            type: "select",
            label: "Vertical Padding",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
        },
        defaultProps: {
          content: "Add your text content here...",
          backgroundColor: "transparent",
          textColor: "#333333",
          fontSize: "medium",
          alignment: "left",
          paddingX: "medium",
          paddingY: "medium",
        },
        render: () => null,
      },

      // Heading
      Heading: {
        fields: {
          text: { type: "text", label: "Heading Text" },
          level: {
            type: "select",
            label: "Heading Level",
            options: [
              { label: "H1", value: "h1" },
              { label: "H2", value: "h2" },
              { label: "H3", value: "h3" },
              { label: "H4", value: "h4" },
            ],
          },
          textColor: { type: "text", label: "Text Color (hex)" },
          alignment: {
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
          text: "Section Heading",
          level: "h2",
          textColor: "#1a1a1a",
          alignment: "left",
        },
        render: () => null,
      },

      // Image
      Image: {
        fields: {
          src: { type: "text", label: "Image URL" },
          alt: { type: "text", label: "Alt Text" },
          width: { type: "text", label: "Width (e.g., 100% or 500px)" },
          height: { type: "text", label: "Height (e.g., auto or 300px)" },
          objectFit: {
            type: "select",
            label: "Object Fit",
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
              { label: "None", value: "none" },
            ],
          },
          borderRadius: {
            type: "select",
            label: "Border Radius",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Full", value: "full" },
            ],
          },
        },
        defaultProps: {
          src: "/placeholder.svg?height=300&width=600",
          alt: "Image",
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "none",
        },
        render: () => null,
      },

      // Button
      Button: {
        fields: {
          text: { type: "text", label: "Button Text" },
          link: { type: "text", label: "Link URL" },
          style: {
            type: "select",
            label: "Style",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Outline", value: "outline" },
              { label: "Ghost", value: "ghost" },
            ],
          },
          size: {
            type: "select",
            label: "Size",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
          alignment: {
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
        },
        defaultProps: {
          text: "Click Me",
          link: "/",
          style: "primary",
          size: "medium",
          alignment: "left",
          backgroundColor: "#3b82f6",
          textColor: "#ffffff",
        },
        render: () => null,
      },

      // Columns
      Columns: {
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
            label: "Gap",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          paddingY: {
            type: "select",
            label: "Vertical Padding",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
        },
        defaultProps: {
          columns: "2",
          gap: "medium",
          backgroundColor: "transparent",
          paddingY: "medium",
        },
        render: () => null,
      },

      // Card
      Card: {
        fields: {
          title: { type: "text", label: "Title" },
          description: { type: "textarea", label: "Description" },
          image: { type: "text", label: "Image URL" },
          link: { type: "text", label: "Link URL" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          showButton: {
            type: "radio",
            label: "Show Button",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
          buttonText: { type: "text", label: "Button Text" },
        },
        defaultProps: {
          title: "Card Title",
          description: "Card description goes here...",
          image: "/placeholder.svg?height=200&width=400",
          link: "/",
          backgroundColor: "#ffffff",
          textColor: "#1a1a1a",
          showButton: "yes",
          buttonText: "Learn More",
        },
        render: () => null,
      },

      // Spacer
      Spacer: {
        fields: {
          height: {
            type: "select",
            label: "Height",
            options: [
              { label: "Extra Small (8px)", value: "xs" },
              { label: "Small (16px)", value: "sm" },
              { label: "Medium (32px)", value: "md" },
              { label: "Large (64px)", value: "lg" },
              { label: "Extra Large (96px)", value: "xl" },
            ],
          },
        },
        defaultProps: {
          height: "md",
        },
        render: () => null,
      },

      // Divider
      Divider: {
        fields: {
          color: { type: "text", label: "Color (hex)" },
          thickness: {
            type: "select",
            label: "Thickness",
            options: [
              { label: "Thin (1px)", value: "thin" },
              { label: "Medium (2px)", value: "medium" },
              { label: "Thick (4px)", value: "thick" },
            ],
          },
          style: {
            type: "select",
            label: "Style",
            options: [
              { label: "Solid", value: "solid" },
              { label: "Dashed", value: "dashed" },
              { label: "Dotted", value: "dotted" },
            ],
          },
          marginY: {
            type: "select",
            label: "Vertical Margin",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
        },
        defaultProps: {
          color: "#e5e7eb",
          thickness: "thin",
          style: "solid",
          marginY: "medium",
        },
        render: () => null,
      },

      // Features Grid
      FeaturesGrid: {
        fields: {
          title: { type: "text", label: "Section Title" },
          subtitle: { type: "textarea", label: "Section Subtitle" },
          columns: {
            type: "select",
            label: "Columns",
            options: [
              { label: "2 Columns", value: "2" },
              { label: "3 Columns", value: "3" },
              { label: "4 Columns", value: "4" },
            ],
          },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          features: {
            type: "array",
            label: "Features",
            arrayFields: {
              icon: { type: "text", label: "Icon Name" },
              title: { type: "text", label: "Feature Title" },
              description: { type: "textarea", label: "Feature Description" },
            },
          },
        },
        defaultProps: {
          title: "Our Features",
          subtitle: "Discover what makes us different",
          columns: "3",
          backgroundColor: "#f9fafb",
          textColor: "#1a1a1a",
          features: [
            { icon: "Zap", title: "Fast", description: "Lightning fast performance" },
            { icon: "Shield", title: "Secure", description: "Enterprise-grade security" },
            { icon: "Heart", title: "Reliable", description: "99.9% uptime guaranteed" },
          ],
        },
        render: () => null,
      },

      // Testimonial
      Testimonial: {
        fields: {
          quote: { type: "textarea", label: "Quote" },
          author: { type: "text", label: "Author Name" },
          role: { type: "text", label: "Author Role" },
          avatar: { type: "text", label: "Avatar URL" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
        },
        defaultProps: {
          quote: "This product has transformed our workflow completely.",
          author: "John Doe",
          role: "CEO, Company Inc",
          avatar: "/placeholder.svg?height=80&width=80",
          backgroundColor: "#ffffff",
          textColor: "#1a1a1a",
        },
        render: () => null,
      },

      // CTA Section
      CTASection: {
        fields: {
          title: { type: "text", label: "Title" },
          subtitle: { type: "textarea", label: "Subtitle" },
          buttonText: { type: "text", label: "Button Text" },
          buttonLink: { type: "text", label: "Button Link" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          buttonStyle: {
            type: "select",
            label: "Button Style",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Outline", value: "outline" },
            ],
          },
        },
        defaultProps: {
          title: "Ready to get started?",
          subtitle: "Join thousands of satisfied customers today.",
          buttonText: "Get Started Now",
          buttonLink: "/register",
          backgroundColor: "#3b82f6",
          textColor: "#ffffff",
          buttonStyle: "secondary",
        },
        render: () => null,
      },

      // FAQ Section
      FAQSection: {
        fields: {
          title: { type: "text", label: "Section Title" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          items: {
            type: "array",
            label: "FAQ Items",
            arrayFields: {
              question: { type: "text", label: "Question" },
              answer: { type: "textarea", label: "Answer" },
            },
          },
        },
        defaultProps: {
          title: "Frequently Asked Questions",
          backgroundColor: "#ffffff",
          textColor: "#1a1a1a",
          items: [
            { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee." },
            { question: "How do I contact support?", answer: "Email us at support@example.com" },
          ],
        },
        render: () => null,
      },

      // Contact Form
      ContactForm: {
        fields: {
          title: { type: "text", label: "Form Title" },
          subtitle: { type: "textarea", label: "Form Subtitle" },
          submitButtonText: { type: "text", label: "Submit Button Text" },
          backgroundColor: { type: "text", label: "Background Color (hex)" },
          textColor: { type: "text", label: "Text Color (hex)" },
          showPhone: {
            type: "radio",
            label: "Show Phone Field",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
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
          subtitle: "We'd love to hear from you",
          submitButtonText: "Send Message",
          backgroundColor: "#f9fafb",
          textColor: "#1a1a1a",
          showPhone: "yes",
          showSubject: "yes",
        },
        render: () => null,
      },

      // Video Embed
      VideoEmbed: {
        fields: {
          url: { type: "text", label: "Video URL (YouTube/Vimeo)" },
          aspectRatio: {
            type: "select",
            label: "Aspect Ratio",
            options: [
              { label: "16:9", value: "16:9" },
              { label: "4:3", value: "4:3" },
              { label: "1:1", value: "1:1" },
            ],
          },
          borderRadius: {
            type: "select",
            label: "Border Radius",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
        },
        defaultProps: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          aspectRatio: "16:9",
          borderRadius: "medium",
        },
        render: () => null,
      },

      // Social Links
      SocialLinks: {
        fields: {
          alignment: {
            type: "radio",
            label: "Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          size: {
            type: "select",
            label: "Icon Size",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
          color: { type: "text", label: "Icon Color (hex)" },
          facebook: { type: "text", label: "Facebook URL" },
          twitter: { type: "text", label: "Twitter URL" },
          instagram: { type: "text", label: "Instagram URL" },
          linkedin: { type: "text", label: "LinkedIn URL" },
          youtube: { type: "text", label: "YouTube URL" },
        },
        defaultProps: {
          alignment: "center",
          size: "medium",
          color: "#1a1a1a",
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
          youtube: "",
        },
        render: () => null,
      },
    },
  }
}
