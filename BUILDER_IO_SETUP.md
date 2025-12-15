# Builder.io Integration Setup Guide

This guide will help you set up Builder.io visual editing for your platform.

## Step 1: Create a Builder.io Account

1. Go to [https://www.builder.io/signup](https://www.builder.io/signup)
2. Sign up for a free account (25,000 page views/month)
3. Create a new space for your project

## Step 2: Get Your API ID

1. In Builder.io dashboard, click on your profile (top right)
2. Go to "Account Settings" → "API Keys"
3. Copy your **Public API Key** (this is your API ID)

## Step 3: Add Environment Variable

Add this to your Vercel environment variables (in v0 Vars section):

```
NEXT_PUBLIC_BUILDER_API_ID=your-api-id-here
```

Replace `your-api-id-here` with the key you copied from Builder.io.

## Step 4: Configure Builder.io Models

In Builder.io dashboard:

1. Go to **Models** in the left sidebar
2. Click **+ New Model**
3. Create a model named `section`
4. Set the entry type to "Section"
5. Set Preview URL to `https://tektonstable.com`

## Step 5: Create Your First Section in Builder.io

1. In Builder.io dashboard, go to **Content**
2. Click **+ New Entry**
3. Select the `section` model
4. Use the visual editor to design your section
5. Publish when done

## Step 6: Use in Your Site

1. Go to your admin panel (e.g., `/admin/homepage-editor`)
2. Click "Add Section"
3. Choose the "Builder.io Sections" tab
4. Select a section template
5. Click "Edit in Builder.io" to customize it
6. Save your changes

## Features

- **No Terminal Required**: Everything is done through web interfaces
- **Visual Editing**: Drag-and-drop interface in Builder.io
- **Live Preview**: See changes instantly
- **Version Control**: Built-in versioning in Builder.io
- **A/B Testing**: Test different designs (paid plans)

## Pricing

- **Free**: 25,000 page views/month
- **Pro**: $49/month - unlimited page views, A/B testing, advanced features
- **Enterprise**: Custom pricing

## Support

- [Builder.io Documentation](https://www.builder.io/c/docs/intro)
- [Video Tutorials](https://www.builder.io/c/docs/videos)
- [Community Forum](https://forum.builder.io/)
