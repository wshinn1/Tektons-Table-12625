export const testimonialsConfig = {
  id: "testimonials",
  name: "Testimonials",
  category: "social-proof",
  thumbnail: "/testimonials-collage.png",
  fields: [
    { name: "headline", label: "Headline", type: "text", required: true, defaultValue: "What our users say" },
    { name: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "" },
    {
      name: "backgroundColor",
      label: "Background Color",
      type: "select",
      options: ["bg-background", "bg-accent/5", "bg-muted/30"],
      defaultValue: "bg-muted/30",
    },
    {
      name: "testimonials",
      label: "Testimonials",
      type: "array",
      fields: [
        { name: "content", label: "Testimonial Content", type: "textarea", required: true },
        { name: "name", label: "Name", type: "text", required: true },
        { name: "role", label: "Role", type: "text", required: true },
        { name: "avatar", label: "Avatar URL", type: "url", defaultValue: "" },
        { name: "rating", label: "Rating (1-5)", type: "number", defaultValue: 5 },
      ],
      defaultValue: [],
    },
  ],
}
