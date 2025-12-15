# Plasmic Setup Guide

Plasmic is installed for the wesshinn.tektonstable.com tenant site to test the visual page builder.

## Setup Steps

### 1. Create a Plasmic Account

Go to [https://studio.plasmic.app](https://studio.plasmic.app) and sign up for a free account.

### 2. Create a New Project

1. Click "New Project" in Plasmic Studio
2. Choose "Blank Project" or use a starter template
3. Give it a name like "Tekton's Table - Wes Shinn"

### 3. Get Your Project Credentials

1. Go to your project settings in Plasmic Studio
2. Navigate to "API Tokens" or "Settings"
3. Copy the following:
   - **Project ID** (looks like: `abc123xyz456`)
   - **Public API Token** (long string starting with `plasmic_`)

### 4. Add Environment Variables

Add these to your Vercel project environment variables:

\`\`\`env
NEXT_PUBLIC_PLASMIC_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PLASMIC_PROJECT_TOKEN=your_api_token_here
\`\`\`

Make sure to add them for all environments (Production, Preview, Development).

### 5. Configure App Host in Plasmic

1. In Plasmic Studio, go to your project settings
2. Find "App Host" or "Host URL" section
3. Add the following URL:
   - Development: `http://localhost:3000/wesshinn/plasmic-host`
   - Production: `https://wesshinn.tektonstable.com/plasmic-host`

### 6. Test the Setup

1. Deploy your application with the new environment variables
2. Go to `wesshinn.tektonstable.com/admin/pages/new`
3. Click "Open Plasmic Studio"
4. The Plasmic editor should open in a new window
5. The editor will load your site at the `/plasmic-host` path

## How It Works

- **Plasmic Studio**: External editor hosted on plasmic.app
- **App Host Page**: `/plasmic-host` page that loads in Plasmic Studio
- **Content Rendering**: Use Plasmic SDK to render content in your app
- **Visual Editing**: Edit content in Plasmic Studio, changes sync to your site

## Register Custom Components (Optional)

You can register your existing React components to use in Plasmic:

\`\`\`tsx
// lib/plasmic-init.ts
import { initPlasmicLoader } from "@plasmicapp/loader-nextjs"
import { Button } from "@/components/ui/button"

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || "",
      token: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_TOKEN || "",
    },
  ],
  preview: true,
})

// Register your custom components
PLASMIC.registerComponent(Button, {
  name: "Button",
  props: {
    children: "slot",
    variant: {
      type: "choice",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      type: "choice",
      options: ["default", "sm", "lg", "icon"],
    },
  },
})
\`\`\`

## Current Setup

- **Plasmic**: Enabled for `wesshinn` tenant only
- **Unlayer**: Still used for all other tenants
- **Email Builder**: Unlayer remains for email editing

## Next Steps

Once you verify Plasmic works for wesshinn, you can:
1. Roll it out to other tenants by updating the conditional logic
2. Add it as a selectable option in tenant settings
3. Register more custom components for richer editing experience
