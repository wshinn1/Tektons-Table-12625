import type { SectionTypeDefinition } from "./types"

// Central registry of all section types
export const sectionRegistry: Record<string, SectionTypeDefinition> = {
  "hero-centered": {
    type: "hero-centered",
    name: "Hero - Centered",
    description: "A centered hero section with headline, subheadline, and CTA buttons",
    category: "hero",
    icon: "Layout",
    fields: [
      { key: "headline", label: "Headline", type: "text", required: true, defaultValue: "Welcome to Our Platform" },
      { key: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "The best solution for your needs" },
      { key: "primaryButtonText", label: "Primary Button Text", type: "text", defaultValue: "Get Started" },
      { key: "primaryButtonUrl", label: "Primary Button URL", type: "url", defaultValue: "/signup" },
      { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", defaultValue: "Learn More" },
      { key: "secondaryButtonUrl", label: "Secondary Button URL", type: "url", defaultValue: "/about" },
      { key: "backgroundImage", label: "Background Image", type: "image" },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "80px",
    },
  },
  "hero-split": {
    type: "hero-split",
    name: "Hero - Split",
    description: "A split hero with content on one side and image on the other",
    category: "hero",
    icon: "Columns",
    fields: [
      { key: "headline", label: "Headline", type: "text", required: true, defaultValue: "Transform Your Business" },
      {
        key: "subheadline",
        label: "Subheadline",
        type: "textarea",
        defaultValue: "Powerful tools to help you succeed",
      },
      { key: "buttonText", label: "Button Text", type: "text", defaultValue: "Start Free Trial" },
      { key: "buttonUrl", label: "Button URL", type: "url", defaultValue: "/signup" },
      { key: "image", label: "Hero Image", type: "image", required: true },
      {
        key: "imagePosition",
        label: "Image Position",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
        defaultValue: "right",
      },
    ],
    defaultStyles: {
      backgroundColor: "#f8f9fa",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "features-grid": {
    type: "features-grid",
    name: "Features Grid",
    description: "A grid of feature cards with icons and descriptions",
    category: "features",
    icon: "Grid",
    fields: [
      { key: "headline", label: "Section Headline", type: "text", defaultValue: "Our Features" },
      { key: "subheadline", label: "Section Subheadline", type: "textarea" },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
        defaultValue: "3",
      },
      {
        key: "features",
        label: "Features",
        type: "array",
        arrayItemSchema: {
          icon: { key: "icon", label: "Icon", type: "icon", defaultValue: "Star" },
          title: { key: "title", label: "Title", type: "text", required: true },
          description: { key: "description", label: "Description", type: "textarea" },
        },
      },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "testimonials-carousel": {
    type: "testimonials-carousel",
    name: "Testimonials Carousel",
    description: "A carousel of customer testimonials",
    category: "testimonials",
    icon: "Quote",
    fields: [
      { key: "headline", label: "Section Headline", type: "text", defaultValue: "What Our Customers Say" },
      {
        key: "testimonials",
        label: "Testimonials",
        type: "array",
        arrayItemSchema: {
          quote: { key: "quote", label: "Quote", type: "textarea", required: true },
          author: { key: "author", label: "Author Name", type: "text", required: true },
          role: { key: "role", label: "Author Role", type: "text" },
          avatar: { key: "avatar", label: "Author Avatar", type: "image" },
        },
      },
    ],
    defaultStyles: {
      backgroundColor: "#f8f9fa",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "cta-banner": {
    type: "cta-banner",
    name: "CTA Banner",
    description: "A call-to-action banner with headline and button",
    category: "cta",
    icon: "Megaphone",
    fields: [
      { key: "headline", label: "Headline", type: "text", required: true, defaultValue: "Ready to Get Started?" },
      {
        key: "subheadline",
        label: "Subheadline",
        type: "textarea",
        defaultValue: "Join thousands of satisfied customers today.",
      },
      { key: "buttonText", label: "Button Text", type: "text", defaultValue: "Sign Up Now" },
      { key: "buttonUrl", label: "Button URL", type: "url", defaultValue: "/signup" },
    ],
    defaultStyles: {
      backgroundColor: "#0070f3",
      textColor: "#ffffff",
      padding: "60px",
    },
  },
  "stats-section": {
    type: "stats-section",
    name: "Stats Section",
    description: "Display key statistics and metrics",
    category: "stats",
    icon: "BarChart",
    fields: [
      { key: "headline", label: "Section Headline", type: "text", defaultValue: "Our Impact" },
      {
        key: "stats",
        label: "Statistics",
        type: "array",
        arrayItemSchema: {
          value: { key: "value", label: "Value", type: "text", required: true },
          label: { key: "label", label: "Label", type: "text", required: true },
          prefix: { key: "prefix", label: "Prefix (e.g., $)", type: "text" },
          suffix: { key: "suffix", label: "Suffix (e.g., +)", type: "text" },
        },
      },
    ],
    defaultStyles: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      padding: "60px",
    },
  },
  "pricing-table": {
    type: "pricing-table",
    name: "Pricing Table",
    description: "Display pricing plans in a table format",
    category: "pricing",
    icon: "DollarSign",
    fields: [
      { key: "headline", label: "Section Headline", type: "text", defaultValue: "Choose Your Plan" },
      { key: "subheadline", label: "Section Subheadline", type: "textarea" },
      {
        key: "plans",
        label: "Pricing Plans",
        type: "array",
        arrayItemSchema: {
          name: { key: "name", label: "Plan Name", type: "text", required: true },
          price: { key: "price", label: "Price", type: "text", required: true },
          period: { key: "period", label: "Period", type: "text", defaultValue: "/month" },
          description: { key: "description", label: "Description", type: "textarea" },
          features: { key: "features", label: "Features (one per line)", type: "textarea" },
          buttonText: { key: "buttonText", label: "Button Text", type: "text", defaultValue: "Get Started" },
          buttonUrl: { key: "buttonUrl", label: "Button URL", type: "url" },
          highlighted: { key: "highlighted", label: "Highlighted", type: "boolean", defaultValue: false },
        },
      },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "content-image": {
    type: "content-image",
    name: "Content with Image",
    description: "Text content alongside an image",
    category: "content",
    icon: "FileText",
    fields: [
      { key: "headline", label: "Headline", type: "text", required: true },
      { key: "content", label: "Content", type: "richtext" },
      { key: "image", label: "Image", type: "image", required: true },
      {
        key: "imagePosition",
        label: "Image Position",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
        defaultValue: "right",
      },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "url" },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "image-gallery": {
    type: "image-gallery",
    name: "Image Gallery",
    description: "A gallery of images in a grid layout",
    category: "gallery",
    icon: "Image",
    fields: [
      { key: "headline", label: "Section Headline", type: "text" },
      {
        key: "columns",
        label: "Columns",
        type: "select",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
        defaultValue: "3",
      },
      {
        key: "images",
        label: "Images",
        type: "array",
        arrayItemSchema: {
          src: { key: "src", label: "Image", type: "image", required: true },
          alt: { key: "alt", label: "Alt Text", type: "text" },
          caption: { key: "caption", label: "Caption", type: "text" },
        },
      },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "60px",
    },
  },
  custom: {
    type: "custom",
    name: "Custom Section",
    description: "A fully custom section generated from a screenshot",
    category: "custom",
    icon: "Wand",
    fields: [],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "40px",
    },
  },
  "visual-tekton-about-1": {
    type: "visual-tekton-about-1",
    name: "Visual Tekton About 1",
    description:
      "A modern about section with asymmetric layout, two media slots (image/video), headline, and body text",
    category: "about",
    icon: "Users",
    fields: [
      { key: "label", label: "Label", type: "text", defaultValue: "EMPOWERING BRANDS WITH CREATIVITY" },
      {
        key: "headline",
        label: "Headline",
        type: "text",
        required: true,
        defaultValue: "We craft & elevate digital experiences",
      },
      {
        key: "bodyText1",
        label: "Body Text 1",
        type: "textarea",
        defaultValue:
          "Algenix is a forward-thinking IT and digital agency dedicated to transforming businesses through innovative technology solutions.",
      },
      {
        key: "bodyText2",
        label: "Body Text 2",
        type: "textarea",
        defaultValue:
          "Our brand strategy service helps businesses define their identity and position in the market. We conduct thorough research and analysis to create a unique brand narrative that resonates with target audiences, ensuring long-term success.",
      },
      {
        key: "bodyText3",
        label: "Body Text 3 (Bottom Right)",
        type: "textarea",
        defaultValue:
          "We value creativity, collaboration, and customer focus, ensuring that every project reflects our commitment to quality and client satisfaction. Founded in 2015, we have established ourselves as a trusted partner for businesses looking to enhance their digital footprint.",
      },
      {
        key: "media1Type",
        label: "Media 1 Type (Bottom Left)",
        type: "select",
        options: [
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
        ],
        defaultValue: "image",
      },
      { key: "media1Url", label: "Media 1 URL", type: "image", required: true },
      { key: "media1Alt", label: "Media 1 Alt Text", type: "text", defaultValue: "Team member" },
      {
        key: "media2Type",
        label: "Media 2 Type (Right Side)",
        type: "select",
        options: [
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
        ],
        defaultValue: "image",
      },
      { key: "media2Url", label: "Media 2 URL", type: "image", required: true },
      { key: "media2Alt", label: "Media 2 Alt Text", type: "text", defaultValue: "Office space" },
    ],
    defaultStyles: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      padding: "60px",
    },
  },
  "full-width-visual-hero-display-1": {
    type: "full-width-visual-hero-display-1",
    name: "Full Width Visual Hero Display 1",
    description:
      "A full-width hero with centered text overlay, decorative borders, and flexible background options (image/video/gradient) with parallax support",
    category: "hero",
    icon: "Layout",
    fields: [
      { key: "heading", label: "Main Heading", type: "text", defaultValue: "WHAT IF YOU FALL?" },
      { key: "subheadingItalic", label: "Subheading (Italic)", type: "text", defaultValue: "but oh my darling" },
      { key: "heading2", label: "Second Heading", type: "text", defaultValue: "WHAT IF YOU FLY?" },
      { key: "subheading", label: "Regular Subheading", type: "text", defaultValue: "" },

      // Background options
      {
        key: "backgroundType",
        label: "Background Type",
        type: "select",
        options: [
          { label: "Image", value: "image" },
          { label: "Video (CDN Link)", value: "video" },
          { label: "Gradient", value: "gradient" },
        ],
        defaultValue: "image",
      },
      { key: "backgroundImage", label: "Background Image URL", type: "image" },
      { key: "videoUrl", label: "Video CDN URL", type: "url" },
      { key: "gradientStart", label: "Gradient Start Color", type: "color", defaultValue: "#1e3a5f" },
      { key: "gradientEnd", label: "Gradient End Color", type: "color", defaultValue: "#0f172a" },
      {
        key: "gradientDirection",
        label: "Gradient Direction",
        type: "select",
        options: [
          { label: "To Bottom", value: "to bottom" },
          { label: "To Bottom Right", value: "to bottom right" },
          { label: "To Right", value: "to right" },
          { label: "To Top Right", value: "to top right" },
        ],
        defaultValue: "to bottom right",
      },

      // Parallax option
      { key: "enableParallax", label: "Enable Parallax (Image Only)", type: "boolean", defaultValue: false },

      // Border options
      { key: "showBorder", label: "Show Decorative Border", type: "boolean", defaultValue: true },
      { key: "borderWidth", label: "Border Width (px)", type: "number", defaultValue: 2 },
      { key: "borderColor", label: "Border Color", type: "color", defaultValue: "#ffffff" },
      { key: "borderOpacity", label: "Border Opacity (%)", type: "number", defaultValue: 80 },

      // Overlay
      { key: "overlayColor", label: "Overlay Color", type: "color", defaultValue: "#000000" },
      { key: "overlayOpacity", label: "Overlay Opacity (%)", type: "number", defaultValue: 40 },

      // Text styling
      { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
      {
        key: "headingFont",
        label: "Heading Font",
        type: "select",
        options: [
          { label: "Sans Serif", value: "sans-serif" },
          { label: "Serif", value: "serif" },
          { label: "Monospace", value: "mono" },
        ],
        defaultValue: "sans-serif",
      },
      {
        key: "subheadingFont",
        label: "Subheading Font",
        type: "select",
        options: [
          { label: "Sans Serif", value: "sans-serif" },
          { label: "Serif", value: "serif" },
          { label: "Monospace", value: "mono" },
        ],
        defaultValue: "serif",
      },

      // Decorative lines
      { key: "showDecorativeLines", label: "Show Decorative Lines", type: "boolean", defaultValue: true },
      { key: "decorativeLineColor", label: "Line Color", type: "color", defaultValue: "#ffffff" },
      { key: "decorativeLineWidth", label: "Line Width (px)", type: "number", defaultValue: 60 },
    ],
    defaultStyles: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      padding: "0px",
    },
  },
}

export function getSectionType(type: string): SectionTypeDefinition | undefined {
  return sectionRegistry[type]
}

export function getAllSectionTypes(): SectionTypeDefinition[] {
  return Object.values(sectionRegistry)
}

export function getSectionsByCategory(category: string): SectionTypeDefinition[] {
  return Object.values(sectionRegistry).filter((s) => s.category === category)
}

export const sectionCategories = [
  { id: "hero", name: "Hero Sections", icon: "Layout" },
  { id: "about", name: "About", icon: "Users" },
  { id: "features", name: "Features", icon: "Grid" },
  { id: "testimonials", name: "Testimonials", icon: "Quote" },
  { id: "cta", name: "Call to Action", icon: "Megaphone" },
  { id: "pricing", name: "Pricing", icon: "DollarSign" },
  { id: "stats", name: "Statistics", icon: "BarChart" },
  { id: "content", name: "Content", icon: "FileText" },
  { id: "gallery", name: "Gallery", icon: "Image" },
  { id: "custom", name: "Custom", icon: "Wand" },
]
