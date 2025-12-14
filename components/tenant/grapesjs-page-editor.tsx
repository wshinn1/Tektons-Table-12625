"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

interface Page {
  id: string
  title: string
  slug: string
  content: string | null
  design_json: any
  is_published: boolean
  tenant_id: string
}

interface GrapesJSPageEditorProps {
  tenantId: string
  tenantSlug: string
  page?: Page
}

// Your GrapesJS Studio SDK license key
const GRAPESJS_LICENSE_KEY = "2ba0c6133f6144aebbe2767cbbfac5a4423d7181a648457c94e3c03c0ac6fd94"

const PAGE_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Page",
    media: "/blank-white-page.jpg",
    content: '<section style="min-height: 100vh; padding: 40px 20px;"></section>',
  },
  {
    id: "landing",
    name: "Landing Page",
    media: "/modern-landing-page-hero.jpg",
    content: `
            <section data-gjs-name="Hero" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 60px 20px;">
              <div style="text-align: center; max-width: 800px;">
                <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.2;">Welcome to Our Ministry</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 20px; margin: 0 0 40px 0; line-height: 1.6;">Join us in making a difference in communities around the world through faith, hope, and love.</p>
                <a href="#" style="background: white; color: #7c3aed; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px;">Get Involved</a>
              </div>
            </section>
            <section data-gjs-name="Mission" style="padding: 80px 20px; background: white;">
              <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                <h2 style="font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Our Mission</h2>
                <p style="color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto 40px;">We're dedicated to serving communities and spreading hope through practical ministry.</p>
                <div style="display: flex; gap: 30px; justify-content: center; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 250px; max-width: 350px; padding: 30px; background: #f9fafb; border-radius: 12px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Community</h3>
                    <p style="color: #6b7280; margin: 0;">Building strong, supportive communities that uplift one another.</p>
                  </div>
                  <div style="flex: 1; min-width: 250px; max-width: 350px; padding: 30px; background: #f9fafb; border-radius: 12px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Faith</h3>
                    <p style="color: #6b7280; margin: 0;">Nurturing spiritual growth through worship and fellowship.</p>
                  </div>
                  <div style="flex: 1; min-width: 250px; max-width: 350px; padding: 30px; background: #f9fafb; border-radius: 12px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Service</h3>
                    <p style="color: #6b7280; margin: 0;">Serving those in need with compassion and practical support.</p>
                  </div>
                </div>
              </div>
            </section>
            `,
  },
  {
    id: "about",
    name: "About Us",
    media: "/about-us-team-page.jpg",
    content: `
            <section style="padding: 80px 20px; background: #f9fafb;">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: #1f2937; margin: 0 0 24px;">About Our Ministry</h1>
                <p style="font-size: 18px; color: #6b7280; line-height: 1.8;">We are a community of believers dedicated to sharing God's love through service, worship, and outreach. Our journey began with a simple mission: to make a difference in our community and beyond.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 48px;">Our Leadership</h2>
                <div style="display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;">
                  <div style="text-align: center; max-width: 280px;">
                    <img src="/pastor-portrait.png" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px;">Pastor John Smith</h3>
                    <p style="color: #7c3aed; margin: 0 0 12px;">Senior Pastor</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Leading our congregation with wisdom and compassion for over 15 years.</p>
                  </div>
                  <div style="text-align: center; max-width: 280px;">
                    <img src="/woman-leader-portrait.jpg" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px;">Sarah Johnson</h3>
                    <p style="color: #7c3aed; margin: 0 0 12px;">Outreach Director</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Coordinating our community programs and mission initiatives.</p>
                  </div>
                </div>
              </div>
            </section>
          `,
  },
  {
    id: "events",
    name: "Events Page",
    media: "/events-calendar-page.jpg",
    content: `
            <section style="padding: 80px 20px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: white; margin: 0 0 16px;">Upcoming Events</h1>
                <p style="font-size: 18px; color: rgba(255,255,255,0.9);">Join us for worship, fellowship, and community gatherings.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 900px; margin: 0 auto;">
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; margin-bottom: 24px; display: flex; gap: 24px; align-items: center;">
                  <div style="background: #7c3aed; color: white; padding: 16px 24px; border-radius: 8px; text-align: center; min-width: 80px;">
                    <div style="font-size: 28px; font-weight: 700;">15</div>
                    <div style="font-size: 14px;">DEC</div>
                  </div>
                  <div style="flex: 1;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px;">Sunday Worship Service</h3>
                    <p style="color: #6b7280; margin: 0 0 8px;">10:00 AM - Main Sanctuary</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Join us for worship, prayer, and an inspiring message.</p>
                  </div>
                  <a href="#" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Learn More</a>
                </div>
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; margin-bottom: 24px; display: flex; gap: 24px; align-items: center;">
                  <div style="background: #7c3aed; color: white; padding: 16px 24px; border-radius: 8px; text-align: center; min-width: 80px;">
                    <div style="font-size: 28px; font-weight: 700;">20</div>
                    <div style="font-size: 14px;">DEC</div>
                  </div>
                  <div style="flex: 1;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px;">Christmas Eve Service</h3>
                    <p style="color: #6b7280; margin: 0 0 8px;">7:00 PM - Main Sanctuary</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">A special candlelight service celebrating the birth of Christ.</p>
                  </div>
                  <a href="#" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Learn More</a>
                </div>
              </div>
            </section>
          `,
  },
  {
    id: "donate",
    name: "Donation Page",
    media: "/donation-giving-page.jpg",
    content: `
            <section style="padding: 80px 20px; background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: white; margin: 0 0 16px;">Support Our Mission</h1>
                <p style="font-size: 18px; color: rgba(255,255,255,0.9);">Your generosity helps us serve our community and spread hope.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 24px;">Ways to Give</h2>
                <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap;">
                  <a href="#" style="flex: 1; min-width: 150px; padding: 24px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; text-decoration: none; color: #059669; font-weight: 600;">One-Time Gift</a>
                  <a href="#" style="flex: 1; min-width: 150px; padding: 24px; background: #059669; border: 2px solid #059669; border-radius: 12px; text-decoration: none; color: white; font-weight: 600;">Monthly Giving</a>
                </div>
                <p style="color: #6b7280; line-height: 1.8;">Every gift, no matter the size, makes a difference. Your donations support our community outreach programs, youth ministry, and mission work around the world.</p>
              </div>
            </section>
          `,
  },
  {
    id: "contact",
    name: "Contact Page",
    media: "/contact-form-page.png",
    content: `
            <section style="padding: 80px 20px; background: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: #1f2937; margin: 0 0 16px;">Get in Touch</h1>
                <p style="font-size: 18px; color: #6b7280;">We'd love to hear from you. Reach out with any questions.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 500px; margin: 0 auto;">
                <form style="display: flex; flex-direction: column; gap: 20px;">
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Name</label>
                    <input type="text" placeholder="Your name" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Email</label>
                    <input type="email" placeholder="your@email.com" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Message</label>
                    <textarea placeholder="Your message..." style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; min-height: 150px;"></textarea>
                  </div>
                  <button type="submit" style="padding: 14px 28px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Send Message</button>
                </form>
              </div>
            </section>
          `,
  },
  {
    id: "sermons",
    name: "Sermons Page",
    media: "/sermons-video-grid.jpg",
    content: `
            <section style="padding: 80px 20px; background: #1f2937;">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: white; margin: 0 0 16px;">Sermons & Messages</h1>
                <p style="font-size: 18px; color: rgba(255,255,255,0.8);">Watch or listen to our latest messages.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px;">
                <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <img src="/sermon-video-thumbnail.png" style="width: 100%; height: 200px; object-fit: cover;">
                  <div style="padding: 20px;">
                    <p style="color: #7c3aed; font-size: 14px; margin: 0 0 8px;">December 8, 2024</p>
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Walking in Faith</h3>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Pastor John Smith explores what it means to truly walk in faith in today's world.</p>
                  </div>
                </div>
                <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <img src="/worship-service-thumbnail.jpg" style="width: 100%; height: 200px; object-fit: cover;">
                  <div style="padding: 20px;">
                    <p style="color: #7c3aed; font-size: 14px; margin: 0 0 8px;">December 1, 2024</p>
                    <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">The Power of Prayer</h3>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Discover how prayer can transform your life and deepen your relationship with God.</p>
                  </div>
                </div>
              </div>
            </section>
          `,
  },
  {
    id: "ministries",
    name: "Ministries Page",
    media: "/ministries-programs-cards.jpg",
    content: `
            <section style="padding: 80px 20px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: white; margin: 0 0 16px;">Our Ministries</h1>
                <p style="font-size: 18px; color: rgba(255,255,255,0.9);">Discover ways to get involved and make a difference.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
                <div style="padding: 30px; background: #f9fafb; border-radius: 12px; text-align: center;">
                  <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 24px;">👶</span>
                  </div>
                  <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Children's Ministry</h3>
                  <p style="color: #6b7280; margin: 0;">Nurturing young hearts with age-appropriate Bible teaching and fun activities.</p>
                </div>
                <div style="padding: 30px; background: #f9fafb; border-radius: 12px; text-align: center;">
                  <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 24px;">🎓</span>
                  </div>
                  <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Youth Ministry</h3>
                  <p style="color: #6b7280; margin: 0;">Empowering teens to grow in faith through fellowship and service.</p>
                </div>
                <div style="padding: 30px; background: #f9fafb; border-radius: 12px; text-align: center;">
                  <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 24px;">🤝</span>
                  </div>
                  <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px;">Outreach</h3>
                  <p style="color: #6b7280; margin: 0;">Serving our community through food drives, homeless ministry, and more.</p>
                </div>
              </div>
            </section>
          `,
  },
  {
    id: "volunteer",
    name: "Volunteer Page",
    media: "/volunteer-signup-page.jpg",
    content: `
            <section style="padding: 80px 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: white; margin: 0 0 16px;">Volunteer With Us</h1>
                <p style="font-size: 18px; color: rgba(255,255,255,0.9);">Use your gifts to serve others and make a lasting impact.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 800px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 40px;">Volunteer Opportunities</h2>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                  <div style="display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <input type="checkbox" style="width: 20px; height: 20px;">
                    <div style="flex: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 4px;">Greeting Team</h3>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Welcome guests and help them feel at home.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <input type="checkbox" style="width: 20px; height: 20px;">
                    <div style="flex: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 4px;">Children's Ministry</h3>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Help teach and care for our youngest members.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <input type="checkbox" style="width: 20px; height: 20px;">
                    <div style="flex: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 4px;">Tech Team</h3>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Run sound, lights, and video for services.</p>
                    </div>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 40px;">
                  <a href="#" style="display: inline-block; padding: 14px 32px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Sign Up to Volunteer</a>
                </div>
              </div>
            </section>
          `,
  },
  {
    id: "testimonials",
    name: "Testimonials Page",
    media: "/testimonials-quotes-page.jpg",
    content: `
            <section style="padding: 80px 20px; background: #f9fafb;">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: #1f2937; margin: 0 0 16px;">Stories of Transformation</h1>
                <p style="font-size: 18px; color: #6b7280;">Hear how God is working in the lives of our community.</p>
              </div>
            </section>
            <section style="padding: 60px 20px; background: white;">
              <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px;">
                <div style="padding: 40px; background: #f9fafb; border-radius: 16px; position: relative;">
                  <div style="font-size: 60px; color: #7c3aed; position: absolute; top: 20px; left: 30px; opacity: 0.3;">"</div>
                  <p style="font-size: 18px; color: #4b5563; line-height: 1.8; margin: 0 0 20px; position: relative; z-index: 1;">This church has been a blessing to my family. The community here welcomed us with open arms and helped us through the most challenging times.</p>
                </div>
                <div style="padding: 40px; background: #f9fafb; border-radius: 16px; position: relative;">
                  <div style="font-size: 60px; color: #7c3aed; position: absolute; top: 20px; left: 30px; opacity: 0.3;">"</div>
                  <p style="font-size: 18px; color: #4b5563; line-height: 1.8; margin: 0 0 20px; position: relative; z-index: 1;">I have found great joy and purpose in volunteering at this ministry. The team is supportive and the work is meaningful.</p>
                </div>
              </div>
            </section>
          `,
  },
]

