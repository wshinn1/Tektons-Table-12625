export const ctaSectionConfig = {
  id: "cta-section",
  name: "CTA Section",
  category: "cta",
  thumbnail: "/call-to-action.png",
  fields: [
    { name: "headline", label: "Headline", type: "text", required: true, defaultValue: "Ready to get started?" },
    { name: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "" },
    { name: "ctaText", label: "Button Text", type: "text", defaultValue: "Get Started" },
    { name: "ctaLink", label: "Button Link", type: "url", defaultValue: "/auth/signup" },
    { name: "disclaimer", label: "Disclaimer Text", type: "text", defaultValue: "" },
    {
      name: "backgroundColor",
      label: "Background Color",
      type: "select",
      options: ["bg-background", "bg-accent/5", "bg-muted/30"],
      defaultValue: "bg-background",
    },
  ],
}
