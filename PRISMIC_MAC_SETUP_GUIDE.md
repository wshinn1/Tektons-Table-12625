# Prismic Setup Guide for Mac

This guide will walk you through setting up Prismic's visual builder on your Mac so you can use the drag-and-drop editor at tektonstable.prismic.io.

## Prerequisites

You need to have these installed on your Mac:
- **Node.js** (v18 or newer)
- **Git**
- **A code editor** (VS Code recommended)

### Check if you have Node.js installed:
```bash
node --version
```

If you see a version number like `v20.x.x`, you're good! If not, install Node.js from https://nodejs.org (download the LTS version).

---

## Step 1: Download Your Project from v0

1. In v0, click the **three dots** (⋮) in the top-right corner of your code block
2. Select **"Download ZIP"** or use the **GitHub integration** if connected
3. Unzip the file to a folder like `~/Desktop/tektonstable`

---

## Step 2: Open Terminal

1. Press `Cmd + Space` to open Spotlight
2. Type `Terminal` and press Enter
3. A black/white window will open

---

## Step 3: Navigate to Your Project

In Terminal, type:
```bash
cd ~/Desktop/tektonstable
```

Replace `~/Desktop/tektonstable` with wherever you unzipped the project.

**Tip:** You can drag the folder from Finder into Terminal to auto-fill the path!

---

## Step 4: Install Dependencies

In Terminal, run:
```bash
npm install
```

This will take 1-2 minutes. You'll see a progress bar and lots of text scrolling.

---

## Step 5: Create Environment Variables File

Create a file called `.env.local` in your project folder:

```bash
touch .env.local
```

Then open it in your editor and add:
```
NEXT_PUBLIC_PRISMIC_ENVIRONMENT=tektonstable
```

Copy all your other environment variables from v0's **Vars** section into this file.

---

## Step 6: Initialize Slice Machine

Run this command:
```bash
npx @slicemachine/init@latest --repository tektonstable
```

This will:
- Detect your existing slice definitions
- Connect to your Prismic repository
- Prepare everything for the visual builder

**You may be asked to log in to Prismic** - follow the prompts in Terminal.

---

## Step 7: Start Slice Machine

Run:
```bash
npm run slicemachine
```

**What you'll see:**
```
✓ Slice Machine running at http://localhost:9999
```

Open your browser and go to **http://localhost:9999**

---

## Step 8: Push Slices to Prismic

In the Slice Machine UI (http://localhost:9999):

1. You'll see all 26 slice types we created (Hero with Background, Features Grid, etc.)
2. Click **"Push to Prismic"** or **"Sync"** button
3. This uploads your slice definitions to tektonstable.prismic.io

**This only needs to be done ONCE!**

---

## Step 9: Use Prismic's Visual Builder

Now you're ready to use the visual editor:

1. Go to **https://tektonstable.prismic.io**
2. Click **"Create New"** → **"Page"** (or create a custom type)
3. You'll see the visual builder where you can drag and drop your slices
4. Edit content with the nice visual interface
5. Click **"Save"** and **"Publish"**

---

## Step 10: Use Prismic Sections in Your App

Back in your tektonstable.com admin:

1. Go to Homepage Editor or any page editor
2. Click "Add New Section"
3. Choose the **"Prismic Sections"** tab
4. Select a slice type (e.g., "Hero with Background")
5. Click **"Edit in Prismic"** button → this opens the visual editor
6. Edit content in Prismic's interface
7. Save and your site automatically fetches the latest content!

---

## Troubleshooting

### "npm: command not found"
You need to install Node.js from https://nodejs.org

### "Permission denied" errors
Try adding `sudo` before the command:
```bash
sudo npm install
```

### Slice Machine won't start
Make sure you're in the correct directory:
```bash
pwd
```
Should show something like `/Users/yourname/Desktop/tektonstable`

### "Repository not found"
Make sure you created the repository at prismic.io and it's named `tektonstable`

---

## After Initial Setup

**Good news!** You only need to run these commands ONCE on your Mac. After the initial setup:

1. All editing happens in Prismic's visual builder at tektonstable.prismic.io
2. Your live site automatically fetches the latest content
3. No need to touch Terminal again unless you add new slice types

---

## Quick Reference

```bash
# If you need to add a new slice type later:
npm run slicemachine

# To run your site locally for testing:
npm run dev

# Then open: http://localhost:3000
```

---

## Need Help?

If you get stuck, you can:
1. Copy the error message from Terminal
2. Share it with v0 for troubleshooting
3. Or check Prismic's documentation at https://prismic.io/docs
