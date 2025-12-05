"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, Send, TestTube, Save, Clock, LayoutTemplate } from "lucide-react"
import { createNewsletter, updateNewsletter, sendNewsletter, sendTestNewsletter } from "@/app/actions/newsletter"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import type { EditorRef, EmailEditorProps } from "react-email-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GroupSelector } from "./group-selector"
import type { SubscriberGroup } from "@/app/actions/subscriber-groups"

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

const UNLAYER_PROJECT_ID = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID

const EMAIL_TEMPLATES = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    thumbnail: "/blank-email-template.png",
    design: null,
  },
  {
    id: "simple-newsletter",
    name: "Simple Newsletter",
    description: "Clean and minimal design",
    thumbnail: "/simple-newsletter-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 1, u_content_text: 2, u_content_button: 1, u_content_image: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-1",
            cells: [1],
            columns: [
              {
                id: "col-1",
                contents: [
                  {
                    id: "content-image",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/600x200?text=Your+Logo", width: 600, height: 200 },
                      containerPadding: "20px",
                    },
                  },
                  {
                    id: "content-text-1",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center;'>Your Newsletter Title</h1>",
                      containerPadding: "10px 20px",
                    },
                  },
                  {
                    id: "content-text-2",
                    type: "text",
                    values: {
                      text: "<p>Hello,</p><p>Write your newsletter content here. Share updates, news, or any information you want your subscribers to know.</p><p>Best regards,<br>Your Team</p>",
                      containerPadding: "10px 20px",
                    },
                  },
                  {
                    id: "content-button",
                    type: "button",
                    values: {
                      text: "Learn More",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#3B82F6" },
                      containerPadding: "20px",
                      padding: "12px 24px",
                      borderRadius: "6px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f4f4f4",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Perfect for big news",
    thumbnail: "/announcement-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 2, u_content_text: 3, u_content_button: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-header",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #ffffff;'>BIG ANNOUNCEMENT</h1>",
                      containerPadding: "40px 20px",
                      backgroundColor: "#1e40af",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-body",
            cells: [1],
            columns: [
              {
                id: "col-body",
                contents: [
                  {
                    id: "content-intro",
                    type: "text",
                    values: {
                      text: "<h2 style='text-align: center;'>We Have Exciting News!</h2>",
                      containerPadding: "30px 20px 10px",
                    },
                  },
                  {
                    id: "content-body",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 16px;'>Share your announcement details here. Make it compelling and clear so your readers understand the importance of this message.</p>",
                      containerPadding: "10px 40px",
                    },
                  },
                  {
                    id: "content-cta",
                    type: "button",
                    values: {
                      text: "Learn More",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#1e40af" },
                      containerPadding: "20px",
                      padding: "14px 32px",
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "donation-thank-you",
    name: "Donation Thank You",
    description: "Thank your donors",
    thumbnail: "/thank-you-donation-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 1, u_content_text: 4, u_content_button: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-1",
            cells: [1],
            columns: [
              {
                id: "col-1",
                contents: [
                  {
                    id: "content-heart",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 48px;'>❤️</p>",
                      containerPadding: "30px 20px 10px",
                    },
                  },
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #059669;'>Thank You for Your Generosity!</h1>",
                      containerPadding: "10px 20px",
                    },
                  },
                  {
                    id: "content-message",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 16px;'>Your donation makes a real difference. Because of supporters like you, we can continue our mission and create lasting impact in our community.</p>",
                      containerPadding: "10px 40px",
                    },
                  },
                  {
                    id: "content-impact",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 14px; color: #6b7280;'>Want to see how your donation is making an impact?</p>",
                      containerPadding: "20px 20px 10px",
                    },
                  },
                  {
                    id: "content-button",
                    type: "button",
                    values: {
                      text: "View Our Impact",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#059669" },
                      containerPadding: "10px 20px 30px",
                      padding: "12px 28px",
                      borderRadius: "6px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f0fdf4",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    description: "Invite supporters to events",
    thumbnail: "/event-invitation-email.png",
    design: {
      counters: { u_column: 1, u_row: 2, u_content_text: 5, u_content_button: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-invite",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #ffffff;'>You're Invited</p>",
                      containerPadding: "40px 20px 10px",
                      backgroundColor: "#7c3aed",
                    },
                  },
                  {
                    id: "content-event-name",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #ffffff; font-size: 32px;'>Annual Charity Gala</h1>",
                      containerPadding: "0 20px 40px",
                      backgroundColor: "#7c3aed",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-details",
            cells: [1],
            columns: [
              {
                id: "col-details",
                contents: [
                  {
                    id: "content-date",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center;'><strong>📅 Date:</strong> Saturday, January 15, 2025<br><strong>🕖 Time:</strong> 7:00 PM - 10:00 PM<br><strong>📍 Location:</strong> Grand Ballroom, City Center</p>",
                      containerPadding: "30px 20px",
                    },
                  },
                  {
                    id: "content-desc",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center;'>Join us for an evening of celebration, connection, and giving back. Enjoy dinner, live entertainment, and silent auction.</p>",
                      containerPadding: "10px 40px",
                    },
                  },
                  {
                    id: "content-rsvp",
                    type: "button",
                    values: {
                      text: "RSVP Now",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#7c3aed" },
                      containerPadding: "20px",
                      padding: "14px 36px",
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#faf5ff",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "monthly-update",
    name: "Monthly Update",
    description: "Share your monthly progress",
    thumbnail: "/monthly-update-newsletter.jpg",
    design: {
      counters: { u_column: 2, u_row: 3, u_content_text: 6, u_content_divider: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-month",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280;'>Monthly Update</p><h1 style='text-align: center; margin-top: 8px;'>December 2024</h1>",
                      containerPadding: "30px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-highlights",
            cells: [1],
            columns: [
              {
                id: "col-highlights",
                contents: [
                  {
                    id: "content-highlights-title",
                    type: "text",
                    values: {
                      text: "<h2>This Month's Highlights</h2>",
                      containerPadding: "20px 20px 10px",
                    },
                  },
                  {
                    id: "content-highlights",
                    type: "text",
                    values: {
                      text: "<ul><li><strong>50 new donors</strong> joined our community</li><li>We raised <strong>$12,500</strong> for our programs</li><li>Launched our new <strong>volunteer initiative</strong></li><li>Served <strong>200+ families</strong> in need</li></ul>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                  {
                    id: "content-divider",
                    type: "divider",
                    values: {
                      containerPadding: "10px 20px",
                    },
                  },
                  {
                    id: "content-upcoming-title",
                    type: "text",
                    values: {
                      text: "<h2>What's Coming Up</h2>",
                      containerPadding: "20px 20px 10px",
                    },
                  },
                  {
                    id: "content-upcoming",
                    type: "text",
                    values: {
                      text: "<p>Next month, we're excited to launch our winter giving campaign. Stay tuned for more updates and ways you can get involved!</p>",
                      containerPadding: "0 20px 30px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  // NEW TEMPLATES
  {
    id: "prayer-update",
    name: "Prayer Update",
    description: "Share prayer requests and praise reports",
    thumbnail: "/prayer-update-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 3, u_content_text: 7 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-icon",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 40px;'>🙏</p>",
                      containerPadding: "30px 20px 10px",
                    },
                  },
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #1e3a5f;'>Prayer Update</h1><p style='text-align: center; color: #6b7280; font-size: 14px;'>December 2024</p>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-praise",
            cells: [1],
            columns: [
              {
                id: "col-praise",
                contents: [
                  {
                    id: "content-praise-title",
                    type: "text",
                    values: {
                      text: "<h2 style='color: #059669;'>✨ Praise Reports</h2>",
                      containerPadding: "20px 20px 10px",
                      backgroundColor: "#f0fdf4",
                    },
                  },
                  {
                    id: "content-praise",
                    type: "text",
                    values: {
                      text: "<ul><li>God provided for our family's needs this month</li><li>Our ministry reached 100 new families</li><li>Answered prayers for safe travels</li></ul>",
                      containerPadding: "0 20px 20px",
                      backgroundColor: "#f0fdf4",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-requests",
            cells: [1],
            columns: [
              {
                id: "col-requests",
                contents: [
                  {
                    id: "content-requests-title",
                    type: "text",
                    values: {
                      text: "<h2 style='color: #1e40af;'>🙏 Prayer Requests</h2>",
                      containerPadding: "20px 20px 10px",
                      backgroundColor: "#eff6ff",
                    },
                  },
                  {
                    id: "content-requests",
                    type: "text",
                    values: {
                      text: "<ul><li>Wisdom for upcoming decisions</li><li>Health and strength for the team</li><li>Open doors for new partnerships</li><li>Financial provision for the next quarter</li></ul>",
                      containerPadding: "0 20px 20px",
                      backgroundColor: "#eff6ff",
                    },
                  },
                  {
                    id: "content-closing",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-style: italic; color: #6b7280;'>Thank you for standing with us in prayer. Your support means more than words can express.</p>",
                      containerPadding: "20px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Georgia", value: "georgia,serif" },
        },
      },
    },
  },
  {
    id: "mission-report",
    name: "Mission Report",
    description: "Update supporters on field work",
    thumbnail: "/mission-report-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 4, u_content_text: 6, u_content_image: 2, u_content_button: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-banner",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #ffffff;'>Field Report</p><h1 style='text-align: center; color: #ffffff; margin-top: 10px;'>From the Mission Field</h1>",
                      containerPadding: "40px 20px",
                      backgroundColor: "#0f766e",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-intro",
            cells: [1],
            columns: [
              {
                id: "col-intro",
                contents: [
                  {
                    id: "content-greeting",
                    type: "text",
                    values: {
                      text: "<p>Dear Friends and Partners,</p><p>Greetings from the field! We are excited to share what God has been doing in our ministry this month.</p>",
                      containerPadding: "30px 20px 20px",
                    },
                  },
                  {
                    id: "content-image-1",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/560x300?text=Ministry+Photo", width: 560, height: 300 },
                      containerPadding: "10px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-update",
            cells: [1],
            columns: [
              {
                id: "col-update",
                contents: [
                  {
                    id: "content-update-title",
                    type: "text",
                    values: {
                      text: "<h2>Ministry Highlights</h2>",
                      containerPadding: "20px 20px 10px",
                    },
                  },
                  {
                    id: "content-update",
                    type: "text",
                    values: {
                      text: "<p>This month we had the privilege of:</p><ul><li>Training 25 local leaders</li><li>Distributing supplies to 50 families</li><li>Hosting community outreach events</li><li>Building relationships with village elders</li></ul><p>Your prayers and support make this work possible!</p>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-cta",
            cells: [1],
            columns: [
              {
                id: "col-cta",
                contents: [
                  {
                    id: "content-cta",
                    type: "button",
                    values: {
                      text: "Support This Mission",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#0f766e" },
                      containerPadding: "20px",
                      padding: "14px 32px",
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f0fdfa",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "fundraising-appeal",
    name: "Fundraising Appeal",
    description: "Donation-focused with progress",
    thumbnail: "/fundraising-appeal-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 4, u_content_text: 6, u_content_button: 2 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-urgent",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; background: #dc2626; color: white; padding: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;'>Urgent Need</p>",
                      containerPadding: "0",
                    },
                  },
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center;'>Help Us Reach Our Goal</h1>",
                      containerPadding: "30px 20px 10px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-progress",
            cells: [1],
            columns: [
              {
                id: "col-progress",
                contents: [
                  {
                    id: "content-progress",
                    type: "text",
                    values: {
                      text: "<div style='text-align: center; padding: 20px;'><p style='font-size: 48px; font-weight: bold; color: #059669; margin: 0;'>$15,000</p><p style='color: #6b7280; margin: 5px 0;'>raised of $25,000 goal</p><div style='background: #e5e7eb; border-radius: 999px; height: 20px; margin: 15px 40px;'><div style='background: #059669; border-radius: 999px; height: 20px; width: 60%;'></div></div><p style='font-size: 24px; font-weight: bold; color: #1f2937;'>60% Complete</p></div>",
                      containerPadding: "10px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-story",
            cells: [1],
            columns: [
              {
                id: "col-story",
                contents: [
                  {
                    id: "content-story",
                    type: "text",
                    values: {
                      text: "<p>Dear Friend,</p><p>We're so close to reaching our goal, but we need your help to cross the finish line. Every dollar brings us closer to making a real difference in the lives of those we serve.</p><p><strong>Here's what your gift can do:</strong></p><ul><li>$25 provides meals for a family for a week</li><li>$50 supplies educational materials</li><li>$100 funds community programs</li><li>$250 supports a month of outreach</li></ul>",
                      containerPadding: "20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-cta",
            cells: [1],
            columns: [
              {
                id: "col-cta",
                contents: [
                  {
                    id: "content-cta-primary",
                    type: "button",
                    values: {
                      text: "Donate Now",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#dc2626" },
                      containerPadding: "20px 20px 10px",
                      padding: "16px 40px",
                      borderRadius: "8px",
                    },
                  },
                  {
                    id: "content-cta-secondary",
                    type: "button",
                    values: {
                      text: "Learn More About Our Mission",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#374151", backgroundColor: "#e5e7eb" },
                      containerPadding: "0 20px 30px",
                      padding: "12px 24px",
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#fef2f2",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "welcome-email",
    name: "Welcome Email",
    description: "For new subscribers",
    thumbnail: "/welcome-email.png",
    design: {
      counters: { u_column: 1, u_row: 3, u_content_text: 5, u_content_button: 1, u_content_image: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-wave",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 60px;'>👋</p>",
                      containerPadding: "40px 20px 10px",
                    },
                  },
                  {
                    id: "content-welcome",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #1e40af;'>Welcome to Our Community!</h1>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-content",
            cells: [1],
            columns: [
              {
                id: "col-content",
                contents: [
                  {
                    id: "content-intro",
                    type: "text",
                    values: {
                      text: "<p>We're so glad you've joined us!</p><p>By subscribing, you'll be the first to know about:</p><ul><li>📰 Ministry updates and stories</li><li>🙏 Prayer requests and praise reports</li><li>📅 Upcoming events and opportunities</li><li>💝 Ways to get involved</li></ul>",
                      containerPadding: "20px 30px",
                    },
                  },
                  {
                    id: "content-next",
                    type: "text",
                    values: {
                      text: "<h3>What's Next?</h3><p>Take a moment to explore our website and learn more about our mission. We'd love to hear from you!</p>",
                      containerPadding: "10px 30px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-cta",
            cells: [1],
            columns: [
              {
                id: "col-cta",
                contents: [
                  {
                    id: "content-cta",
                    type: "button",
                    values: {
                      text: "Visit Our Website",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#1e40af" },
                      containerPadding: "10px 20px 40px",
                      padding: "14px 32px",
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#eff6ff",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "photo-gallery",
    name: "Photo Gallery",
    description: "Image-heavy layout",
    thumbnail: "/photo-gallery-email.jpg",
    design: {
      counters: { u_column: 2, u_row: 3, u_content_text: 2, u_content_image: 4 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center;'>📸 Photo Update</h1><p style='text-align: center; color: #6b7280;'>A glimpse into our recent activities</p>",
                      containerPadding: "30px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-photos-1",
            cells: [1, 1],
            columns: [
              {
                id: "col-photo-1",
                contents: [
                  {
                    id: "content-img-1",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/280x200?text=Photo+1", width: 280, height: 200 },
                      containerPadding: "10px",
                    },
                  },
                ],
              },
              {
                id: "col-photo-2",
                contents: [
                  {
                    id: "content-img-2",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/280x200?text=Photo+2", width: 280, height: 200 },
                      containerPadding: "10px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-photos-2",
            cells: [1, 1],
            columns: [
              {
                id: "col-photo-3",
                contents: [
                  {
                    id: "content-img-3",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/280x200?text=Photo+3", width: 280, height: 200 },
                      containerPadding: "10px",
                    },
                  },
                ],
              },
              {
                id: "col-photo-4",
                contents: [
                  {
                    id: "content-img-4",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/280x200?text=Photo+4", width: 280, height: 200 },
                      containerPadding: "10px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-caption",
            cells: [1],
            columns: [
              {
                id: "col-caption",
                contents: [
                  {
                    id: "content-caption",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; color: #6b7280; font-size: 14px;'>Click any photo to see more on our website</p>",
                      containerPadding: "20px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#ffffff",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Side-by-side content",
    thumbnail: "/two-column-email.jpg",
    design: {
      counters: { u_column: 2, u_row: 2, u_content_text: 5, u_content_button: 2 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center;'>This Week's Update</h1>",
                      containerPadding: "30px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-columns",
            cells: [1, 1],
            columns: [
              {
                id: "col-left",
                contents: [
                  {
                    id: "content-left-title",
                    type: "text",
                    values: {
                      text: "<h3 style='color: #1e40af;'>📰 Latest News</h3>",
                      containerPadding: "20px 20px 10px",
                      backgroundColor: "#eff6ff",
                    },
                  },
                  {
                    id: "content-left-body",
                    type: "text",
                    values: {
                      text: "<p>Stay updated with our latest developments, stories from the field, and community impact reports.</p>",
                      containerPadding: "0 20px 20px",
                      backgroundColor: "#eff6ff",
                    },
                  },
                  {
                    id: "content-left-cta",
                    type: "button",
                    values: {
                      text: "Read More",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#1e40af" },
                      containerPadding: "10px 20px 20px",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      backgroundColor: "#eff6ff",
                    },
                  },
                ],
              },
              {
                id: "col-right",
                contents: [
                  {
                    id: "content-right-title",
                    type: "text",
                    values: {
                      text: "<h3 style='color: #059669;'>📅 Upcoming Events</h3>",
                      containerPadding: "20px 20px 10px",
                      backgroundColor: "#f0fdf4",
                    },
                  },
                  {
                    id: "content-right-body",
                    type: "text",
                    values: {
                      text: "<p>Don't miss our upcoming gatherings, volunteer opportunities, and community events.</p>",
                      containerPadding: "0 20px 20px",
                      backgroundColor: "#f0fdf4",
                    },
                  },
                  {
                    id: "content-right-cta",
                    type: "button",
                    values: {
                      text: "View Events",
                      href: { url: "https://example.com" },
                      buttonColors: { color: "#FFFFFF", backgroundColor: "#059669" },
                      containerPadding: "10px 20px 20px",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      backgroundColor: "#f0fdf4",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
  {
    id: "story-testimony",
    name: "Story / Testimony",
    description: "Long-form narrative style",
    thumbnail: "/story-testimony-email.jpg",
    design: {
      counters: { u_column: 1, u_row: 4, u_content_text: 6, u_content_image: 1, u_content_divider: 1 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-label",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #9333ea;'>Featured Story</p>",
                      containerPadding: "30px 20px 10px",
                    },
                  },
                  {
                    id: "content-title",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; font-size: 28px; line-height: 1.3;'>\"How Your Support Changed My Life\"</h1>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-image",
            cells: [1],
            columns: [
              {
                id: "col-image",
                contents: [
                  {
                    id: "content-hero-image",
                    type: "image",
                    values: {
                      src: { url: "https://via.placeholder.com/560x300?text=Story+Photo", width: 560, height: 300 },
                      containerPadding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-story",
            cells: [1],
            columns: [
              {
                id: "col-story",
                contents: [
                  {
                    id: "content-story",
                    type: "text",
                    values: {
                      text: "<p style='font-size: 16px; line-height: 1.7;'><em>\"When I first came to the program, I didn't know what to expect. I was struggling, lost, and didn't see a way forward.\"</em></p><p style='font-size: 16px; line-height: 1.7;'>Maria's story is one of transformation. After years of hardship, she found hope through our community programs. With your support, she received job training, mentorship, and the resources she needed to rebuild her life.</p><p style='font-size: 16px; line-height: 1.7;'>Today, Maria has a stable job, her own apartment, and is giving back by volunteering with the same program that helped her.</p><p style='font-size: 16px; line-height: 1.7;'><em>\"I never thought I'd be in this position. Thank you to everyone who believed in me when I couldn't believe in myself.\"</em></p>",
                      containerPadding: "0 30px 20px",
                    },
                  },
                  {
                    id: "content-divider",
                    type: "divider",
                    values: {
                      containerPadding: "10px 60px",
                    },
                  },
                  {
                    id: "content-closing",
                    type: "text",
                    values: {
                      text: "<p style='text-align: center; color: #6b7280;'>Stories like Maria's are only possible because of supporters like you.</p>",
                      containerPadding: "20px 30px 30px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#faf5ff",
          contentWidth: "600px",
          fontFamily: { label: "Georgia", value: "georgia,serif" },
        },
      },
    },
  },
  {
    id: "monthly-digest",
    name: "Monthly Digest",
    description: "Summarize the month's activities",
    thumbnail: "/monthly-digest-email.png",
    design: {
      counters: { u_column: 1, u_row: 5, u_content_text: 10, u_content_divider: 3 },
      body: {
        id: "body",
        rows: [
          {
            id: "row-header",
            cells: [1],
            columns: [
              {
                id: "col-header",
                contents: [
                  {
                    id: "content-header",
                    type: "text",
                    values: {
                      text: "<h1 style='text-align: center; color: #ffffff;'>Monthly Digest</h1><p style='text-align: center; color: #e2e8f0;'>December 2024</p>",
                      containerPadding: "40px 20px",
                      backgroundColor: "#0f172a",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-stats",
            cells: [1],
            columns: [
              {
                id: "col-stats",
                contents: [
                  {
                    id: "content-stats-title",
                    type: "text",
                    values: {
                      text: "<h2>📊 By The Numbers</h2>",
                      containerPadding: "30px 20px 15px",
                    },
                  },
                  {
                    id: "content-stats",
                    type: "text",
                    values: {
                      text: "<table style='width: 100%; text-align: center;'><tr><td style='padding: 15px;'><div style='font-size: 32px; font-weight: bold; color: #0f172a;'>250</div><div style='color: #6b7280;'>People Served</div></td><td style='padding: 15px;'><div style='font-size: 32px; font-weight: bold; color: #0f172a;'>$18.5K</div><div style='color: #6b7280;'>Raised</div></td><td style='padding: 15px;'><div style='font-size: 32px; font-weight: bold; color: #0f172a;'>12</div><div style='color: #6b7280;'>Events Held</div></td></tr></table>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                  {
                    id: "content-divider-1",
                    type: "divider",
                    values: {
                      containerPadding: "10px 40px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-highlights",
            cells: [1],
            columns: [
              {
                id: "col-highlights",
                contents: [
                  {
                    id: "content-highlights-title",
                    type: "text",
                    values: {
                      text: "<h2>✨ Highlights</h2>",
                      containerPadding: "20px 20px 15px",
                    },
                  },
                  {
                    id: "content-highlights",
                    type: "text",
                    values: {
                      text: "<ul><li><strong>Community Outreach:</strong> Reached 3 new neighborhoods</li><li><strong>Volunteer Growth:</strong> 15 new volunteers joined our team</li><li><strong>Partnership:</strong> Launched collaboration with local schools</li><li><strong>Impact Story:</strong> Maria completed our job training program</li></ul>",
                      containerPadding: "0 20px 20px",
                    },
                  },
                  {
                    id: "content-divider-2",
                    type: "divider",
                    values: {
                      containerPadding: "10px 40px",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "row-upcoming",
            cells: [1],
            columns: [
              {
                id: "col-upcoming",
                contents: [
                  {
                    id: "content-upcoming-title",
                    type: "text",
                    values: {
                      text: "<h2>📅 Coming Up</h2>",
                      containerPadding: "20px 20px 15px",
                    },
                  },
                  {
                    id: "content-upcoming",
                    type: "text",
                    values: {
                      text: "<ul><li><strong>Dec 15:</strong> Holiday Giving Event</li><li><strong>Dec 20:</strong> Year-End Celebration</li><li><strong>Jan 5:</strong> New Year Kickoff Meeting</li></ul>",
                      containerPadding: "0 20px 30px",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        },
      },
    },
  },
]

export function NewsletterComposer({
  tenantId,
  newsletter,
  groups = [],
}: {
  tenantId: string
  newsletter?: any
  groups?: SubscriberGroup[]
}) {
  const router = useRouter()
  const emailEditorRef = useRef<EditorRef | null>(null)

  const [subject, setSubject] = useState(newsletter?.subject || "")
  const [previewText, setPreviewText] = useState(newsletter?.preview_text || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newsletterId, setNewsletterId] = useState<string | null>(newsletter?.id || null)
  const [testEmail, setTestEmail] = useState("")
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York")
  const [editorReady, setEditorReady] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(!newsletter) // Show on new newsletter
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [targetGroups, setTargetGroups] = useState<string[]>(newsletter?.target_groups || ["all"])

  const onReady: EmailEditorProps["onReady"] = useCallback(
    (unlayer) => {
      setEditorReady(true)

      // Load existing design if editing
      if (newsletter?.design_json) {
        try {
          const design =
            typeof newsletter.design_json === "string" ? JSON.parse(newsletter.design_json) : newsletter.design_json
          unlayer.loadDesign(design)
        } catch (e) {
          console.error("Failed to load design:", e)
        }
      }
    },
    [newsletter?.design_json],
  )

  const loadTemplate = useCallback((templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    const unlayer = emailEditorRef.current?.editor
    if (!unlayer) {
      toast.error("Editor not ready yet")
      return
    }

    if (template.design) {
      unlayer.loadDesign(template.design)
      toast.success(`Loaded "${template.name}" template`)
    } else {
      // Blank template - reset to empty
      unlayer.loadDesign({
        body: {
          rows: [],
          values: {
            backgroundColor: "#ffffff",
            contentWidth: "600px",
          },
        },
      })
    }

    setShowTemplateDialog(false)
    setSelectedTemplate(templateId)
  }, [])

  const getEditorContent = (): Promise<{ html: string; design: any }> => {
    return new Promise((resolve, reject) => {
      const unlayer = emailEditorRef.current?.editor
      if (!unlayer) {
        reject(new Error("Editor not ready"))
        return
      }

      unlayer.exportHtml((data) => {
        resolve({ html: data.html, design: data.design })
      })
    })
  }

  const handleSaveDraft = async () => {
    if (!subject) {
      toast.error("Please add a subject line")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    setIsSaving(true)
    try {
      const { html, design } = await getEditorContent()

      const result = newsletterId
        ? await updateNewsletter(newsletterId, {
            subject,
            preview_text: previewText,
            content: html,
            design_json: design,
            status: "draft",
            target_groups: targetGroups,
          })
        : await createNewsletter(tenantId, subject, previewText, html, design)

      if (!newsletterId && result.id) {
        setNewsletterId(result.id)
      }

      toast.success("Draft saved successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save draft")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!subject) {
      toast.error("Please add a subject line")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    // Save first if no ID
    if (!newsletterId) {
      await handleSaveDraft()
      if (!newsletterId) return
    }

    setIsSending(true)
    try {
      const { html, design } = await getEditorContent()

      await updateNewsletter(newsletterId!, {
        subject,
        preview_text: previewText,
        content: html,
        design_json: design,
        target_groups: targetGroups,
      })

      const result = await sendNewsletter(newsletterId!)
      toast.success(`Newsletter sent to ${result.recipients} subscribers`)
      router.push(`/admin/newsletter`)
    } catch (error) {
      toast.error("Failed to send newsletter")
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleScheduleSend = async () => {
    if (!newsletterId) {
      await handleSaveDraft()
      if (!newsletterId) return
    }

    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select a date and time")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    setIsSending(true)
    try {
      const { html, design } = await getEditorContent()
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`)

      await updateNewsletter(newsletterId, {
        subject,
        preview_text: previewText,
        content: html,
        design_json: design,
        status: "scheduled",
        scheduled_for: scheduledFor.toISOString(),
        timezone,
        target_groups: targetGroups, // Include target_groups for scheduling as well
      })

      toast.success(`Newsletter scheduled for ${scheduledFor.toLocaleString()}`)
      setShowScheduleDialog(false)
      router.push(`/admin/newsletter`)
    } catch (error) {
      toast.error("Failed to schedule newsletter")
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    setSendingTest(true)
    try {
      const { html, design } = await getEditorContent()

      let currentNewsletterId = newsletterId
      if (!currentNewsletterId) {
        const result = await createNewsletter(tenantId, subject, previewText, html, design)
        currentNewsletterId = result.id
        setNewsletterId(result.id)
      }

      const response = await sendTestNewsletter(currentNewsletterId!, testEmail)

      if (!response.ok) {
        throw new Error("Failed to send test email")
      }

      toast.success(`Test email sent to ${testEmail}`)
      setShowTestDialog(false)
      setTestEmail("")
    } catch (error) {
      toast.error("Failed to send test email")
      console.error(error)
    } finally {
      setSendingTest(false)
    }
  }

  const hasContent = editorReady && subject.trim().length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{newsletter ? "Edit Newsletter" : "Compose Newsletter"}</CardTitle>
        <CardDescription>Create beautiful email newsletters with our drag-and-drop builder</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>Start with a pre-designed template or create from scratch</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template.id)}
                  className="group text-left border rounded-lg p-3 hover:border-primary hover:bg-accent transition-colors"
                >
                  <div className="aspect-[5/3] bg-muted rounded mb-2 overflow-hidden">
                    <img
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Skip - Start Blank
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              placeholder="Your newsletter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="preview">Preview Text</Label>
            <Textarea
              id="preview"
              placeholder="Optional preview text that appears in email clients..."
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              rows={2}
            />
          </div>

          <GroupSelector groups={groups} selectedGroups={targetGroups} onChange={setTargetGroups} label="Send to" />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Email Content *</Label>
            <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)} disabled={!editorReady}>
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              minHeight={600}
              options={{
                projectId: UNLAYER_PROJECT_ID ? Number.parseInt(UNLAYER_PROJECT_ID) : undefined,
                displayMode: "email",
                features: {
                  textEditor: {
                    spellChecker: true,
                  },
                  stockImages: {
                    enabled: true,
                  },
                },
                appearance: {
                  theme: "modern_light",
                },
                tabs: {
                  content: {
                    enabled: true,
                  },
                  blocks: {
                    enabled: true,
                  },
                  body: {
                    enabled: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!hasContent}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Send Test
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Test Email</DialogTitle>
                  <DialogDescription>Send a test version of this newsletter to verify it looks good</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="test-email">Email Address</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="your@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendTest} disabled={sendingTest}>
                    {sendingTest ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Test"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSaveDraft} disabled={isSaving || !editorReady} variant="outline">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!hasContent}>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Newsletter</DialogTitle>
                  <DialogDescription>Choose when to send this newsletter to your subscribers</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Phoenix">Arizona (MST)</SelectItem>
                        <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                        <SelectItem value="Pacific/Honolulu">Hawaii Time (HST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScheduleSend} disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Send"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSend} disabled={isSending || !hasContent}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Newsletter
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
