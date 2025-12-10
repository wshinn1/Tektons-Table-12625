"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { sendPostNotificationEmails } from "./email" // Import email notification function
import { sendNewPremiumPostEmail } from "@/lib/premium-emails"

export async function createBlogPost(data: {
  title: string
  subtitle?: string
  slug: string
  content: any
  featuredImageUrl?: string
  tenantId?: string
  status: "draft" | "published"
  metaDescription?: string
  categoryIds?: string[]
  categoryId?: string
  tagIds?: string[]
  allowComments?: boolean
  followersOnly?: boolean
  readTime?: number
  authorName?: string
  featuredImage?: string
  featuredImageCaption?: string
  excerpt?: string
  showFeaturedImage?: boolean
  navbarVisible?: boolean
  resourceCategoryId?: string
  isPremium?: boolean
}) {
  const isTenantPost = data.tenantId && data.tenantId !== "platform"
  const supabase = isTenantPost ? createAdminClient() : await createServerClient()

  // For platform posts, verify user is authenticated
  if (!isTenantPost) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }
  }

  // For tenant posts, we need to get the tenant to use as author
  let authorId = data.tenantId
  if (!isTenantPost) {
    const serverClient = await createServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()
    authorId = user?.id
  }

  let readTime = data.readTime
  if (!readTime) {
    const wordCount = JSON.stringify(data.content).split(/\s+/).length
    readTime = Math.max(1, Math.ceil(wordCount / 200))
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      title: data.title,
      subtitle: data.subtitle,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featured_image_url: data.featuredImage || data.featuredImageUrl,
      featured_image_caption: data.featuredImageCaption,
      show_featured_image: data.showFeaturedImage ?? true,
      author_id: authorId,
      author_name: data.authorName,
      tenant_id: data.tenantId || "platform",
      status: data.status,
      meta_description: data.metaDescription,
      read_time_minutes: readTime,
      published_at: data.status === "published" ? new Date().toISOString() : null,
      allow_comments: data.allowComments ?? true,
      followers_only: data.followersOnly ?? false,
      navbar_visible: data.navbarVisible ?? true,
      is_premium: data.isPremium ?? false,
      resource_category_id: data.resourceCategoryId || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create blog post:", error)
    throw new Error("Failed to create blog post")
  }

  // Add categories
  const categoryIds = data.categoryIds || (data.categoryId ? [data.categoryId] : [])
  if (categoryIds.length > 0) {
    const categoryInserts = categoryIds.map((categoryId) => ({
      post_id: post.id,
      category_id: categoryId,
    }))
    await supabase.from("blog_post_categories").insert(categoryInserts)
  }

  // Add tags
  if (data.tagIds && data.tagIds.length > 0) {
    const tagInserts = data.tagIds.map((tagId) => ({
      post_id: post.id,
      tag_id: tagId,
    }))
    await supabase.from("blog_post_tags").insert(tagInserts)
  }

  if (data.status === "published" && data.tenantId && data.tenantId !== "platform") {
    console.log("[v0] Post published, sending notifications...")
    sendPostNotificationEmails(post.id, data.tenantId).catch((err) => {
      console.error("[v0] Failed to send post notifications:", err)
      // Don't throw - we don't want email failures to break post creation
    })
  }

  if (data.status === "published" && data.isPremium && (!data.tenantId || data.tenantId === "platform")) {
    console.log("[v0] Premium platform post published, notifying tenants...")
    notifyTenantsOfPremiumPost({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
    }).catch((err) => {
      console.error("[v0] Failed to notify tenants of premium post:", err)
    })
  }

  revalidatePath("/admin/blog")
  revalidatePath("/resources")
  return post
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string
    subtitle?: string
    slug?: string
    content?: any
    featuredImageUrl?: string
    status?: "draft" | "published"
    metaDescription?: string
    categoryIds?: string[]
    tagIds?: string[]
    allowComments?: boolean
    followersOnly?: boolean
    readTime?: number
    authorName?: string
    featuredImage?: string
    featuredImageCaption?: string
    excerpt?: string
    showFeaturedImage?: boolean
    navbarVisible?: boolean
    resourceCategoryId?: string
    isPremium?: boolean
  },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: existingPost } = await supabase.from("blog_posts").select("status, tenant_id").eq("id", id).single()

  const isBeingPublished = existingPost?.status === "draft" && data.status === "published"

  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.content !== undefined) updateData.content = data.content
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
  if (data.readTime !== undefined) {
    updateData.read_time_minutes = data.readTime
  } else if (data.content !== undefined) {
    const wordCount = JSON.stringify(data.content).split(/\s+/).length
    updateData.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200))
  }
  if (data.featuredImage !== undefined) updateData.featured_image_url = data.featuredImage
  if (data.featuredImageUrl !== undefined) updateData.featured_image_url = data.featuredImageUrl
  if (data.featuredImageCaption !== undefined) updateData.featured_image_caption = data.featuredImageCaption
  if (data.authorName !== undefined) updateData.author_name = data.authorName
  if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription
  if (data.allowComments !== undefined) updateData.allow_comments = data.allowComments
  if (data.followersOnly !== undefined) updateData.followers_only = data.followersOnly
  if (data.status !== undefined) {
    updateData.status = data.status
    if (data.status === "published") {
      updateData.published_at = new Date().toISOString()
    }
  }
  if (data.showFeaturedImage !== undefined) updateData.show_featured_image = data.showFeaturedImage
  if (data.navbarVisible !== undefined) updateData.navbar_visible = data.navbarVisible
  if (data.isPremium !== undefined) updateData.is_premium = data.isPremium
  if (data.resourceCategoryId !== undefined) updateData.resource_category_id = data.resourceCategoryId || null

  console.log("[v0] Updating blog post:", id, "with data:", updateData)

  const { data: post, error } = await supabase.from("blog_posts").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Failed to update blog post:", error)
    throw new Error("Failed to update blog post")
  }

  console.log("[v0] Blog post updated successfully:", post.id)

  // Update categories if provided
  if (data.categoryIds !== undefined) {
    await supabase.from("blog_post_categories").delete().eq("post_id", id)
    if (data.categoryIds.length > 0) {
      const categoryInserts = data.categoryIds.map((categoryId) => ({
        post_id: id,
        category_id: categoryId,
      }))
      await supabase.from("blog_post_categories").insert(categoryInserts)
    }
  }

  // Update tags if provided
  if (data.tagIds !== undefined) {
    await supabase.from("blog_post_tags").delete().eq("post_id", id)
    if (data.tagIds.length > 0) {
      const tagInserts = data.tagIds.map((tagId) => ({
        post_id: id,
        tag_id: tagId,
      }))
      await supabase.from("blog_post_tags").insert(tagInserts)
    }
  }

  // Draft being published, sending notifications...
  if (isBeingPublished && existingPost?.tenant_id && existingPost.tenant_id !== "platform") {
    console.log("[v0] Draft being published, sending notifications...")
    sendPostNotificationEmails(post.id, existingPost.tenant_id).catch((err) => {
      console.error("[v0] Failed to send post notifications:", err)
    })
  }

  if (isBeingPublished && data.isPremium && (!existingPost?.tenant_id || existingPost.tenant_id === "platform")) {
    console.log("[v0] Premium platform post being published, notifying tenants...")
    notifyTenantsOfPremiumPost({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
    }).catch((err) => {
      console.error("[v0] Failed to notify tenants of premium post:", err)
    })
  }

  revalidatePath("/admin/blog")
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath("/resources")
  return post
}

