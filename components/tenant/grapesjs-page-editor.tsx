"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Sparkles, X, Loader2, LayoutTemplate } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

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
    data: {
      pages: [
        {
          name: "Blank Page",
          component: '<section style="min-height: 100vh; padding: 40px 20px;"></section>',
        },
      ],
    },
  },
  {
    id: "landing",
    name: "Landing Page",
    media: "/modern-landing-page-hero.jpg",
    data: {
      pages: [
        {
          name: "Landing Page",
          component: `
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
      ],
    },
  },
  {
    id: "about",
    name: "About Us",
    media: "/about-us-team-page.jpg",
    data: {
      pages: [
        {
          name: "About Us",
          component: `
            <section style="padding: 80px 20px; background: #f9fafb;">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 42px; font-weight: 700; color: #1f2937; margin: 0 0 24px;">About Our Ministry</h1>
                <p style="font-size: 18px; color: #6b7280; line-height: 1.8;">We are a community of believers dedicated to sharing God's love through service, worship, and outreach. Our journey began with a simple mission: to make a difference in our community and beyond.</p>
              </div>
            </section>
            <section style="padding: 80px 20px; background: white;">
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
      ],
    },
  },
  {
    id: "events",
    name: "Events Page",
    media: "/events-calendar-page.jpg",
    data: {
      pages: [
        {
          name: "Events",
          component: `
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
      ],
    },
  },
  {
    id: "donate",
    name: "Donation Page",
    media: "/donation-giving-page.jpg",
    data: {
      pages: [
        {
          name: "Give",
          component: `
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
      ],
    },
  },
  {
    id: "contact",
    name: "Contact Page",
    media: "/contact-form-page.png",
    data: {
      pages: [
        {
          name: "Contact",
          component: `
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
      ],
    },
  },
  {
    id: "sermons",
    name: "Sermons Page",
    media: "/sermons-video-grid.jpg",
    data: {
      pages: [
        {
          name: "Sermons",
          component: `
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
      ],
    },
  },
  {
    id: "ministries",
    name: "Ministries Page",
    media: "/ministries-programs-cards.jpg",
    data: {
      pages: [
        {
          name: "Ministries",
          component: `
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
      ],
    },
  },
  {
    id: "volunteer",
    name: "Volunteer Page",
    media: "/volunteer-signup-page.jpg",
    data: {
      pages: [
        {
          name: "Volunteer",
          component: `
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
      ],
    },
  },
  {
    id: "testimonials",
    name: "Testimonials Page",
    media: "/testimonials-quotes-page.jpg",
    data: {
      pages: [
        {
          name: "Testimonials",
          component: `
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
                  <p style="font-size: 18px; color: #4b5563; line-height: 1.8; margin: 0 0 20px; position: relative; z-index: 1;">This church has been a blessing to my family. The community here welcomed us with open arms and helped us through the most difficult time in our lives.</p>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="/smiling-woman-portrait.png" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    <div>
                      <p style="font-weight: 600; color: #1f2937; margin: 0;">Maria Garcia</p>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Member since 2020</p>
                    </div>
                  </div>
                </div>
                <div style="padding: 40px; background: #f9fafb; border-radius: 16px; position: relative;">
                  <div style="font-size: 60px; color: #7c3aed; position: absolute; top: 20px; left: 30px; opacity: 0.3;">"</div>
                  <p style="font-size: 18px; color: #4b5563; line-height: 1.8; margin: 0 0 20px; position: relative; z-index: 1;">The youth program changed my teenager's life. He found purpose, community, and a deeper faith that has transformed our whole family.</p>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="/smiling-man-portrait.png" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    <div>
                      <p style="font-weight: 600; color: #1f2937; margin: 0;">David Thompson</p>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">Member since 2018</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          `,
        },
      ],
    },
  },
]

function GrapesJSPageEditor({ tenantId, tenantSlug, page }: GrapesJSPageEditorProps) {
  const router = useRouter()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)
  const [pageTitle, setPageTitle] = useState(page?.title || "Untitled Page")
  const [pageSlug, setPageSlug] = useState(page?.slug || "untitled-page")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])

  const [showTemplatePicker, setShowTemplatePicker] = useState(!page?.id)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleAiGenerate = async () => {
    console.log("[v0] AI Generate called with prompt:", aiPrompt)
    console.log("[v0] Editor instance:", editorInstanceRef.current)

    if (!aiPrompt.trim()) {
      console.log("[v0] Empty prompt, returning")
      toast.error("Please enter a prompt")
      return
    }

    setAiLoading(true)
    setAiMessages((prev) => [...prev, { role: "user", content: aiPrompt }])
    const currentPrompt = aiPrompt
    setAiPrompt("") // Clear immediately

    try {
      console.log("[v0] Sending request to /api/ai/generate-page")
      const response = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (data.html) {
        // Insert the generated HTML into the editor
        const editor = editorInstanceRef.current
        console.log("[v0] Inserting HTML into editor")

        if (editor) {
          // Try different methods to add content
          try {
            if (editor.addComponents) {
              editor.addComponents(data.html)
              console.log("[v0] Added via addComponents")
            } else if (editor.getWrapper) {
              const wrapper = editor.getWrapper()
              wrapper.append(data.html)
              console.log("[v0] Added via wrapper.append")
            } else if (editor.setComponents) {
              const currentHtml = editor.getHtml?.() || ""
              editor.setComponents(currentHtml + data.html)
              console.log("[v0] Added via setComponents")
            }
          } catch (insertError) {
            console.error("[v0] Error inserting content:", insertError)
          }
        }

        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message || "I've added the content to your page. You can now customize it using the visual editor.",
          },
        ])
        toast.success("Content generated successfully!")
      }
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        },
      ])
      toast.error("Failed to generate content")
    } finally {
      setAiLoading(false)
    }
  }

  // Initialize GrapesJS Studio SDK
  useEffect(() => {
    if (!editorContainerRef.current || editorInstanceRef.current) return

    const initStudioEditor = async () => {
      try {
        // Dynamic import of Studio SDK
        const { default: createStudioEditor } = await import("@grapesjs/studio-sdk")
        await import("@grapesjs/studio-sdk/style")

        const plugins: any[] = []

        try {
          const sdkPlugins = await import("@grapesjs/studio-sdk-plugins")

          // Only add plugins that exist and have an init method
          if (sdkPlugins.layoutSidebarButtons?.init) {
            plugins.push(
              sdkPlugins.layoutSidebarButtons.init({
                sidebarButtons: ({ sidebarButtons }: any) => sidebarButtons,
              }),
            )
          }

          if (sdkPlugins.flexColumns?.init) {
            plugins.push(sdkPlugins.flexColumns.init({}))
          }

          if (sdkPlugins.proseMirror?.init) {
            plugins.push(sdkPlugins.proseMirror.init({}))
          }

          if (sdkPlugins.fullSize?.init) {
            plugins.push(sdkPlugins.fullSize.init({}))
          }

          if (sdkPlugins.lightGallery?.init) {
            plugins.push(sdkPlugins.lightGallery.init({}))
          }

          if (sdkPlugins.listPages?.init) {
            plugins.push(sdkPlugins.listPages.init({}))
          }
        } catch (pluginError) {
          console.warn("[v0] Some SDK plugins could not be loaded:", pluginError)
        }

        // Get initial content
        let initialHtml = '<section style="min-height: 100vh; padding: 40px 20px;"></section>'
        let initialCss = ""

        if (page?.design_json) {
          try {
            const designData = typeof page.design_json === "string" ? JSON.parse(page.design_json) : page.design_json
            initialHtml = designData.html || designData["gjs-html"] || initialHtml
            initialCss = designData.css || designData["gjs-css"] || ""
          } catch (e) {
            console.error("Error parsing design_json:", e)
          }
        } else if (page?.content) {
          initialHtml = page.content
        }

        plugins.push((editor: any) => {
          editor.onReady(() => {
            // Only show template dialog for new pages (no existing page)
            if (!page?.id && showTemplatePicker) {
              // Check showTemplatePicker state
              editor.runCommand("studio:layoutToggle", {
                id: "templates-panel",
                header: false,
                placer: { type: "dialog", title: "Choose a template for your page", size: "l" },
                layout: {
                  type: "panelTemplates",
                  content: { itemsPerRow: 3 },
                  onSelect: ({ loadTemplate, template }: any) => {
                    loadTemplate(template)
                    editor.runCommand("studio:layoutRemove", { id: "templates-panel" })
                    setShowTemplatePicker(false) // Hide picker after selection
                  },
                },
              })
            }
          })
        })

        // Create Studio Editor
        const editor = await createStudioEditor({
          root: editorContainerRef.current!,
          licenseKey: GRAPESJS_LICENSE_KEY,

          plugins,

          // Project configuration
          project: {
            type: "web",
            default: {
              pages: [
                {
                  name: pageTitle,
                  component: initialHtml,
                  styles: initialCss,
                },
              ],
            },
          },

          templates: {
            onLoad: async () => PAGE_TEMPLATES,
          },

          blockManager: {
            blocks: [
              // Basic blocks
              {
                id: "section",
                label: "Section",
                category: "Basic",
                content: '<section style="padding: 50px 20px; min-height: 200px;"></section>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 18H3V6h18v12zm-2-2V8H5v8h14z"/></svg>',
              },
              {
                id: "container",
                label: "Container",
                category: "Basic",
                content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;"></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/></svg>',
              },
              {
                id: "text",
                label: "Text",
                category: "Basic",
                content: '<p style="padding: 10px;">Insert your text here</p>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v7h6V4h2v16h-2V4H5V4z"/></svg>',
              },
              {
                id: "heading",
                label: "Heading",
                category: "Basic",
                content: '<h1 style="padding: 10px;">Heading</h1>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v7h6V4h2v16h-2V4H5V4z"/></svg>',
              },
              {
                id: "link",
                label: "Link",
                category: "Basic",
                content: '<a href="#" style="padding: 10px; display: inline-block;">Link</a>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
              },
              {
                id: "image",
                label: "Image",
                category: "Media",
                content: '<img src="/placeholder.svg?height=200&width=300" style="max-width: 100%; display: block;"/>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
              },
              {
                id: "video",
                label: "Video",
                category: "Media",
                content:
                  '<video style="width: 100%; max-width: 640px;" controls><source src="" type="video/mp4"/>Your browser does not support the video tag.</video>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
              },
              // Layout blocks - Flex Columns plugin will add its own, but we keep these too
              {
                id: "column1",
                label: "1 Column",
                category: "Layout",
                content:
                  '<div style="display: flex; flex-direction: column; padding: 10px;"><div style="flex: 1; padding: 10px; min-height: 75px;"></div></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>',
              },
              {
                id: "column2",
                label: "2 Columns",
                category: "Layout",
                content: `<div data-gjs-type="row" style="display: flex; flex-direction: row; flex-wrap: wrap; padding: 10px; gap: 10px; width: 100%;">
                  <div data-gjs-type="cell" style="flex: 1 1 45%; min-width: 200px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                  <div data-gjs-type="cell" style="flex: 1 1 45%; min-width: 200px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                </div>`,
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h7v16H4zm9 0h7v16h-7z"/></svg>',
              },
              {
                id: "column3",
                label: "3 Columns",
                category: "Layout",
                content: `<div data-gjs-type="row" style="display: flex; flex-direction: row; flex-wrap: wrap; padding: 10px; gap: 10px; width: 100%;">
                  <div data-gjs-type="cell" style="flex: 1 1 30%; min-width: 150px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                  <div data-gjs-type="cell" style="flex: 1 1 30%; min-width: 150px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                  <div data-gjs-type="cell" style="flex: 1 1 30%; min-width: 150px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                </div>`,
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h5v16H4zm6 0h4v16h-4zm6 0h4v16h-4z"/></svg>',
              },
              {
                id: "column37",
                label: "2 Columns 3/7",
                category: "Layout",
                content: `<div data-gjs-type="row" style="display: flex; flex-direction: row; flex-wrap: wrap; padding: 10px; gap: 10px; width: 100%;">
                  <div data-gjs-type="cell" style="flex: 3 1 25%; min-width: 150px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                  <div data-gjs-type="cell" style="flex: 7 1 60%; min-width: 200px; padding: 10px; min-height: 75px; background: rgba(0,0,0,0.02); border: 1px dashed #ccc;"></div>
                </div>`,
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h5v16H4zm7 0h9v16h-9z"/></svg>',
              },
              // Component blocks
              {
                id: "button",
                label: "Button",
                category: "Components",
                content:
                  '<a href="#" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Button</a>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/></svg>',
              },
              {
                id: "divider",
                label: "Divider",
                category: "Components",
                content: '<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>',
              },
              {
                id: "spacer",
                label: "Spacer",
                category: "Components",
                content: '<div style="height: 50px;"></div>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 18h3v-3H8v3zm0-5h3v-3H8v3zm0-5h3V5H8v3z"/></svg>',
              },
              {
                id: "icon",
                label: "Icon",
                category: "Components",
                content: '<span style="font-size: 24px;">★</span>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
              },
              // Form blocks
              {
                id: "form",
                label: "Form",
                category: "Forms",
                content:
                  '<form style="padding: 20px;"><div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 5px; font-weight: 500;">Name</label><input type="text" placeholder="Enter your name" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/></div><div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 5px; font-weight: 500;">Email</label><input type="email" placeholder="Enter your email" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/></div><button type="submit" style="padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Submit</button></form>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
              },
              {
                id: "input",
                label: "Input",
                category: "Forms",
                content:
                  '<input type="text" placeholder="Enter text..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
              },
              {
                id: "textarea",
                label: "Textarea",
                category: "Forms",
                content:
                  '<textarea placeholder="Enter your message..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 100px;"></textarea>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
              },
              {
                id: "select",
                label: "Select",
                category: "Forms",
                content:
                  '<select style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"><option value="">Select an option</option><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option></select>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>',
              },
              {
                id: "checkbox",
                label: "Checkbox",
                category: "Forms",
                content:
                  '<label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox"/> Checkbox label</label>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
              },
              {
                id: "radio",
                label: "Radio",
                category: "Forms",
                content:
                  '<label style="display: flex; align-items: center; gap: 8px;"><input type="radio" name="radio"/> Radio label</label>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
              },
            ],
          },

          // Global styles configuration
          globalStyles: {
            default: [
              // Colors
              {
                id: "colorPrimary",
                property: "color",
                field: "color",
                defaultValue: "#7c3aed",
                selector: ":root",
                label: "Primary",
                category: "Colors",
              },
              {
                id: "colorSecondary",
                property: "color",
                field: "color",
                defaultValue: "#64748b",
                selector: ":root",
                label: "Secondary",
                category: "Colors",
              },
              {
                id: "colorAccent",
                property: "color",
                field: "color",
                defaultValue: "#f59e0b",
                selector: ":root",
                label: "Accent",
                category: "Colors",
              },
              {
                id: "colorSuccess",
                property: "color",
                field: "color",
                defaultValue: "#22c55e",
                selector: ":root",
                label: "Success",
                category: "Colors",
              },
              {
                id: "colorWarning",
                property: "color",
                field: "color",
                defaultValue: "#eab308",
                selector: ":root",
                label: "Warning",
                category: "Colors",
              },
              {
                id: "colorError",
                property: "color",
                field: "color",
                defaultValue: "#ef4444",
                selector: ":root",
                label: "Error",
                category: "Colors",
              },
              // Typography - Body
              {
                id: "bodyBg",
                property: "background-color",
                field: "color",
                defaultValue: "#ffffff",
                selector: "body",
                label: "Background",
                category: "Body",
              },
              {
                id: "bodyColor",
                property: "color",
                field: "color",
                defaultValue: "#1f2937",
                selector: "body",
                label: "Color",
                category: "Body",
              },
              {
                id: "bodyFontSize",
                property: "font-size",
                field: { type: "number", min: 0.5, max: 3, step: 0.1, units: ["rem"] },
                defaultValue: "1rem",
                selector: "body",
                label: "Font Size",
                category: "Body",
              },
              // Typography - Headings
              {
                id: "h1Color",
                property: "color",
                field: "color",
                defaultValue: "#1f2937",
                selector: "h1",
                label: "H1 Color",
                category: "Heading",
              },
              {
                id: "h1Size",
                property: "font-size",
                field: { type: "number", min: 1, max: 6, step: 0.1, units: ["rem"] },
                defaultValue: "2.5rem",
                selector: "h1",
                label: "H1 Size",
                category: "Heading",
              },
            ],
          },

          // Storage - disable auto-save, we handle saving manually
          storage: false,

          // Assets configuration
          assets: {
            uploadFile: async (file: File) => {
              // You can implement file upload to your storage here
              // For now, return a placeholder
              return URL.createObjectURL(file)
            },
          },
        })

        editorInstanceRef.current = editor
        setEditorReady(true)

        console.log("[v0] GrapesJS Studio SDK initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing GrapesJS Studio SDK:", error)
        toast.error("Failed to initialize page editor")
      }
    }

    initStudioEditor()

    return () => {
      if (editorInstanceRef.current?.destroy) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [page, pageTitle, showTemplatePicker]) // Added showTemplatePicker to dependency array

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editorInstanceRef.current) {
      toast.error("Editor not ready")
      return
    }

    setIsSaving(true)

    try {
      const editor = editorInstanceRef.current

      // Get HTML and CSS from Studio SDK
      const html = editor.getHtml?.() || ""
      const css = editor.getCss?.() || ""
      const projectData = editor.getProjectData?.() || {}

      const designJson = {
        html,
        css,
        "gjs-html": html,
        "gjs-css": css,
        projectData,
      }

      if (page?.id) {
        // Update existing page
        const result = await updateTenantPage(page.id, {
          title: pageTitle,
          slug: pageSlug,
          content: html,
          design_json: designJson,
          is_published: isPublished,
        })

        if (result.error) {
          throw new Error(result.error)
        }

        toast.success("Page updated successfully")
      } else {
        // Create new page
        const result = await createTenantPage({
          tenant_id: tenantId,
          title: pageTitle,
          slug: pageSlug,
          content: html,
          design_json: designJson,
          is_published: isPublished,
        })

        if (result.error) {
          throw new Error(result.error)
        }

        toast.success("Page created successfully")

        // Redirect to edit page with new ID
        if (result.data?.id) {
          router.push(`/${tenantSlug}/admin/pages/${result.data.id}/edit`)
        }
      }
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }, [page, pageTitle, pageSlug, isPublished, tenantId, tenantSlug, router])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
            Page Settings
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowTemplatePicker(true)} className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowAiAssistant(!showAiAssistant)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            <Label htmlFor="published" className="text-gray-600">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* GrapesJS Studio SDK Container */}
        <div ref={editorContainerRef} className="flex-1 w-full" style={{ minHeight: "calc(100vh - 57px)" }} />

        {showAiAssistant && (
          <div className="w-80 border-l bg-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAiAssistant(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-violet-300" />
                  <p className="text-sm">Ask me to create content for your page!</p>
                  <p className="text-xs mt-2 text-gray-400">Try: "Create a hero section for a church website"</p>
                </div>
              )}

              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === "user" ? "bg-violet-100 text-violet-900 ml-4" : "bg-gray-100 text-gray-900 mr-4"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("[v0] Form submitted")
                  handleAiGenerate()
                }}
                className="space-y-2"
              >
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="resize-none"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {aiLoading ? "Generating..." : "Generate"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Page Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={pageTitle}
                onChange={(e) => {
                  setPageTitle(e.target.value)
                  if (!page?.id) {
                    setPageSlug(generateSlug(e.target.value))
                  }
                }}
                placeholder="Enter page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSlug">Page Slug</Label>
              <Input
                id="pageSlug"
                value={pageSlug}
                onChange={(e) => setPageSlug(generateSlug(e.target.value))}
                placeholder="page-slug"
              />
              <p className="text-xs text-gray-500">This will be the URL path for your page</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSettingsModal(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Picker Modal */}
      <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select a template to start with, or choose "Blank Page" to start from scratch.
            </p>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {PAGE_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-violet-500 hover:shadow-md transition-all"
                onClick={() => {
                  // Load the template content into the editor
                  const editor = editorInstanceRef.current
                  if (editor && template.data?.pages?.[0]?.component) {
                    try {
                      // Clear existing content and add template
                      if (editor.DomComponents) {
                        const wrapper = editor.DomComponents.getWrapper()
                        if (wrapper) {
                          wrapper.components(template.data.pages[0].component)
                        }
                      } else if (editor.setComponents) {
                        editor.setComponents(template.data.pages[0].component)
                      }
                      toast.success(`Template "${template.name}" loaded!`)
                    } catch (err) {
                      console.error("[v0] Error loading template:", err)
                      toast.error("Failed to load template")
                    }
                  }
                  setShowTemplatePicker(false)
                }}
              >
                <div className="relative">
                  <img
                    src={template.media || "/placeholder.svg?height=150&width=300&query=page template"}
                    alt={template.name}
                    className="w-full h-32 object-cover rounded-t-lg bg-gray-100"
                  />
                </div>
                <CardContent className="p-3">
                  <h4 className="text-sm font-semibold text-center">{template.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTemplatePicker(false)}>
              Start Blank
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { GrapesJSPageEditor }
export default GrapesJSPageEditor
