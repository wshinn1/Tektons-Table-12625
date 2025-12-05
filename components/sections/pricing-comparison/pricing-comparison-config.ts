export const pricingComparisonConfig = {
  id: "pricing-comparison",
  name: "Pricing Comparison",
  category: "pricing",
  thumbnail: "/pricing-comparison.jpg",
  fields: [
    { name: "headline", label: "Headline", type: "text", required: true, defaultValue: "Pricing" },
    { name: "subheadline", label: "Subheadline", type: "textarea", defaultValue: "" },
    { name: "currentStackTitle", label: "Current Stack Title", type: "text", defaultValue: "What You Pay Now" },
    {
      name: "currentStackItems",
      label: "Current Stack Items",
      type: "array",
      fields: [
        { name: "label", label: "Label", type: "text", required: true },
        { name: "value", label: "Value", type: "text", required: true },
      ],
      defaultValue: [],
    },
    { name: "platformTitle", label: "Platform Title", type: "text", defaultValue: "Tektons Table" },
    {
      name: "platformItems",
      label: "Platform Items",
      type: "array",
      fields: [
        { name: "label", label: "Label", type: "text", required: true },
        { name: "value", label: "Value", type: "text", defaultValue: "" },
        { name: "checkmark", label: "Show Checkmark", type: "boolean", defaultValue: false },
        { name: "strikethrough", label: "Strikethrough", type: "boolean", defaultValue: false },
      ],
      defaultValue: [],
    },
    { name: "savingsAmount", label: "Savings Amount", type: "text", defaultValue: "" },
    { name: "ctaText", label: "CTA Text", type: "text", defaultValue: "Start saving today" },
    { name: "ctaLink", label: "CTA Link", type: "url", defaultValue: "/auth/signup" },
  ],
}
