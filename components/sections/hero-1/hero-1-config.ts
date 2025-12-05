export const hero1Config = {
  id: "hero-1",
  name: "Hero 1",
  category: "hero",
  thumbnail: "/hero-section-with-overlay.jpg",
  description: "Full-width hero with background image/gradient/CDN, overlay, left-aligned content, and social icons",
  fields: [
    // Content Section
    { name: "subtitle", label: "Subtitle", type: "text", defaultValue: "WELCOME" },
    {
      name: "headline",
      label: "Headline",
      type: "text",
      required: true,
      defaultValue: "Discover New Places",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      defaultValue:
        "These cases are perfectly simple and easy to distinguish. In a free hour when our power of choice is untrammelled and when nothing prevents our being able to do what we like best every pleasure.",
    },
    { name: "buttonText", label: "Button Text", type: "text", defaultValue: "Learn More" },
    { name: "buttonLink", label: "Button Link", type: "url", defaultValue: "/about" },
    { name: "buttonColor", label: "Button Color", type: "color", defaultValue: "#2563eb" },

    // Background Options
    {
      name: "backgroundType",
      label: "Background Type",
      type: "select",
      options: ["image", "cdn", "gradient"],
      defaultValue: "image",
    },
    { name: "backgroundImage", label: "Background Image URL", type: "url", defaultValue: "" },
    { name: "cdnLink", label: "CDN Image Link", type: "url", defaultValue: "" },
    { name: "gradientStart", label: "Gradient Start Color", type: "color", defaultValue: "#1a1a2e" },
    { name: "gradientEnd", label: "Gradient End Color", type: "color", defaultValue: "#16213e" },
    {
      name: "gradientDirection",
      label: "Gradient Direction",
      type: "select",
      options: ["to-r", "to-l", "to-t", "to-b", "to-br", "to-bl", "to-tr", "to-tl"],
      defaultValue: "to-br",
    },

    // Overlay Options
    { name: "overlayColor", label: "Overlay Color", type: "color", defaultValue: "#000000" },
    {
      name: "overlayOpacity",
      label: "Overlay Opacity (%)",
      type: "number",
      defaultValue: 40,
      min: 0,
      max: 100,
    },

    // Text Color
    { name: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },

    // Social Icons
    { name: "showSocialIcons", label: "Show Social Icons", type: "checkbox", defaultValue: true },
    { name: "facebookUrl", label: "Facebook URL", type: "url", defaultValue: "#" },
    { name: "instagramUrl", label: "Instagram URL", type: "url", defaultValue: "#" },
    { name: "youtubeUrl", label: "YouTube URL", type: "url", defaultValue: "#" },

    // Pagination Dots
    { name: "showPaginationDots", label: "Show Pagination Dots", type: "checkbox", defaultValue: true },
  ],
}