export function GrapesJSPageEditor({ tenantId, tenantSlug, page }: GrapesJSPageEditorProps) {
  const editorRef = useRef<any>(null)
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(!page)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditorLoading, setIsEditorLoading] = useState(true)

  const [pageContent, setPageContent] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkSidebarState = () => {
      const saved = localStorage.getItem(`tenant-admin-sidebar-collapsed-${tenantSlug}`)
      setIsSidebarCollapsed(saved === "true")
    }

    checkSidebarState()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `tenant-admin-sidebar-collapsed-${tenantSlug}`) {
        setIsSidebarCollapsed(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const interval = setInterval(checkSidebarState, 100)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [mounted, tenantSlug])

  const handleAiGenerate = useCallback(async () => {
    const editor = editorRef.current
    console.log("[v0] AI Generate called with prompt:", pageContent.content)
    console.log("[v0] Editor instance from ref:", !!editor)
    console.log("[v0] Editor ready state:", editorRef.current)

    if (!editor) {
      toast.error("Editor not ready yet. Please wait a moment and try again.")
      console.log("[v0] Editor not ready - ref is null")
      return
    }

    if (!pageContent.content.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    try {
      console.log("[v0] Calling AI API...")
      const response = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: pageContent.content }),
      })

      console.log("[v0] AI API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      console.log("[v0] AI API response data received, html length:", data.html?.length)

      if (data.html) {
        try {
          if (editor.setComponents) {
            editor.setComponents(data.html)
            console.log("[v0] Content inserted via setComponents")
          } else if (editor.DomComponents?.getWrapper) {
            const wrapper = editor.DomComponents.getWrapper()
            wrapper.append(data.html)
            console.log("[v0] Content inserted via DomComponents.getWrapper().append")
          } else if (editor.Canvas) {
            const body = editor.Canvas.getBody()
            if (body) {
              body.innerHTML += data.html
              console.log("[v0] Content inserted via Canvas.getBody()")
            }
          }

          toast.success("Content generated successfully!")
        } catch (insertError) {
          console.error("[v0] Error inserting content:", insertError)
          toast.error("Generated content but failed to insert it")
        }
      }

      setPageContent((prev) => ({ ...prev, content: "" }))
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
    }
  }, [pageContent])

  useEffect(() => {
    console.log("[v0] GrapesJS editor mounting", { hasPage: !!page, windowGrapesjs: !!window.grapesjs })

    const initEditor = () => {
      if (editorRef.current) {
        console.log("[v0] Editor already initialized")
        return
      }

      if (!window.grapesjs) {
        console.log("[v0] Waiting for GrapesJS to load...")
        setTimeout(initEditor, 100)
        return
      }

      console.log("[v0] Initializing GrapesJS editor")
      setIsEditorLoading(true)

      try {
        const editor = window.grapesjs.init({
          container: "#gjs",
          height: "100%",
          fromElement: true,
          storageManager: false,
          panels: { defaults: [] },
          layerManager: { visible: false },
          deviceManager: { devices: [] },
          selectorManager: { appendTo: "#my-selectors" },
          styleManager: { appendTo: "#my-styles" },
          blockManager: { appendTo: "#my-blocks" },
          traitManager: { appendTo: "#my-traits" },
          panels: { defaults: [] },
          plugins: ["gjs-blocks-basic"],
          pluginsOpts: {
            "gjs-blocks-basic": {
              /* options */
            },
          },
        })

        editor.setStyle(`
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
        `)

        const contentToLoad = page?.content || PAGE_TEMPLATES[0].content
        console.log("[v0] Loading content", { hasPageContent: !!page?.content })
        editor.setComponents(contentToLoad)

        editorRef.current = editor
        setIsEditorLoading(false)
        console.log("[v0] GrapesJS editor initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing GrapesJS:", error)
        setIsEditorLoading(false)
      }
    }

    if (!showSetupDialog) {
      initEditor()
    }

    return () => {
      if (editorRef.current) {
        console.log("[v0] Destroying GrapesJS editor")
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [page, showSetupDialog]) // Fixed dependency to use entire page object instead of page?.content

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      if (page) {
        await updateTenantPage(page.id, { content: editorRef.current.getHtml() })
      } else {
        await createTenantPage(tenantId, { content: editorRef.current.getHtml() })
      }
      toast.success("Page saved successfully!")
      router.push(`/tenant/${tenantSlug}/pages`)
    } catch (error) {
      toast.error("Failed to save page.")
    } finally {
      setIsSaving(false)
    }
  }, [page, tenantId, tenantSlug, router])

  const handlePublishToggle = useCallback(async () => {
    setIsPublished(!isPublished)
    try {
      if (page) {
        await updateTenantPage(page.id, { is_published: !isPublished })
      }
    } catch (error) {
      toast.error("Failed to update page status.")
    }
  }, [isPublished, page])

  const handleCreatePage = async () => {
    if (!pageContent.title || !pageContent.slug) {
      alert("Please enter both a title and slug")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/tenant/${tenantId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageContent.title,
          slug: pageContent.slug,
          content: "",
          is_published: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create page")
      }

      const newPage = await response.json()
      setShowSetupDialog(false)

      router.push(`/${tenantSlug}/admin/pages/${newPage.id}/edit`)
    } catch (error) {
      console.error("Error creating page:", error)
      alert("Failed to create page. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-gray-50 transition-all duration-300 ${
        mounted ? (isSidebarCollapsed ? "ml-16 md:ml-16" : "ml-0 md:ml-64") : "ml-0 md:ml-64"
      }`}
    >
      {isEditorLoading && !showSetupDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-600">Loading page editor...</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b bg-white p-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Switch checked={isPublished} onCheckedChange={handlePublishToggle}>
            Publish
          </Switch>
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
      <div id="gjs" className="flex-1"></div>
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>Enter a title and URL slug for your new custom page.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={pageContent.title}
                onChange={(e) => setPageContent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter page title..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={pageContent.slug}
                onChange={(e) => setPageContent((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="page-url-slug"
              />
              <p className="text-sm text-muted-foreground">This will be the URL: /{pageContent.slug || "page-url"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push(`/${tenantSlug}/admin`)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreatePage} disabled={isCreating || !pageContent.title || !pageContent.slug}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Page"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GrapesJSPageEditor
