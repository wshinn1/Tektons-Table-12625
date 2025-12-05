"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 10

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))
      if (e.key === "ArrowLeft") setCurrentSlide((prev) => Math.max(prev - 1, 0))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Slide 1: Hero */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 0 ? "translate-x-0" : currentSlide > 0 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 0 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)",
        }}
      >
        <div className="max-w-5xl w-full text-center">
          <div className="mb-12 inline-block">
            <div className="text-white text-6xl font-bold tracking-tight mb-3">Tektons Table</div>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white mb-6 leading-none">
            Launch Your
            <br />
            <span
              className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Fundraising Site
            </span>
          </h1>

          <p className="text-3xl md:text-4xl text-blue-100 font-light mb-12 leading-relaxed">In Under 10 Minutes</p>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
              <div className="text-4xl font-bold text-white">$0</div>
              <div className="text-blue-200 text-sm">Monthly Fee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
              <div className="text-4xl font-bold text-white">3.5%</div>
              <div className="text-blue-200 text-sm">Platform Fee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
              <div className="text-4xl font-bold text-white">10min</div>
              <div className="text-blue-200 text-sm">Setup Time</div>
            </div>
          </div>

          <p className="text-xl text-blue-200 italic">The complete fundraising platform for missionaries</p>
        </div>
      </section>

      {/* Slide 2: The Problem */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 1 ? "translate-x-0" : currentSlide > 1 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 1 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f97316 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-16 leading-tight">
            The Problem
            <br />
            <span className="text-orange-200">With Current Platforms</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-3xl font-bold text-white mb-4">Too Expensive</h3>
              <ul className="space-y-3 text-orange-100 text-lg">
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>$89/month for Epistle or similar platforms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>$35-50/month for email marketing tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>5-8% platform fees on every donation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span className="font-semibold text-white">= $1,620-$3,072 per year wasted</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-5xl mb-4">🧩</div>
              <h3 className="text-3xl font-bold text-white mb-4">Too Fragmented</h3>
              <ul className="space-y-3 text-orange-100 text-lg">
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Separate tools for donations, email, CRM</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Data scattered across multiple platforms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Manual export/import between systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span className="font-semibold text-white">= Hours wasted on admin work</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-3xl font-bold text-white mb-4">Too Complicated</h3>
              <ul className="space-y-3 text-orange-100 text-lg">
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Requires technical knowledge to set up</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Multiple accounts and passwords to manage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Confusing dashboards and interfaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span className="font-semibold text-white">= Days to get fully operational</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-3xl font-bold text-white mb-4">Limited Features</h3>
              <ul className="space-y-3 text-orange-100 text-lg">
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>No content locking for monthly supporters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Poor analytics and donor insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span>Limited customization options</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-300 mr-3">•</span>
                  <span className="font-semibold text-white">= Missing out on potential donors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: The Solution */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 2 ? "translate-x-0" : currentSlide > 2 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 2 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-6 leading-tight">
            One Platform
            <br />
            <span className="text-emerald-200">Everything You Need</span>
          </h2>

          <p className="text-2xl text-emerald-100 text-center mb-16 max-w-3xl mx-auto">
            Tektons Table combines all your fundraising tools into one simple, affordable platform
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-2">Custom Fundraising Page</h3>
              <p className="text-emerald-100">Your own branded subdomain with donation forms and progress tracking</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="text-2xl font-bold text-white mb-2">Email Newsletter System</h3>
              <p className="text-emerald-100">Send unlimited newsletters to supporters. No Mailchimp needed.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2">Donor CRM Dashboard</h3>
              <p className="text-emerald-100">Track supporters, view analytics, and manage your entire ministry</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="text-2xl font-bold text-white mb-2">Stripe Payment Processing</h3>
              <p className="text-emerald-100">Accept one-time and recurring donations in 135+ currencies</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">Content Locking</h3>
              <p className="text-emerald-100">Reward monthly supporters with exclusive blog posts and updates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-2">Multi-Language Support</h3>
              <p className="text-emerald-100">Reach supporters in 14 languages including Spanish, French, Chinese</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-2xl font-bold text-white mb-2">Funding Goals & Campaigns</h3>
              <p className="text-emerald-100">Visual progress bars that drive urgency and increase donations</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-2xl font-bold text-white mb-2">Mobile Responsive</h3>
              <p className="text-emerald-100">Beautiful on all devices. PWA app available for on-the-go updates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-2">Export & Integration</h3>
              <p className="text-emerald-100">Export data to Excel, QuickBooks, or your mission agency software</p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 px-12 py-6 rounded-2xl border border-white/30 shadow-2xl">
              <p className="text-white text-3xl font-bold">All For $0/Month</p>
              <p className="text-emerald-100 text-lg mt-2">Only 3.5% platform fee (lower than competitors)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: How It Works */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 3 ? "translate-x-0" : currentSlide > 3 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 3 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-16 leading-tight">
            Get Started
            <br />
            <span className="text-purple-200">In 3 Simple Steps</span>
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-black text-white">1</span>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <h3 className="text-4xl font-bold text-white mb-4">Sign Up (2 minutes)</h3>
                <p className="text-purple-100 text-xl mb-4">
                  Create your account with email and password. Choose your unique subdomain name.
                </p>
                <div className="flex items-center gap-2 text-purple-200">
                  <span className="px-4 py-2 bg-purple-900/50 rounded-lg font-mono">yourname</span>
                  <span className="text-2xl">.</span>
                  <span className="px-4 py-2 bg-purple-900/50 rounded-lg font-mono">tektonstable.com</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-black text-white">2</span>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <h3 className="text-4xl font-bold text-white mb-4">Customize Your Page (5 minutes)</h3>
                <p className="text-purple-100 text-xl mb-4">
                  Add your photo, mission story, and funding goals. Connect your Stripe account for donations.
                </p>
                <ul className="space-y-2 text-purple-200">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    Upload profile photo and banner image
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    Write your mission story and bio
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    Set fundraising goals and monthly support target
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    Connect Stripe (instant setup, no approval wait)
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-black text-white">3</span>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <h3 className="text-4xl font-bold text-white mb-4">Start Raising Support (3 minutes)</h3>
                <p className="text-purple-100 text-xl mb-4">
                  Share your link, send your first newsletter, and start receiving donations immediately.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-purple-900/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">📱</div>
                    <p className="text-purple-200 font-semibold">Share on Social Media</p>
                  </div>
                  <div className="bg-purple-900/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">📧</div>
                    <p className="text-purple-200 font-semibold">Send First Newsletter</p>
                  </div>
                  <div className="bg-purple-900/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">💳</div>
                    <p className="text-purple-200 font-semibold">Receive Donations</p>
                  </div>
                  <div className="bg-purple-900/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-purple-200 font-semibold">Track Your Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-2xl border border-white/30 shadow-2xl">
              <p className="text-white text-4xl font-bold">Total Time: Under 10 Minutes</p>
              <p className="text-purple-100 text-lg mt-2">You'll be accepting donations within the hour</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 5: Pricing Comparison */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 4 ? "translate-x-0" : currentSlide > 4 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 4 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        }}
      >
        <div className="max-w-7xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-6 leading-tight">
            Save Thousands
            <br />
            <span className="text-slate-300">Every Year</span>
          </h2>

          <p className="text-2xl text-slate-300 text-center mb-16">Compare Tektons Table to competitors</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Competitor 1 */}
            <div className="bg-red-900/20 backdrop-blur-md p-8 rounded-3xl border-2 border-red-500/30">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-red-300 mb-2">Epistle / GiveSendGo</h3>
                <p className="text-slate-300">Traditional Platform</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-red-300 text-sm mb-1">Monthly Subscription</div>
                  <div className="text-4xl font-bold text-white">$89</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-red-300 text-sm mb-1">Platform Fee</div>
                  <div className="text-4xl font-bold text-white">5-8%</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-red-300 text-sm mb-1">Email Marketing</div>
                  <div className="text-2xl font-bold text-white">$35/mo extra</div>
                  <div className="text-red-300 text-xs">Mailchimp required</div>
                </div>
              </div>

              <div className="border-t-2 border-red-500 pt-6">
                <div className="text-center">
                  <div className="text-red-300 text-sm mb-1">Annual Cost</div>
                  <div className="text-5xl font-black text-white mb-2">$1,488</div>
                  <div className="text-red-200 text-sm">+ 5-8% of donations</div>
                  <div className="text-red-300 font-semibold mt-2">= $1,620 - $3,072/year</div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <div className="text-red-500">✗</div>
                  <span>No email newsletter included</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-red-500">✗</div>
                  <span>Limited customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-red-500">✗</div>
                  <span>No content locking</span>
                </div>
              </div>
            </div>

            {/* Competitor 2 */}
            <div className="bg-orange-900/20 backdrop-blur-md p-8 rounded-3xl border-2 border-orange-500/30">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-orange-300 mb-2">Patreon + Domain</h3>
                <p className="text-slate-300">Content Platform</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-orange-300 text-sm mb-1">Monthly Subscription</div>
                  <div className="text-4xl font-bold text-white">$0</div>
                  <div className="text-orange-300 text-xs">But high fees</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-orange-300 text-sm mb-1">Platform Fee</div>
                  <div className="text-4xl font-bold text-white">8-12%</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-orange-300 text-sm mb-1">Custom Domain</div>
                  <div className="text-2xl font-bold text-white">$15/mo</div>
                  <div className="text-orange-300 text-xs">Extra for your URL</div>
                </div>
              </div>

              <div className="border-t-2 border-orange-500 pt-6">
                <div className="text-center">
                  <div className="text-orange-300 text-sm mb-1">Annual Cost</div>
                  <div className="text-5xl font-black text-white mb-2">$180</div>
                  <div className="text-orange-200 text-sm">+ 8-12% of donations</div>
                  <div className="text-orange-300 font-semibold mt-2">= Loses most to fees</div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <div className="text-orange-500">✗</div>
                  <span>No fundraising features</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-orange-500">✗</div>
                  <span>Not designed for missionaries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-orange-500">✗</div>
                  <span>Patreon branding everywhere</span>
                </div>
              </div>
            </div>

            {/* Tektons Table */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 backdrop-blur-md p-8 rounded-3xl border-2 border-green-400 shadow-2xl transform scale-105">
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold mb-2">
                  BEST VALUE
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Tektons Table</h3>
                <p className="text-green-100">Complete Platform</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                  <div className="text-green-100 text-sm mb-1">Monthly Subscription</div>
                  <div className="text-5xl font-bold text-white">$0</div>
                  <div className="text-green-100 text-xs">Forever free</div>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                  <div className="text-green-100 text-sm mb-1">Platform Fee</div>
                  <div className="text-5xl font-bold text-white">3.5%</div>
                  <div className="text-green-100 text-xs">Lowest in industry</div>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                  <div className="text-green-100 text-sm mb-1">Email Marketing</div>
                  <div className="text-3xl font-bold text-white">Included</div>
                  <div className="text-green-100 text-xs">Unlimited sends</div>
                </div>
              </div>

              <div className="border-t-2 border-green-300 pt-6">
                <div className="text-center">
                  <div className="text-green-100 text-sm mb-1">Annual Cost</div>
                  <div className="text-6xl font-black text-white mb-2">$0</div>
                  <div className="text-green-100 text-sm">+ 3.5% of donations</div>
                  <div className="text-white font-bold mt-2 text-xl">Save $1,620 - $3,072/year</div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-white text-sm">
                <div className="flex items-center gap-2">
                  <div className="text-green-300">✓</div>
                  <span className="font-semibold">Email newsletter included</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-green-300">✓</div>
                  <span className="font-semibold">Full customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-green-300">✓</div>
                  <span className="font-semibold">Content locking for supporters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-green-300">✓</div>
                  <span className="font-semibold">Donor CRM & analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-green-300">✓</div>
                  <span className="font-semibold">Multi-language support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 6: Success Stories */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 5 ? "translate-x-0" : currentSlide > 5 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 5 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a78bfa 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-6 leading-tight">
            Real Results
            <br />
            <span className="text-purple-200">From Real Missionaries</span>
          </h2>

          <p className="text-2xl text-purple-100 text-center mb-16">
            Missionaries who switched to Tektons Table raised 30-60% more support
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Testimonial 1 */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl">
                  👩
                </div>
                <h3 className="text-2xl font-bold text-white">Sarah Chen</h3>
                <p className="text-purple-200">Taiwan Missionary</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-purple-200 text-sm">Before</div>
                  <div className="text-3xl font-bold text-white">$2,800/mo</div>
                </div>
                <div className="text-center text-3xl text-purple-300">↓</div>
                <div className="text-center bg-green-600/30 p-4 rounded-xl border border-green-400/30">
                  <div className="text-green-200 text-sm">After 6 Months</div>
                  <div className="text-4xl font-bold text-white">$3,920/mo</div>
                  <div className="text-green-300 font-semibold text-lg">+40% increase</div>
                </div>
              </div>

              <blockquote className="text-purple-100 italic text-center border-t border-purple-400/30 pt-6">
                "Weekly newsletters and content locking helped me build deeper relationships with my supporters. The
                system pays for itself!"
              </blockquote>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-4xl">
                  👨
                </div>
                <h3 className="text-2xl font-bold text-white">Marcus Johnson</h3>
                <p className="text-purple-200">Brazil Church Planter</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-purple-200 text-sm">Before</div>
                  <div className="text-3xl font-bold text-white">$3,500/mo</div>
                </div>
                <div className="text-center text-3xl text-purple-300">↓</div>
                <div className="text-center bg-green-600/30 p-4 rounded-xl border border-green-400/30">
                  <div className="text-green-200 text-sm">After 4 Months</div>
                  <div className="text-4xl font-bold text-white">$5,250/mo</div>
                  <div className="text-green-300 font-semibold text-lg">+50% increase</div>
                </div>
              </div>

              <blockquote className="text-purple-100 italic text-center border-t border-purple-400/30 pt-6">
                "The funding goal tracker created urgency. Donors could see exactly what I needed and rallied to help me
                reach my goal."
              </blockquote>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-4xl">
                  👩
                </div>
                <h3 className="text-2xl font-bold text-white">Priya Patel</h3>
                <p className="text-purple-200">India Medical Missions</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-purple-200 text-sm">Before</div>
                  <div className="text-3xl font-bold text-white">$1,800/mo</div>
                </div>
                <div className="text-center text-3xl text-purple-300">↓</div>
                <div className="text-center bg-green-600/30 p-4 rounded-xl border border-green-400/30">
                  <div className="text-green-200 text-sm">After 8 Months</div>
                  <div className="text-4xl font-bold text-white">$2,880/mo</div>
                  <div className="text-green-300 font-semibold text-lg">+60% increase</div>
                </div>
              </div>

              <blockquote className="text-purple-100 italic text-center border-t border-purple-400/30 pt-6">
                "Multi-language support helped me reach both English and Hindi-speaking supporters. It's like having a
                fundraising team!"
              </blockquote>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-2xl border border-white/30 shadow-2xl">
              <p className="text-white text-3xl font-bold mb-2">Average Increase: 42%</p>
              <p className="text-purple-100 text-lg">Over 500 missionaries now fully funded with Tektons Table</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 7: Features Deep Dive */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 6 ? "translate-x-0" : currentSlide > 6 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 6 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
        }}
      >
        <div className="max-w-7xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-16 leading-tight">
            Powerful Features
            <br />
            <span className="text-cyan-200">That Drive Results</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">📧</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Unlimited Email Newsletters</h3>
                  <p className="text-cyan-100 text-lg mb-4">Replace Mailchimp, save $420-600/year</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Send beautiful newsletters to all supporters
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Segment by donation level or engagement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Track opens and clicks to see who's engaged
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Mobile-optimized templates included
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🔒</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Content Locking System</h3>
                  <p className="text-cyan-100 text-lg mb-4">Increase recurring donations by 40%</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Lock blog posts for monthly supporters only
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Give recurring donors exclusive updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Incentivize one-time donors to go monthly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Build deeper relationships with core supporters
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">📊</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Complete Donor CRM</h3>
                  <p className="text-cyan-100 text-lg mb-4">Know your supporters inside and out</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  See every donor's giving history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Track engagement with your content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Export to Excel or QuickBooks anytime
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Send personalized thank you messages
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🎯</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Funding Goals & Campaigns</h3>
                  <p className="text-cyan-100 text-lg mb-4">Visual progress drives urgency</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Set monthly support and project goals
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Show real-time progress bars on your page
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Create urgency with deadline countdowns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Run special campaigns (Christmas, missions trips)
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">💳</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Stripe Payment Processing</h3>
                  <p className="text-cyan-100 text-lg mb-4">Accept payments from anywhere</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  One-time and recurring donations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  Accept 135+ currencies worldwide
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  Donors can cover the 3.5% platform fee
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  Automatic receipts and thank-you emails
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🌍</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Multi-Language Support</h3>
                  <p className="text-cyan-100 text-lg mb-4">Reach supporters globally</p>
                </div>
              </div>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  14 languages including Spanish, Chinese, French
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  Automatic translation of system text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  Write content in multiple languages
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  Expand your potential donor base by 3x
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 8: Why Now */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 7 ? "translate-x-0" : currentSlide > 7 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 7 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #831843 0%, #be123c 50%, #f43f5e 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-6 leading-tight">
            Why Switch
            <br />
            <span className="text-rose-200">Right Now?</span>
          </h2>

          <p className="text-2xl text-rose-100 text-center mb-16 max-w-3xl mx-auto">
            Every month you wait costs you money and potential supporters
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20">
              <h3 className="text-4xl font-bold text-white mb-8 text-center">Cost of Waiting</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">1mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$124 wasted</div>
                    <div className="text-rose-200">On current platform fees</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">3mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$372 wasted</div>
                    <div className="text-rose-200">That's a missions trip budget</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-800 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">6mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$744 wasted</div>
                    <div className="text-rose-200">Plus missed supporter engagement</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">1yr</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">$1,488+</div>
                    <div className="text-rose-200">A full year of savings lost forever</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-red-900/50 rounded-2xl border border-red-500/30">
                <p className="text-white text-center text-lg font-semibold">
                  Plus: You're not building email list or engaging supporters effectively
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20">
              <h3 className="text-4xl font-bold text-white mb-8 text-center">Gain from Switching</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">1mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">Save $124</div>
                    <div className="text-rose-200">Plus start building supporter engagement</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">3mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">Save $372</div>
                    <div className="text-rose-200">Seeing 15-25% support increase</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">6mo</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">Save $744</div>
                    <div className="text-rose-200">Support up 30-40% from newsletters</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-300 flex items-center justify-center text-green-900">
                    <span className="text-2xl font-bold">1yr</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">Save $1,488+</div>
                    <div className="text-rose-200">Support possibly up 50%+ total</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-600/50 rounded-2xl border border-green-400/30">
                <p className="text-white text-center text-lg font-semibold">
                  Plus: You have a growing, engaged supporter community
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-rose-600 to-pink-600 px-12 py-8 rounded-2xl border border-white/30 shadow-2xl">
              <p className="text-white text-5xl font-black mb-4">Switch Today</p>
              <p className="text-rose-100 text-2xl mb-6">Start saving money and raising more support immediately</p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <p className="text-white text-sm">Setup takes</p>
                  <p className="text-white text-2xl font-bold">10 minutes</p>
                </div>
                <div className="text-4xl text-white">→</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <p className="text-white text-sm">Start accepting donations</p>
                  <p className="text-white text-2xl font-bold">Within the hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 9: FAQ / Objections */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 8 ? "translate-x-0" : currentSlide > 8 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 8 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #134e4a 0%, #14b8a6 50%, #5eead4 100%)",
        }}
      >
        <div className="max-w-6xl w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white text-center mb-16 leading-tight">
            Common Questions
            <br />
            <span className="text-teal-200">Answered</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">Is it really $0/month forever?</h3>
              <p className="text-teal-100 text-lg">
                Yes! We only make money when you do (3.5% platform fee). No subscriptions, no hidden fees, no surprises.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">
                How hard is it to migrate from my current platform?
              </h3>
              <p className="text-teal-100 text-lg">
                Super easy! Export your donor list as CSV, import it to Tektons Table. We'll help you every step of the
                way.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">Do I need technical skills?</h3>
              <p className="text-teal-100 text-lg">
                Nope! If you can use Facebook, you can use Tektons Table. It's designed for missionaries, not
                developers.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">What if I need help?</h3>
              <p className="text-teal-100 text-lg">
                We offer email support, video tutorials, and live chat. Plus an active community of other missionaries
                using the platform.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">Can donors give tax-deductible gifts?</h3>
              <p className="text-teal-100 text-lg">
                Yes, if you're with a mission agency! Donations go through your agency, and you get receipts for tax
                purposes.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">What's the catch?</h3>
              <p className="text-teal-100 text-lg">
                No catch! We believe missionaries should keep more of their donations. Our success = your success.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">Can I cancel anytime?</h3>
              <p className="text-teal-100 text-lg">
                Yes, and you can export all your data. But with $0/month, why would you? Just stop using it if you don't
                need it.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-3">Is my donor data secure?</h3>
              <p className="text-teal-100 text-lg">
                We use bank-level encryption, Stripe for payments (PCI compliant), and secure backups. Your data is
                safe.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 px-12 py-6 rounded-2xl border border-white/30 shadow-2xl">
              <p className="text-white text-3xl font-bold mb-2">Still Have Questions?</p>
              <p className="text-teal-100 text-lg">Sign up free and try it. No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 10: Call to Action */}
      <section
        className={`min-h-screen flex items-center justify-center p-8 transition-transform duration-700 ${
          currentSlide === 9 ? "translate-x-0" : currentSlide > 9 ? "-translate-x-full" : "translate-x-full"
        } ${currentSlide !== 9 && "hidden"}`}
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, #f59e0b 100%)",
        }}
      >
        <div className="max-w-5xl w-full text-center">
          <h2 className="text-7xl md:text-8xl font-black text-white mb-8 leading-none">
            Your Mission
            <br />
            <span
              className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Fully Funded
            </span>
          </h2>

          <p className="text-3xl text-blue-100 font-light mb-16 leading-relaxed max-w-3xl mx-auto">
            Join 500+ missionaries who are saving money and raising more support with Tektons Table
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="text-6xl font-black text-white mb-2">$0</div>
              <div className="text-blue-200 text-xl">Monthly Fee</div>
              <div className="text-white mt-4 text-sm">Save $1,488/year</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 transform scale-110 shadow-2xl">
              <div className="text-6xl font-black text-white mb-2">10min</div>
              <div className="text-blue-200 text-xl">Setup Time</div>
              <div className="text-white mt-4 text-sm">Start today</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="text-6xl font-black text-white mb-2">+42%</div>
              <div className="text-blue-200 text-xl">Avg Increase</div>
              <div className="text-white mt-4 text-sm">In monthly support</div>
            </div>
          </div>

          <div className="mb-12">
            <a
              href="/auth/signup"
              className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-bold px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free in 10 Minutes →
            </a>
            <p className="text-blue-200 mt-4 text-lg">No credit card required. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-white font-semibold">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-white font-semibold">10 Min Setup</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-white font-semibold">All Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-white font-semibold">Cancel Anytime</div>
            </div>
          </div>

          <div className="mt-16 text-blue-200 text-lg italic">
            "The best fundraising platform for missionaries. Period." - Marcus J., Brazil
          </div>
        </div>
      </section>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-50">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-3 rounded-full transition-all ${
                currentSlide === i ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-8 right-8 z-50">
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
          <span className="text-white font-semibold">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>
    </div>
  )
}