export async function deleteBlogPost(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete blog post:", error)
    throw new Error("Failed to delete blog post")
  }

  revalidatePath("/admin/blog")
}

export async function getBlogPost(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      categories:blog_post_categories(category:blog_categories(*)),
      tags:blog_post_tags(tag:blog_tags(*))
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Failed to fetch blog post:", error)
    throw new Error("Failed to fetch blog post")
  }

  return data
}

export async function getBlogPosts(filters?: { tenantId?: string; status?: string }) {
  const supabase = await createServerClient()

  let query = supabase
    .from("blog_posts")
    .select(
      `
      *,
      categories:blog_post_categories(category:blog_categories(*)),
      tags:blog_post_tags(tag:blog_tags(*))
    `,
    )
    .order("created_at", { ascending: false })

  if (filters?.tenantId) {
    query = query.eq("tenant_id", filters.tenantId)
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to fetch blog posts:", error)
    throw new Error("Failed to fetch blog posts")
  }

  return data
}

export async function getBlogAnalytics(tenantId = "platform") {
  const supabase = await createServerClient()

  // Get all published posts for this tenant
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, view_count")
    .eq("tenant_id", tenantId)
    .eq("status", "published")

  const totalViews = posts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // Get total claps from reactions
  const { data: reactions } = await supabase
    .from("blog_post_reactions")
    .select("count, blog_post_id")
    .in("blog_post_id", posts?.map((p) => p.id) || [])

  const totalClaps = reactions?.reduce((sum, reaction) => sum + (reaction.count || 0), 0) || 0

  // Get total comments
  const { count: totalComments } = await supabase
    .from("blog_post_comments")
    .select("*", { count: "exact", head: true })
    .in("blog_post_id", posts?.map((p) => p.id) || [])
    .eq("status", "published")

  // Get top posts by views with aggregated claps and comments
  const { data: topPostsData } = await supabase
    .from("blog_posts")
    .select(
      `
      id, 
      title, 
      slug, 
      view_count, 
      published_at
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(10)

  // For each top post, get claps and comments count
  const topPosts = await Promise.all(
    (topPostsData || []).map(async (post) => {
      const { data: postReactions } = await supabase
        .from("blog_post_reactions")
        .select("count")
        .eq("blog_post_id", post.id)

      const clapsCount = postReactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0

      const { count: commentsCount } = await supabase
        .from("blog_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("blog_post_id", post.id)
        .eq("status", "published")

      return {
        ...post,
        views: post.view_count,
        claps_count: clapsCount,
        comments_count: commentsCount || 0,
      }
    }),
  )

  // Get recent posts
  const { data: recentPostsData } = await supabase
    .from("blog_posts")
    .select("id, title, slug, view_count, published_at, status")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(10)

  // For each recent post, get claps and comments count
  const recentPosts = await Promise.all(
    (recentPostsData || []).map(async (post) => {
      const { data: postReactions } = await supabase
        .from("blog_post_reactions")
        .select("count")
        .eq("blog_post_id", post.id)

      const clapsCount = postReactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0

      const { count: commentsCount } = await supabase
        .from("blog_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("blog_post_id", post.id)
        .eq("status", "published")

      return {
        ...post,
        views: post.view_count,
        claps_count: clapsCount,
        comments_count: commentsCount || 0,
      }
    }),
  )

  // Get post count
  const { count: totalPosts } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "published")

  const { count: draftPosts } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "draft")

  return {
    totalViews,
    totalClaps,
    totalComments: totalComments || 0,
    totalPosts: totalPosts || 0,
    draftPosts: draftPosts || 0,
    topPosts,
    recentPosts,
  }
}

export async function uploadBlogImage(formData: FormData) {
  "use server"

  const adminSupabase = createAdminClient()
  const supabase = await createServerClient()

  console.log("[v0] uploadBlogImage: Starting upload")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] uploadBlogImage: Auth result -", {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message,
  })

  if (!user) {
    console.log("[v0] uploadBlogImage: Unauthorized - no user found")
    return { success: false, error: "Unauthorized" }
  }

  const { data: tenant, error: tenantError } = await adminSupabase
    .from("tenants")
    .select("id, subdomain")
    .eq("email", user.email)
    .single()

  if (tenantError || !tenant) {
    console.log("[v0] uploadBlogImage: User is not a tenant owner:", tenantError?.message)
    return { success: false, error: "Access denied - not a tenant owner" }
  }

  console.log("[v0] uploadBlogImage: Tenant verified:", tenant.subdomain)

  const file = formData.get("file") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
    return { success: false, error: "File must be an image" }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Image must be less than 10MB" }
  }

  try {
    const timestamp = Date.now()
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric with underscore
      .substring(0, 50) // Limit length

    const originalExtension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const isHeic =
      originalExtension === "heic" ||
      originalExtension === "heif" ||
      file.type === "image/heic" ||
      file.type === "image/heif"

    let fileToUpload: File | Blob = file
    let extension = originalExtension

    if (isHeic) {
      console.log("[v0] uploadBlogImage: HEIC file detected, converting to JPEG")
      try {
        const heicConvert = (await import("heic-convert")).default
        const arrayBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)

        console.log("[v0] uploadBlogImage: Starting HEIC conversion, buffer size:", inputBuffer.length)

        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.85,
        })

        fileToUpload = new Blob([outputBuffer], { type: "image/jpeg" })
        extension = "jpg"
        console.log("[v0] uploadBlogImage: HEIC converted to JPEG successfully, output size:", outputBuffer.length)
      } catch (conversionError: any) {
        console.error("[v0] uploadBlogImage: HEIC conversion failed:", conversionError?.message || conversionError)
        return {
          success: false,
          error: "Could not process this image format. Please convert to JPEG or PNG before uploading.",
        }
      }
    }

    const filename = `blog/${tenant.subdomain}/${timestamp}-${sanitizedName}.${extension}`

    const blob = await put(filename, fileToUpload, {
      access: "public",
    })
    console.log("[v0] uploadBlogImage: Upload successful:", blob.url)
    return { success: true, url: blob.url }
  } catch (error: any) {
    console.error("[v0] uploadBlogImage: Failed to upload image:", error?.message || error)
    return { success: false, error: "Failed to upload image. Please try again." }
  }
}

export async function uploadPlatformBlogImage(formData: FormData) {
  "use server"

  const adminSupabase = createAdminClient()
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is a super admin
  const { data: superAdmin } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).single()

  if (!superAdmin) {
    throw new Error("Access denied - not a super admin")
  }

  const file = formData.get("file") as File
  if (!file) {
    throw new Error("No file provided")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be less than 5MB")
  }

  try {
    const timestamp = Date.now()
    const filename = `blog/platform/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    const blob = await put(filename, file, {
      access: "public",
    })
    console.log("[v0] uploadPlatformBlogImage: Upload successful:", blob.url)
    return { url: blob.url }
  } catch (error) {
    console.error("Failed to upload image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function createPlatformCategory(name: string) {
  "use server"

  const adminSupabase = createAdminClient()
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] createPlatformCategory: user =", user?.id, user?.email)

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is a super admin
  const { data: superAdmin, error: superAdminError } = await adminSupabase
    .from("super_admins")
    .select("id")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] createPlatformCategory: superAdmin check =", { superAdmin, error: superAdminError?.message })

  if (!superAdmin) {
    console.log("[v0] createPlatformCategory: User not in super_admins table")
    throw new Error("Access denied - not a super admin")
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  console.log("[v0] createPlatformCategory: Creating category with name =", name, "slug =", slug)

  const { data: category, error } = await adminSupabase
    .from("blog_categories")
    .insert({
      name: name.trim(),
      slug,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] createPlatformCategory: Failed to create category:", error)
    throw new Error("Failed to create category")
  }

  console.log("[v0] createPlatformCategory: Category created successfully =", category)

  revalidatePath("/admin/blog")
  return category
}

export async function createPlatformTag(name: string) {
  "use server"

  const adminSupabase = createAdminClient()
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is a super admin
  const { data: superAdmin } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).single()

  if (!superAdmin) {
    throw new Error("Access denied - not a super admin")
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const { data: tag, error } = await adminSupabase
    .from("blog_tags")
    .insert({
      name: name.trim(),
      slug,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create tag:", error)
    throw new Error("Failed to create tag")
  }

  revalidatePath("/admin/blog")
  return tag
}

export async function createStarterBlogPost(tenantId: string, tenantName: string) {
  "use server"

  const adminSupabase = createAdminClient()

  try {
    const { data: wesshinnTenant } = await adminSupabase
      .from("tenants")
      .select("id")
      .eq("subdomain", "wesshinn")
      .single()

    if (!wesshinnTenant) {
      console.error("[v0] Could not find wesshinn tenant for starter post template")
      return null
    }

    // Get the exact blog post from wesshinn
    const { data: templatePost, error: templateError } = await adminSupabase
      .from("blog_posts")
      .select(
        "title, subtitle, slug, content, excerpt, featured_image_url, meta_description, read_time_minutes, show_featured_image",
      )
      .eq("tenant_id", wesshinnTenant.id)
      .eq("slug", "the-setup")
      .single()

    if (templateError || !templatePost) {
      console.error("[v0] Could not find template post from wesshinn:", templateError)
      return null
    }

    // Create the post for the new tenant using the exact content from wesshinn
    const { data: post, error } = await adminSupabase
      .from("blog_posts")
      .insert({
        title: templatePost.title,
        subtitle: templatePost.subtitle,
        slug: templatePost.slug,
        content: templatePost.content,
        excerpt: templatePost.excerpt,
        featured_image_url: templatePost.featured_image_url,
        author_id: tenantId,
        author_name: tenantName,
        tenant_id: tenantId,
        status: "published",
        meta_description: templatePost.meta_description,
        read_time_minutes: templatePost.read_time_minutes || 3,
        published_at: new Date().toISOString(),
        allow_comments: true,
        followers_only: false,
        show_featured_image: templatePost.show_featured_image ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to create starter blog post:", error)
      return null
    }

    console.log("[v0] Created starter blog post for tenant:", tenantId)
    return post
  } catch (err) {
    console.error("[v0] Error creating starter blog post:", err)
    return null
  }
}

// Function to notify tenants about new premium posts
async function notifyTenantsOfPremiumPost(post: {
  id: string
  title: string
  excerpt?: string
  slug: string
}) {
  try {
    const supabase = createAdminClient()

    // Get all tenants with their user emails
    const { data: tenants, error } = await supabase
      .from("tenants")
      .select(`
        id,
        full_name,
        user_id,
        users:user_id (
          email
        )
      `)
      .eq("is_active", true)

    if (error) {
      console.error("[v0] Error fetching tenants for premium notification:", error)
      return
    }

    if (!tenants || tenants.length === 0) {
      console.log("[v0] No active tenants to notify")
      return
    }

    console.log(`[v0] Notifying ${tenants.length} tenants about new premium post: ${post.title}`)

    // Send emails to all tenants
    const emailPromises = tenants.map(async (tenant) => {
      const email = (tenant.users as any)?.email
      if (!email) return

      try {
        await sendNewPremiumPostEmail(email, tenant.full_name || "there", {
          title: post.title,
          excerpt: post.excerpt || "",
          slug: post.slug,
        })
      } catch (err) {
        console.error(`[v0] Failed to send premium post notification to ${email}:`, err)
      }
    })

    await Promise.allSettled(emailPromises)
    console.log("[v0] Finished sending premium post notifications")
  } catch (err) {
    console.error("[v0] Error in notifyTenantsOfPremiumPost:", err)
  }
}
