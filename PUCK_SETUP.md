# Puck Page Builder Setup

Puck is now the default page builder for all tenant sites. It's a free, open-source visual editor that runs entirely within your application.

## Features

- **Free & Open Source**: No licensing costs or per-tenant complexity
- **Fully Embeddable**: Runs directly in your application, not on external platform
- **Component-Based**: Uses your existing React components (shadcn/ui)
- **Multi-Tenant Ready**: No per-tenant configuration needed
- **Modern & Fast**: Built for Next.js and React 19
- **AI-Powered**: Optional AI features for intelligent page generation

## How It Works

1. **Tenants go to Custom Pages** → Create New Page
2. **Puck editor loads** with drag-and-drop interface
3. **Drag components** from the sidebar (Headings, Text, Buttons, Cards, etc.)
4. **Configure props** for each component in the right panel
5. **Publish** to save the page

## Available Components

Out of the box, Puck includes:

- **HeadingBlock**: H1, H2, H3, H4 headings
- **TextBlock**: Paragraph text with alignment
- **ButtonBlock**: Call-to-action buttons with variants
- **CardBlock**: Content cards with title/description
- **SpacerBlock**: Vertical spacing

## Adding Custom Components

To add more components, edit `lib/puck-config.tsx`:

```tsx
export const puckConfig: Config = {
  components: {
    YourComponent: {
      fields: {
        // Define editable fields
      },
      render: ({ }) => {
        // Return your React component
      },
    },
  },
}
```

## Data Storage

- Page content is stored as JSON in the `tenant_pages` table
- The `content` column contains the Puck data structure
- Pages are rendered using the `PuckPageRender` component

## No Configuration Needed

Unlike Plasmic, Puck requires:
- ❌ No external accounts
- ❌ No API keys
- ❌ No per-tenant setup
- ❌ No hosting fees

Just deploy and it works for all tenants!

## AI Features (Optional)

Puck supports AI-powered page generation to help tenants create pages faster.

### Setup AI

1. Get a Puck AI API key from [puckeditor.com](https://puckeditor.com)
2. Add the environment variable:
   - **Name**: `PUCK_API_KEY`
   - **Value**: Your Puck AI API key
3. Add it in:
   - **v0**: Vars section in the in-chat sidebar
   - **Vercel**: Settings → Environment Variables
4. Redeploy your application

### Without AI

Puck works perfectly fine without AI as a manual drag-and-drop builder. If no API key is provided, AI features are simply disabled.
