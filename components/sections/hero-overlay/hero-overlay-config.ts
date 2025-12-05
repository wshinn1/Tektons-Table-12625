export const heroOverlayConfig = {
  id: "hero-overlay",
  name: "Hero Overlay",
  category: "hero",
  thumbnail: "/hero-overlay.jpg",
  fields: [
    { name: "badge", label: "Badge Text", type: "text", defaultValue: "" },
    { name: "headline", label: "Headline", type: "text", required: true, defaultValue: "Your Headline Here" },
    { name: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "" },
    { name: "primaryCTA", label: "Primary Button Text", type: "text", defaultValue: "Get Started" },
    { name: "primaryCTALink", label: "Primary Button Link", type: "url", defaultValue: "/auth/signup" },
    { name: "secondaryCTA", label: "Secondary Button Text", type: "text", defaultValue: "Learn More" },
    { name: "secondaryCTALink", label: "Secondary Button Link", type: "url", defaultValue: "#features" },
    { name: "disclaimer", label: "Disclaimer Text", type: "text", defaultValue: "" },
    { name: "backgroundImage", label: "Background Image URL", type: "url", defaultValue: "" },
  ],
}
