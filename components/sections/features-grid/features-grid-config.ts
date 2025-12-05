export const featuresGridConfig = {
  id: "features-grid",
  name: "Features Grid",
  category: "content",
  thumbnail: "/features-grid.png",
  fields: [
    { name: "headline", label: "Headline", type: "text", required: true, defaultValue: "Features" },
    { name: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "" },
    {
      name: "backgroundColor",
      label: "Background Color",
      type: "select",
      options: ["bg-background", "bg-accent/5", "bg-muted/30"],
      defaultValue: "bg-accent/5",
    },
    {
      name: "features",
      label: "Features",
      type: "array",
      fields: [
        { name: "icon", label: "Icon Name", type: "text", defaultValue: "Mail" },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "highlight", label: "Highlight Text", type: "text", defaultValue: "" },
      ],
      defaultValue: [],
    },
  ],
}
