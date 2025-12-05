'use client'

export default function MarketingStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-6 flex justify-center">
          <a
            href="/pitch-deck"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-all"
          >
            <span>📊</span>
            <span>View 3-Slide Pitch Deck</span>
          </a>
        </div>
        {/* </CHANGE> */}

        {/* Header */}
        <header className="text-center mb-16">
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-400">
              <span className="text-white font-bold text-sm">Tektons Table Logo</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tektons Table Marketing Strategy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive go-to-market plan for a free missionary fundraising platform
          </p>
          <div className="mt-6 flex gap-4 justify-center text-sm text-gray-500">
            <span className="bg-white px-4 py-2 rounded-full shadow-sm">Zero Subscription Costs</span>
            <span className="bg-white px-4 py-2 rounded-full shadow-sm">3% Platform Fee</span>
            <span className="bg-white px-4 py-2 rounded-full shadow-sm">Optional Donor Tips</span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="mb-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Tektons Table is a free, self-sustaining platform for missionaries to raise support through a modern, donor-friendly giving experience. The platform's unique value is zero subscription costs for missionaries, funded by optional donor tips and a transparent 3% fee.
          </p>
        </section>

        {/* SWOT Analysis */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">SWOT Analysis</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border-2 border-green-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  S
                </div>
                <h3 className="text-2xl font-bold text-green-900">Strengths</h3>
              </div>

              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Zero Subscription Model:</strong> Unlike competitors charging $49-200/month, completely free for missionaries
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-green-200 -mx-2 px-2 py-2 rounded">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">FREE Email Newsletter System Built-In:</strong> Includes unlimited newsletters + automated post notifications at no extra cost. Competitors charge $20-50/month separately (Mailchimp $13-299/mo, Flodesk $38/mo, Constant Contact $12-80/mo)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Lower Total Fees:</strong> 3% platform fee vs. 5-12% (Patreon) or subscription + processing fees
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Mission-Specific Features:</strong> Built for missionaries (funding goals, prayer updates, supporter content locking)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Modern Tech Stack:</strong> BlockNote editor, Stripe Connect, automated emails, mobile-first design
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Donor-Friendly Features:</strong> Optional tip model, fee coverage checkbox, easy recurring gifts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Fast Onboarding:</strong> Fundraising page live in 10 minutes vs. complex setup elsewhere
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Integrated Communication:</strong> Email newsletters + post notifications built-in (competitors charge extra)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Global Reach:</strong> 6 languages + 135 currencies via Stripe (vs. 44 in competitors)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Full CRM Dashboard:</strong> Financial tracking, supporter management, goal progress (no extra cost)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">QuickBooks Integration:</strong> Seamless accounting via Stripe, CSV exports to any system
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">+</span>
                  <div>
                    <strong className="text-green-900">Enhanced Data Privacy:</strong> Zero financial data stored on platform - all handled securely through Stripe
                  </div>
                </li>
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border-2 border-red-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  W
                </div>
                <h3 className="text-2xl font-bold text-red-900">Weaknesses</h3>
              </div>

              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">No Brand Recognition:</strong> Established players like Epistle.org, DonorElf already trusted by agencies
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">No Track Record:</strong> No case studies, testimonials, or proven results yet to show missionaries
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">Bootstrap Startup:</strong> Single founder means limited support capacity during early growth phase
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">Revenue Model Dependency:</strong> Business sustainability depends on supporter tip adoption rates
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">Competing Against Free (Initially):</strong> First month at 1.5% means platform earns half revenue from new users
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">-</span>
                  <div>
                    <strong className="text-red-900">Network Effects Disadvantage:</strong> Competitors have established communities and user ecosystems that create stickiness
                  </div>
                </li>
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border-2 border-blue-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  O
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Opportunities</h3>
              </div>

              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Underserved Market:</strong> 400,000+ Christian missionaries globally, many can't afford existing platforms
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Post-Pandemic Digital Shift:</strong> Churches/donors now comfortable with online giving (increased 45% since 2020)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Agency Partnerships:</strong> Mission agencies want cost-effective solutions for their missionaries
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">International Expansion:</strong> Spanish/Portuguese markets largely untapped for missionary fundraising tech
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">White-Label Revenue:</strong> Large agencies would pay for branded version of the platform
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Church Dashboards:</strong> Churches want to track/support all their sent missionaries in one place
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Content Creator Model:</strong> Patreon-style supporter tiers, exclusive content gaining traction in ministry
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">↑</span>
                  <div>
                    <strong className="text-blue-900">Younger Missionaries:</strong> Gen Z/Millennial missionaries expect modern, mobile-first tools
                  </div>
                </li>
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border-2 border-orange-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  T
                </div>
                <h3 className="text-2xl font-bold text-orange-900">Threats</h3>
              </div>

              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Epistle.org Dominance:</strong> Already reports $5,178 avg yearly increase for missionaries, strong testimonials
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Generic Platforms Adding Features:</strong> Givebutter, Donorbox could add mission-specific features
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Economic Downturn:</strong> Donor giving decreases in recessions, affecting platform revenue
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Stripe Fee Changes:</strong> Processing fee increases would reduce missionary take-home
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Agency In-House Solutions:</strong> Large agencies building their own donor management systems
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Platform Fatigue:</strong> Donors overwhelmed by multiple platforms, prefer consolidated giving
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Regulatory Changes:</strong> New financial regulations for payment platforms could increase compliance costs
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold mt-1">!</span>
                  <div>
                    <strong className="text-orange-900">Data Privacy Laws:</strong> GDPR, international data protection could complicate global expansion
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Competitive Positioning Summary */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Competitive Positioning</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Platform</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Pricing Model</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Total Fees</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Key Differentiator</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200 bg-green-50">
                    <td className="py-4 px-4 font-bold text-green-900">Tektons Table</td>
                    <td className="py-4 px-4">$0 subscription + 3% fee</td>
                    <td className="py-4 px-4 font-semibold text-green-700">~6% total</td>
                    <td className="py-4 px-4">Free for missionaries, mission-specific features</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Epistle.org</td>
                    <td className="py-4 px-4">Subscription (price undisclosed)</td>
                    <td className="py-4 px-4">Unknown + processing</td>
                    <td className="py-4 px-4">Established, proven $5k+ yearly increase</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">DonorElf</td>
                    <td className="py-4 px-4">Subscription-based</td>
                    <td className="py-4 px-4">Monthly fee + processing</td>
                    <td className="py-4 px-4">CRM + accounting integrations</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Donorbox</td>
                    <td className="py-4 px-4">1.75-3.95% platform fee</td>
                    <td className="py-4 px-4">~4-6% + $0.30</td>
                    <td className="py-4 px-4">11 languages, 44 currencies, nonprofit-focused</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Givebutter</td>
                    <td className="py-4 px-4">Free (tip model) or 1-5%</td>
                    <td className="py-4 px-4">~4-8% total</td>
                    <td className="py-4 px-4">Event fundraising, auctions, peer-to-peer</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Patreon</td>
                    <td className="py-4 px-4">5-12% platform fee</td>
                    <td className="py-4 px-4">~8-15% total</td>
                    <td className="py-4 px-4">Creator-focused, tier system, community features</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Tithe.ly</td>
                    <td className="py-4 px-4">$0 subscription</td>
                    <td className="py-4 px-4">2.9% + $0.30</td>
                    <td className="py-4 px-4">Church-focused, not for individual missionaries</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Planning Center</td>
                    <td className="py-4 px-4">$99/mo subscription</td>
                    <td className="py-4 px-4">2.15% + $0.30 + $99/mo</td>
                    <td className="py-4 px-4">Full church management suite, enterprise-level</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">Competitive Advantage Summary</h4>
              <p className="text-gray-700 leading-relaxed">
                Tektons Table occupies a unique position: <strong>more affordable than subscription platforms</strong> (Epistle, DonorElf, Planning Center),
                <strong> more mission-specific than general fundraising tools</strong> (Donorbox, Givebutter), and <strong>lower fees than creator platforms</strong> (Patreon).
                The primary challenge is overcoming Epistle.org's established reputation in the missionary space, which requires aggressive word-of-mouth growth
                and demonstrating comparable or better results in supporter engagement and fundraising outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Target Audience</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Primary Audience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  🎯
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Primary: Missionaries</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Demographics</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>Age: 25-55</li>
                    <li>Location: Global, English-speaking</li>
                    <li>Tech-savviness: Basic to intermediate</li>
                    <li>Income: Low to moderate</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pain Points</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>{'Can\'t afford expensive platforms ($50-200/month)'}</li>
                    <li>{'Don\'t have time for complex tech setup'}</li>
                    <li>Struggle with donor communication</li>
                    <li>Need professional presentation on budget</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Secondary Audience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  💝
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Secondary: Donors</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Demographics</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>Age: 30-70</li>
                    <li>Location: USA primarily</li>
                    <li>Tech-savviness: Basic to intermediate</li>
                    <li>Income: Middle to upper-middle class</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Motivations</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Support missionaries they know personally</li>
                    <li>Prefer transparency in giving</li>
                    <li>Like seeing impact and updates</li>
                    <li>Want easy recurring giving options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Value Proposition</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">For Missionaries</h3>
              <p className="text-xl font-medium mb-6 text-blue-100">
                "Raise support without the subscription. Share updates. Build relationships. All free."
              </p>
              <ul className="space-y-2 text-blue-50">
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">✓</span>
                  <span>Zero monthly fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">✓</span>
                  <span>Professional fundraising page in minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">✓</span>
                  <span>Email supporters automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">✓</span>
                  <span>Accept one-time and recurring donations</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">For Donors</h3>
              <p className="text-xl font-medium mb-6 text-green-100">
                "Support missionaries you love with a modern, transparent giving experience."
              </p>
              <ul className="space-y-2 text-green-50">
                <li className="flex items-start gap-2">
                  <span className="text-green-200">✓</span>
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-200">✓</span>
                  <span>Manage recurring gifts easily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-200">✓</span>
                  <span>Receive regular updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-200">✓</span>
                  <span>Access exclusive supporter content</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Go-to-Market Strategy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Go-to-Market Strategy</h2>

          <div className="space-y-8">
            {/* Phase 1 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">Phase 1</span>
                <h3 className="text-2xl font-semibold text-gray-900">Beta Launch (Months 1-2)</h3>
              </div>

              <p className="text-gray-600 mb-6">
                <strong>Goal:</strong> Validate product with 5-10 missionaries
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Network Launch</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Reach out to 1 missionary personally</li>
                    <li>Offer free setup assistance</li>
                    <li>Gather feedback intensively</li>
                    <li>Document success stories</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Facebook Groups</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Join 5-10 missionary groups</li>
                    <li>Participate genuinely for 2 weeks</li>
                    <li>Share soft launch</li>
                    <li>Offer white-glove onboarding</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Mission Agency Outreach</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Email 10-15 small agencies</li>
                    <li>Offer free onboarding</li>
                    <li>Position as helping missionaries</li>
                    <li>Ask for testimonials</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Success Metrics:</h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>5-10 active missionaries</span>
                  <span>•</span>
                  <span>$10,000+ donations processed</span>
                  <span>•</span>
                  <span>3+ testimonials</span>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold">Phase 2</span>
                <h3 className="text-2xl font-semibold text-gray-900">Organic Growth (Months 3-6)</h3>
              </div>

              <p className="text-gray-600 mb-6">
                <strong>Goal:</strong> Reach 25-50 missionaries through referrals and content
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Content Marketing</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>2 blog posts per month</li>
                    <li>SEO keywords: "free missionary fundraising"</li>
                    <li>How-to guides and templates</li>
                    <li>Success stories</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Referral Program</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Built into platform</li>
                    <li>Incentives for referrals</li>
                    <li>Shareable referral links</li>
                    <li>Track in dashboard</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Social Media</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Instagram: 3x per week</li>
                    <li>Facebook: 2x per week</li>
                    <li>Impact stories and tutorials</li>
                    <li>User-generated content</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Partnerships</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Mission agencies (YWAM, OMF, etc.)</li>
                    <li>Bible colleges with mission programs</li>
                    <li>Co-branded materials</li>
                    <li>Workshops on fundraising</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold">Phase 3</span>
                <h3 className="text-2xl font-semibold text-gray-900">Paid Growth (Months 7-12)</h3>
              </div>

              <p className="text-gray-600 mb-6">
                <strong>Goal:</strong> Scale to 100-200 missionaries with $500-1,500/month budget
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Paid Advertising</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Facebook/Instagram Ads: $300/mo</li>
                    <li>Google Ads: $200/mo</li>
                    <li>Retargeting: $100/mo</li>
                    <li>Video testimonials</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Influencer Partnerships</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Missionary bloggers (5k-50k)</li>
                    <li>Christian podcasters</li>
                    <li>YouTube channels</li>
                    <li>Affiliate partnerships</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Event Marketing</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Urbana missions conference</li>
                    <li>Regional gatherings</li>
                    <li>Workshop hosting</li>
                    <li>QR code sign-ups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Projections */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Revenue Projections</h2>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">12-Month Projection (Starting with 1 Missionary)</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Missionaries</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Donations</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Revenue (40% tip)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">1</td>
                    <td className="text-right py-3 px-4">1</td>
                    <td className="text-right py-3 px-4">$1,200</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-700">$108</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">3</td>
                    <td className="text-right py-3 px-4">5</td>
                    <td className="text-right py-3 px-4">$6,000</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-700">$540</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">6</td>
                    <td className="text-right py-3 px-4">11</td>
                    <td className="text-right py-3 px-4">$13,200</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-700">$1,188</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">9</td>
                    <td className="text-right py-3 px-4">17</td>
                    <td className="text-right py-3 px-4">$23,800</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-700">$2,142</td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-green-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">12</td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">23</td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">$35,650</td>
                    <td className="text-right py-3 px-4 font-bold text-green-700">$3,209/mo</td>
                  </tr>
                  <tr className="bg-green-100">
                    <td className="py-4 px-4 font-bold text-gray-900">Year 1 Total</td>
                    <td className="text-right py-4 px-4 font-bold text-gray-900">-</td>
                    <td className="text-right py-4 px-4 font-bold text-gray-900">$198,850</td>
                    <td className="text-right py-4 px-4 font-bold text-green-700 text-lg">$17,897</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-700">$108</div>
                <div className="text-sm text-gray-600">Month 1 Revenue</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-700">$3,209</div>
                <div className="text-sm text-gray-600">Month 12 Revenue</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-700">$38,508</div>
                <div className="text-sm text-gray-600">Year 1 Annual Revenue</div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketing Channels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Marketing Channels Priority</h2>

          <div className="space-y-6">
            {/* Tier 1 */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-500 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold">Tier 1</span>
                <h3 className="text-2xl font-semibold text-gray-900">Highest ROI - Focus Here First</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Word-of-Mouth Referrals</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: Free | ROI: Highest quality</p>
                  <p className="text-sm text-gray-600">Build referral program into product</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Facebook Groups</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: Time only | ROI: High engagement</p>
                  <p className="text-sm text-gray-600">Join 10 groups, engage authentically</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content Marketing + SEO</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: Time only | ROI: Compounds</p>
                  <p className="text-sm text-gray-600">2 blog posts per month</p>
                </div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">Tier 2</span>
                <h3 className="text-2xl font-semibold text-gray-900">Medium ROI - Add When Ready</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Marketing</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: $20-50/mo</p>
                  <p className="text-sm text-gray-600">Build lead magnet, start list</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Partnership Outreach</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: Time only</p>
                  <p className="text-sm text-gray-600">Email 20 agencies per month</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Social Media (Organic)</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: Time only</p>
                  <p className="text-sm text-gray-600">3x week Instagram, 2x week Facebook</p>
                </div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-gray-600 text-white px-4 py-2 rounded-full font-semibold">Tier 3</span>
                <h3 className="text-2xl font-semibold text-gray-900">Add After 50+ Missionaries</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Paid Ads</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: $500-1,500/mo</p>
                  <p className="text-sm text-gray-600">Start small, optimize</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Influencer Partnerships</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: $200-500 per</p>
                  <p className="text-sm text-gray-600">Targeted audience access</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Events/Conferences</h4>
                  <p className="text-sm text-gray-600 mb-2">Cost: $1,000-5,000</p>
                  <p className="text-sm text-gray-600">High-quality connections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Budget Breakdown */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Budget Breakdown</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Minimal Budget (Months 1-3)</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-gray-700">
                  <span>Domain:</span>
                  <span className="font-semibold">$12/year</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Hosting (Vercel Pro):</span>
                  <span className="font-semibold">$20-50/mo</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Email (Resend):</span>
                  <span className="font-semibold">$20/mo</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Tools:</span>
                  <span className="font-semibold">$0</span>
                </li>
                <li className="flex justify-between text-green-900 font-bold border-t border-green-300 pt-2 mt-2">
                  <span>Total (6 months):</span>
                  <span>$300-420</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Growth Budget (Months 4-6)</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-gray-700">
                  <span>Infrastructure:</span>
                  <span className="font-semibold">$70/mo</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Paid ads:</span>
                  <span className="font-semibold">$500/mo</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Tools (analytics, CRM):</span>
                  <span className="font-semibold">$50/mo</span>
                </li>
                <li className="flex justify-between text-gray-700">
                  <span>Content creation:</span>
                  <span className="font-semibold">$200/mo</span>
                </li>
                <li className="flex justify-between text-blue-900 font-bold border-t border-blue-300 pt-2 mt-2">
                  <span>Total (6 months):</span>
                  <span>~$2,500</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Win Tactics */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Win Tactics (First 30 Days)</h2>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-gray-200">
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3 flex-shrink-0">Day 1-7</span>
                <span className="text-gray-700">Onboard your first missionary personally</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3 flex-shrink-0">Day 8-14</span>
                <span className="text-gray-700">Get testimonial, create case study</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3 flex-shrink-0">Day 15-21</span>
                <span className="text-gray-700">Join 10 Facebook groups, post soft launch</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3 flex-shrink-0">Day 22-30</span>
                <span className="text-gray-700">Write first blog post, share in groups</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3 flex-shrink-0">Ongoing</span>
                <span className="text-gray-700">Email 5 mission agencies per week</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p className="mb-2 font-semibold">Tektons Table Marketing Strategy</p>
          <p className="text-sm">Free fundraising platform for missionaries worldwide</p>
          <p className="text-sm mt-4 max-w-3xl mx-auto">
            This strategy is designed to grow sustainably with minimal upfront investment, leveraging word-of-mouth and organic channels before scaling with paid strategies.
          </p>
        </footer>

        {/* Platform Expansion & Capabilities */}
        <section className="mb-16 mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Expansion & Technical Capabilities</h2>

          <div className="space-y-8">
            {/* Multi-Language Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  🌍
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Multi-Language & Currency Support</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Internationalization (i18n)</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Next.js built-in i18n support via next-intl</li>
                    <li>Auto-detect browser language preferences</li>
                    <li>Language switcher in UI</li>
                    <li>Store tenant preferred language in database</li>
                  </ul>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Priority Languages</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <span>1. English (primary)</span>
                      <span>2. Spanish (Latin America)</span>
                      <span>3. Portuguese (Brazil)</span>
                      <span>4. French (Africa)</span>
                      <span>5. Korean (major sender)</span>
                      <span>6. Chinese (emerging)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stripe Global Advantage</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li><strong>135+ currencies supported</strong> globally</li>
                    <li>Local payment methods (Alipay, iDEAL, etc.)</li>
                    <li>Automatic currency conversion</li>
                    <li>Missionaries receive funds in local currency</li>
                    <li>Donors pay in their preferred currency</li>
                  </ul>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">
                      <strong className="text-green-900">Competitive Edge:</strong> Most competitors support 44 currencies max.
                      Tektons Table can accept donations in any of 135+ currencies via Stripe, making it truly global.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CRM Dashboard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  📊
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Enhanced Tenant CRM Dashboard</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Posts Management</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Create, edit, view posts</li>
                    <li>✓ BlockNote rich editor</li>
                    <li>✓ Publish/unpublish toggle</li>
                    <li>✓ Lock content for supporters</li>
                    <li>✓ Email notification on publish</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Tracking</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Total raised (all-time)</li>
                    <li>Monthly recurring revenue</li>
                    <li>One-time vs recurring breakdown</li>
                    <li>Donor retention rate</li>
                    <li>Average donation amount</li>
                    <li>Funding goal progress</li>
                    <li>Export to CSV</li>
                    <li>Link to Stripe Dashboard</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Supporter Management</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>View all supporters</li>
                    <li>Filter by donation status</li>
                    <li>Export supporter list</li>
                    <li>View donation history</li>
                    <li>Email preferences</li>
                    <li>Engagement tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mission Agency Integrations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                  🔗
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Mission Agency Software Integrations</h3>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Available Integration Partners</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">DonorElf</h5>
                    <p className="text-xs text-gray-600">Missionary support tracking & CRM</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">Ministry Brands</h5>
                    <p className="text-xs text-gray-600">Church management suite</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">Planning Center</h5>
                    <p className="text-xs text-gray-600">Church planning & giving</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">ManagedMissions</h5>
                    <p className="text-xs text-gray-600">Mission trip management</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">Virtuous CRM</h5>
                    <p className="text-xs text-gray-600">Nonprofit CRM for ministries</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900">Salesforce Nonprofit</h5>
                    <p className="text-xs text-gray-600">Enterprise CRM solution</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4">Integration Roadmap</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">Phase 1</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">CSV Export</p>
                      <p className="text-xs text-gray-600">Missionaries can export data and import to any system manually</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">Phase 2</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Zapier Integration</p>
                      <p className="text-xs text-gray-600">Connect to 5,000+ apps automatically (includes all major mission software)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">Phase 3</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Direct API Integrations</p>
                      <p className="text-xs text-gray-600">Native connections to top 3 platforms based on user demand</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QuickBooks & Financial Integrations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  💰
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">QuickBooks & Stripe Financial Tools</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">QuickBooks Integration</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Export Stripe transactions to QuickBooks via IIF files</li>
                    <li>Automatic donation categorization</li>
                    <li>Track fees, refunds, and payouts</li>
                    <li>Sync with QuickBooks Desktop or Online</li>
                    <li>Use Stripe Marketplace accounting apps for automation</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stripe Financial Suite</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li><strong>Stripe Tax:</strong> Automatic tax calculations</li>
                    <li><strong>Stripe Billing:</strong> Subscription management</li>
                    <li><strong>Stripe Treasury:</strong> Banking-as-a-service</li>
                    <li><strong>Stripe Issuing:</strong> Virtual/physical cards</li>
                    <li><strong>Financial Dashboard:</strong> Real-time reconciliation</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-4">Benefits for Missionaries</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Missionaries can manage their entire financial workflow in one place:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>✓ Receive donations via Stripe Connect</div>
                  <div>✓ Sync to QuickBooks for tax reporting</div>
                  <div>✓ Use Stripe Treasury for expense accounts</div>
                  <div>✓ Issue cards for ministry expenses</div>
                </div>
              </div>
            </div>

            {/* Mobile App Strategy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                  📱
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Mobile App Development Roadmap</h3>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Phase 1</span>
                    <h4 className="font-semibold text-gray-900">Progressive Web App (PWA)</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h5 className="font-semibold mb-2">Features:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Fully responsive mobile design</li>
                        <li>Add to home screen capability</li>
                        <li>Offline support for viewing content</li>
                        <li>Push notifications for donations</li>
                        <li>Fast loading via service workers</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Benefits:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>No app store approval needed</li>
                        <li>Same codebase as web app</li>
                        <li>Works on iOS and Android</li>
                        <li>Instant updates without downloads</li>
                        <li>Lower development cost</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Phase 2</span>
                    <h4 className="font-semibold text-gray-900">Native Mobile App (React Native)</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h5 className="font-semibold mb-2">Missionary Features:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Post updates on-the-go</li>
                        <li>Upload photos/videos from camera roll</li>
                        <li>Real-time donation notifications</li>
                        <li>Quick analytics dashboard</li>
                        <li>Respond to supporter comments</li>
                        <li>Send newsletters from mobile</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Supporter Features:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Browse missionary updates feed</li>
                        <li>One-tap donations with saved cards</li>
                        <li>Manage recurring gifts</li>
                        <li>View giving history</li>
                        <li>Push notifications for new posts</li>
                        <li>Share updates to social media</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Technology:</strong> React Native allows code sharing between web and mobile (60-80% shared codebase),
                    reducing development time and maintenance costs while providing native performance and app store presence.
                  </p>
                </div>
              </div>
            </div>

            {/* Competitive Advantage Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">How These Features Eliminate Weaknesses</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-100 mb-3">Previously Missing:</h4>
                  <ul className="space-y-2 text-sm text-blue-50">
                    <li>❌ English/USD only</li>
                    <li>❌ No CRM dashboard</li>
                    <li>❌ No accounting integrations</li>
                    <li>❌ No mobile app</li>
                    <li>❌ Limited to domestic missionaries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-100 mb-3">Now Available:</h4>
                  <ul className="space-y-2 text-sm text-purple-50">
                    <li>✅ 6 languages + 135 currencies</li>
                    <li>✅ Full CRM with financial tracking</li>
                    <li>✅ QuickBooks + mission software integrations</li>
                    <li>✅ PWA now, native app later</li>
                    <li>✅ Global missionary support via Stripe</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-white">
                  These capabilities transform Tektons Table from a simple fundraising page into a comprehensive missionary support platform
                  that rivals enterprise solutions while maintaining zero subscription costs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Savings & Fundraising Impact */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Cost Savings & Fundraising Impact Analysis</h2>

          {/* Annual Cost Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">What Tektons Table Could Save Missionaries Annually</h3>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Cost Category</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Current Solutions</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Tektons Table</th>
                    <th className="text-center py-4 px-4 font-bold text-green-700">Annual Savings</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Fundraising Platform</td>
                    <td className="py-4 px-4 text-center">
                      <div>Epistle.org / DonorElf</div>
                      <div className="text-xs text-gray-500">~$89-149/month</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-700">$0/month</div>
                      <div className="text-xs text-green-600">Free forever</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">$1,068-1,788</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-green-50">
                    <td className="py-4 px-4 font-semibold">Email Marketing</td>
                    <td className="py-4 px-4 text-center">
                      <div>Mailchimp / Flodesk / Constant Contact</div>
                      <div className="text-xs text-gray-500">$20-50/month</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-700">$0/month</div>
                      <div className="text-xs text-green-600">Unlimited emails included</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">$240-600</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Website Builder</td>
                    <td className="py-4 px-4 text-center">
                      <div>Squarespace / Wix</div>
                      <div className="text-xs text-gray-500">$16-27/month</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-700">$0/month</div>
                      <div className="text-xs text-green-600">Subdomain + custom domain</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">$192-324</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">Payment Processing Setup</td>
                    <td className="py-4 px-4 text-center">
                      <div>PayPal / Stripe standalone</div>
                      <div className="text-xs text-gray-500">Manual setup + integration</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-700">Included</div>
                      <div className="text-xs text-green-600">One-click Stripe Connect</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">Setup time saved</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 font-semibold">CRM / Supporter Tracking</td>
                    <td className="py-4 px-4 text-center">
                      <div>Separate tools or spreadsheets</div>
                      <div className="text-xs text-gray-500">$10-30/month or manual</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-700">$0/month</div>
                      <div className="text-xs text-green-600">Built-in dashboard</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">$120-360</td>
                  </tr>
                  <tr className="bg-green-100 border-t-2 border-green-300">
                    <td className="py-4 px-4 font-bold text-gray-900">TOTAL ANNUAL SAVINGS</td>
                    <td className="py-4 px-4 text-center text-gray-500">$1,620-3,072/year</td>
                    <td className="py-4 px-4 text-center font-bold text-green-700">$0/year</td>
                    <td className="py-4 px-4 text-center font-bold text-green-700 text-xl">$1,620-3,072</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
              <h4 className="font-bold text-green-900 mb-3 text-lg">💰 Bottom Line for Missionaries:</h4>
              <p className="text-gray-700 leading-relaxed">
                By switching to Tektons Table, the average missionary saves <strong className="text-green-700">$1,620-3,072 annually</strong> in platform costs alone.
                That's equivalent to <strong>2-4 months of additional support raising potential</strong> without needing to find new donors.
              </p>
            </div>
          </div>

          {/* Fundraising Increase Potential */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Fundraising Increase Potential</h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">How Tektons Table Features Drive More Donations</h4>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">📧</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">Email Newsletter System</h5>
                      <p className="text-xs text-gray-600">Automated post notifications + standalone newsletters</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Engagement boost:</strong> Missionaries who email monthly raise 30-40% more</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Retention:</strong> Regular updates increase recurring donor retention by 25%</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Free vs paid:</strong> Eliminates $240-600/year email marketing cost</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded">
                    <p className="text-sm font-semibold text-blue-900">Potential Impact: +30-40% fundraising</p>
                  </div>
                </div>

                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎯</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">Funding Goals & Progress</h5>
                      <p className="text-xs text-gray-600">Visual progress bars motivate giving</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Urgency:</strong> Progress bars create 15-20% donation increase</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Social proof:</strong> Visible support encourages others to give</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Completion drive:</strong> Donors help "finish" campaigns near goals</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-100 rounded">
                    <p className="text-sm font-semibold text-purple-900">Potential Impact: +15-20% fundraising</p>
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🔄</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">Easy Recurring Donations</h5>
                      <p className="text-xs text-gray-600">One-click monthly/quarterly/annual setup</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Lifetime value:</strong> Recurring donors give 5-10x more over time</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Predictability:</strong> Stabilizes missionary income month-to-month</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Friction reduction:</strong> Stripe portal makes management painless</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded">
                    <p className="text-sm font-semibold text-green-900">Potential Impact: +50-100% LTV per donor</p>
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">💳</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">Fee Coverage Option</h5>
                      <p className="text-xs text-gray-600">Let donors cover Stripe processing fees</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Net increase:</strong> 40-60% of donors opt to cover fees</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Missionary benefit:</strong> Receive 100% of intended donation</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600 text-sm">▸</span>
                      <p className="text-sm text-gray-700"><strong>Donor satisfaction:</strong> Transparency builds trust</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded">
                    <p className="text-sm font-semibold text-orange-900">Potential Impact: +3% net revenue</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
              <h4 className="font-bold mb-4 text-xl">📈 Combined Fundraising Impact</h4>
              <p className="mb-4 text-blue-50">
                When missionaries leverage all Tektons Table features effectively (email newsletters, funding goals, recurring donations, fee coverage),
                data suggests they could see <strong className="text-white">30-60% increase in total donations</strong> compared to basic donation pages.
              </p>
              <p className="text-sm text-blue-100">
                Reference: Epistle.org reports average $5,178/year increase for active users. Similar engagement features in Tektons Table could yield comparable or better results.
              </p>
            </div>
          </div>

          {/* Real-World Scenarios */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Real-World Financial Scenarios</h3>

            <div className="space-y-6">
              {/* Scenario 1 */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">New Missionary: Sarah (Starting from $0)</h4>
                    <p className="text-sm text-gray-600">Just finished training, needs to raise $3,000/month support</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">With Traditional Platforms:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">❌</span>
                        <span>Epistle.org: $89/month = $1,068/year upfront</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">❌</span>
                        <span>Mailchimp: $30/month = $360/year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">❌</span>
                        <span>Website: $25/month = $300/year</span>
                      </li>
                      <li className="flex items-start gap-2 font-bold text-red-700 border-t border-gray-300 pt-2 mt-2">
                        <span>Total:</span>
                        <span>$1,728/year in platform costs</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">With Tektons Table:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Platform: $0/month = $0/year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Email newsletters: $0/month = $0/year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Website + CRM: $0/month = $0/year</span>
                      </li>
                      <li className="flex items-start gap-2 font-bold text-green-700 border-t border-gray-300 pt-2 mt-2">
                        <span>Total:</span>
                        <span>$0/year in platform costs</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-2 border-green-400">
                  <p className="font-bold text-green-900 mb-2">Sarah's Benefit:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>💰 <strong>Saves $1,728/year</strong> - Can focus 100% on raising support, not paying platforms</li>
                    <li>📈 <strong>Potential 40% fundraising boost</strong> from email engagement ($14,400 extra/year at goal)</li>
                    <li>⏱️ <strong>Time saved:</strong> No manual email list management, automated donor notifications</li>
                  </ul>
                </div>
              </div>

              {/* Scenario 2 */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-lg flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Established Missionary: John (Currently at 80% funded)</h4>
                    <p className="text-sm text-gray-600">Raising $4,000/month, currently receiving $3,200/month, needs $800 more</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Current Situation:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Using DonorElf: $129/month</li>
                      <li>Using Constant Contact: $45/month</li>
                      <li>Manual website updates: 5 hours/month</li>
                      <li className="font-bold text-red-700 border-t border-gray-300 pt-2 mt-2">
                        Spending: $2,088/year + 60 hours labor
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">After Switching to Tektons Table:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Platform cost: $0/month</li>
                      <li>Email system: $0/month (included)</li>
                      <li>Automated posts: 1 hour/month</li>
                      <li className="font-bold text-green-700 border-t border-gray-300 pt-2 mt-2">
                        Spending: $0/year + 12 hours labor
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-2 border-purple-400">
                  <p className="font-bold text-purple-900 mb-2">John's Benefit:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>💰 <strong>Saves $2,088/year</strong> in platform costs (equivalent to finding 2 new $87/month donors)</li>
                    <li>⏱️ <strong>Saves 48 hours/year</strong> - Can spend on donor relationship building instead</li>
                    <li>📊 <strong>Funding goal feature:</strong> Transparently shows $800/month gap, motivates donors to close it</li>
                    <li>📈 <strong>Email engagement boost:</strong> Regular newsletters could add $500-800/month in new/increased gifts</li>
                  </ul>
                </div>
              </div>

              {/* Scenario 3 */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-lg flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Missionary Family: The Johnsons (Fully funded, maintaining support)</h4>
                    <p className="text-sm text-gray-600">Raising $6,000/month, have 120 regular supporters, want better engagement</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Current Challenges:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Paying $149/month for premium platform</li>
                      <li>Paying $50/month for email (1,000+ contacts)</li>
                      <li>Losing ~10% donors/year (attrition)</li>
                      <li>No locked content for engaged supporters</li>
                      <li className="font-bold text-red-700 border-t border-gray-300 pt-2 mt-2">
                        Cost: $2,388/year + $7,200 lost from attrition
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">With Tektons Table Premium Features:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Platform: $0/month</li>
                      <li>Unlimited email: $0/month (included)</li>
                      <li>Locked supporter content reduces attrition</li>
                      <li>Better engagement = more referrals</li>
                      <li className="font-bold text-green-700 border-t border-gray-300 pt-2 mt-2">
                        Cost: $0/year + reduced attrition
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-2 border-blue-400">
                  <p className="font-bold text-blue-900 mb-2">The Johnsons' Benefit:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>💰 <strong>Saves $2,388/year</strong> in platform + email costs</li>
                    <li>📉 <strong>Reduces donor attrition:</strong> Locked content + regular updates could cut losses from 10% to 5% = $3,600/year saved</li>
                    <li>🎁 <strong>Supporter tiers:</strong> Exclusive content for $100+/month donors increases loyalty and referrals</li>
                    <li>📧 <strong>Email automation:</strong> Post notifications mean supporters never miss updates, improving engagement 25%+</li>
                    <li className="font-bold text-green-700 mt-2 pt-2 border-t border-gray-300">
                      Total Annual Benefit: <span className="text-lg">$5,988+ saved/retained</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-lg shadow-xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-6 text-center">Complete Value Proposition</h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">$1,620-3,072</div>
                <div className="text-sm text-green-100">Annual Cost Savings</div>
                <div className="text-xs text-green-200 mt-2">vs. paying for multiple platforms</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">30-60%</div>
                <div className="text-sm text-blue-100">Fundraising Increase Potential</div>
                <div className="text-xs text-blue-200 mt-2">from engagement features</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">48+ hrs</div>
                <div className="text-sm text-purple-100">Time Saved Annually</div>
                <div className="text-xs text-purple-200 mt-2">automation + consolidation</div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-lg p-6">
              <h4 className="font-bold text-xl mb-4 text-center">Example: New Missionary Raising $3,000/month</h4>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold mb-3 text-green-100">Year 1 Savings:</h5>
                  <ul className="space-y-2">
                    <li>Platform costs saved: <strong>$1,728</strong></li>
                    <li>Time saved (value @$20/hr): <strong>$960</strong></li>
                    <li>Setup/learning time saved: <strong>$400</strong></li>
                  </ul>
                  <div className="font-bold mt-3 pt-3 border-t border-white/30">
                    Total Saved: <span className="text-lg text-green-200">$3,088</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-3 text-blue-100">Year 1 Revenue Increase:</h5>
                  <ul className="space-y-2">
                    <li>Email engagement (+35%): <strong>$12,600</strong></li>
                    <li>Funding goal motivation (+15%): <strong>$5,400</strong></li>
                    <li>Fee coverage adoption: <strong>$1,080</strong></li>
                  </ul>
                  <div className="font-bold mt-3 pt-3 border-t border-white/30">
                    Total Increase: <span className="text-lg text-blue-200">$19,080</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/30 text-center">
                <p className="text-2xl font-bold mb-2">
                  Total Financial Benefit: <span className="text-yellow-200">$22,168</span> in Year 1
                </p>
                <p className="text-sm text-white/80">
                  That's equivalent to finding <strong>7 new $264/month donors</strong> without any additional outreach effort
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pitch Deck */}
        <section className="mb-16 mt-16 pt-16 border-t-4 border-blue-600">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">3-Slide Pitch Deck</h2>
            <p className="text-gray-600">A concise overview for investors and partners</p>
          </div>

          <div className="space-y-8">
            {/* Slide 1 - Problem & Solution */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-orange-200 mb-4">SLIDE 1 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">The Problem</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">$1,620-3,072</div>
                    <p className="text-xl text-orange-100">What missionaries currently pay annually for fundraising platforms + email marketing + websites</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">400,000+</div>
                    <p className="text-xl text-orange-100">Christian missionaries globally who need affordable fundraising solutions</p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold mb-4">Current Landscape:</h4>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Epistle.org / DonorElf charge $89-149/month subscriptions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Email marketing (Mailchimp/Flodesk) adds $20-50/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Website builders cost another $16-27/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Total: Missionaries lose 2-4 months of potential support to platform costs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 mt-8">
                <h4 className="text-3xl font-bold mb-4">The Solution: Tektons Table</h4>
                <p className="text-2xl mb-6">Zero subscription. Everything included. Self-sustaining from day one.</p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm">Monthly subscription</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">3%</div>
                    <div className="text-sm">Platform fee (vs 5-12% elsewhere)</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">Free</div>
                    <div className="text-sm">Email newsletters included</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 - Market & Business Model */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-4">SLIDE 2 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Market Opportunity & Business Model</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Target Market</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="font-semibold">400,000+ missionaries globally</div>
                          <div className="text-sm text-blue-200">English-speaking initially</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="font-semibold">$1,200-2,000/month average</div>
                          <div className="text-sm text-blue-200">Per missionary fundraising</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <div className="font-semibold">Growing digital adoption</div>
                          <div className="text-sm text-blue-200">45% increase since 2020</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Revenue Model</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-lg mb-2">3% Platform Fee</div>
                        <div className="text-sm text-blue-200">On all donations processed</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Optional Donor Tips</div>
                        <div className="text-sm text-blue-200">10-20% preselected, 40-60% adoption rate expected</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Fee Coverage</div>
                        <div className="text-sm text-blue-200">Donors can cover Stripe's 2.9% + $0.30</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8">
                  <h4 className="text-2xl font-bold mb-4">12-Month Revenue Projection</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-center mb-4">
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 1</div>
                      <div className="text-3xl font-bold">$108</div>
                      <div className="text-xs text-blue-300">1 missionary</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 6</div>
                      <div className="text-3xl font-bold">$1,188</div>
                      <div className="text-xs text-blue-300">11 missionaries</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 12</div>
                      <div className="text-3xl font-bold">$3,209</div>
                      <div className="text-xs text-blue-300">23 missionaries</div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-lg p-2">
                      <div className="text-sm text-yellow-200 mb-1">Year 1 Total</div>
                      <div className="text-3xl font-bold text-yellow-300">$17,897</div>
                      <div className="text-xs text-yellow-200">$38k annual run rate</div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-blue-200">
                    Self-sustaining from Month 1. No fundraising required. Profitable by Month 6.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-green-300">$200k</div>
                  <div className="text-sm text-green-200">Monthly donation volume</div>
                </div>
                <div className="bg-blue-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-blue-300">200+</div>
                  <div className="text-sm text-blue-200">Active missionaries</div>
                </div>
                <div className="bg-purple-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-purple-300">$15k</div>
                  <div className="text-sm text-purple-200">Monthly platform revenue</div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Competitive Advantage */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-green-200 mb-4">SLIDE 3 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Why We Win</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-2xl font-bold mb-6">Unique Advantages</h4>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🆓 Zero Subscription Model</div>
                        <p className="text-sm text-green-100">Only platform that's completely free for missionaries. Competitors charge $49-200/month.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">📧 Free Email Marketing</div>
                        <p className="text-sm text-green-100">Unlimited newsletters included. Saves missionaries $240-600/year vs Mailchimp/Flodesk.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🌍 Global from Day 1</div>
                        <p className="text-sm text-green-100">6 languages + 135 currencies via Stripe. Competitors support 44 max.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🎯 Mission-Specific Features</div>
                        <p className="text-sm text-green-100">Funding goals, prayer updates, supporter content locking, CRM dashboard.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold mb-6">Competitive Position</h4>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/30">
                            <th className="text-left py-2">Platform</th>
                            <th className="text-center py-2">Cost/Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Epistle.org</td>
                            <td className="text-center py-2">$1,068+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">DonorElf</td>
                            <td className="text-center py-2">$1,548+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Patreon</td>
                            <td className="text-center py-2">5-12% fees</td>
                          </tr>
                          <tr className="bg-yellow-500/20">
                            <td className="py-2 font-bold">Tektons Table</td>
                            <td className="text-center py-2 font-bold text-yellow-300">$0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                      <div className="font-bold text-xl mb-2">🔒 Enhanced Data Privacy</div>
                      <p className="text-sm text-green-100">Zero financial data stored. Everything through Stripe's bank-level security.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="font-bold text-xl mb-2">📱 Mobile App Roadmap</div>
                      <p className="text-sm text-green-100">PWA launching Day 1, native React Native app in Phase 2.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8">
                <h4 className="text-3xl font-bold mb-4">The Ask</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm mb-2">Funding Need</div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm text-orange-100">Self-sustaining from launch</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Build Timeline</div>
                    <div className="text-4xl font-bold mb-2">2-3 days</div>
                    <div className="text-sm text-orange-100">MVP to production</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Partnership Opportunity</div>
                    <div className="text-2xl font-bold mb-2">Mission Agencies</div>
                    <div className="text-sm text-orange-100">White-label & integrations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pitch Deck - USER FOCUSED */}
        <section className="mb-16 mt-16 pt-16 border-t-4 border-blue-600">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Missionaries Choose Tektons Table</h2>
            <p className="text-xl text-gray-600">See how much you can save and raise</p>
          </div>

          <div className="space-y-8">
            {/* Slide 1 - What We Do For You */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-4">YOUR COMPLETE FUNDRAISING SOLUTION</div>
                <h3 className="text-5xl font-bold mb-8">Everything You Need to Raise Support</h3>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📱</div>
                    <h4 className="font-bold text-xl mb-3">Your Fundraising Page</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Beautiful custom subdomain</li>
                      <li>✓ Live in 10 minutes</li>
                      <li>✓ Mobile-optimized</li>
                      <li>✓ Accept one-time & recurring gifts</li>
                      <li>✓ Funding goal tracker</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📧</div>
                    <h4 className="font-bold text-xl mb-3">Email Newsletters</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Unlimited newsletters</li>
                      <li>✓ Auto-notify supporters on posts</li>
                      <li>✓ Beautiful templates</li>
                      <li>✓ No Mailchimp needed</li>
                      <li>✓ Saves $240-600/year</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="font-bold text-xl mb-3">CRM Dashboard</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Track all supporters</li>
                      <li>✓ View donation history</li>
                      <li>✓ Financial reports</li>
                      <li>✓ Goal progress tracking</li>
                      <li>✓ Export to QuickBooks</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                  <h4 className="text-2xl font-bold mb-4">Plus Mission-Specific Features:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Locked Content:</strong> Reward supporters with exclusive updates
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Rich Editor:</strong> Add photos, videos, prayer requests easily
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Global Payments:</strong> 135 currencies via Stripe
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Mobile App:</strong> Update on-the-go (coming soon)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-8 mt-8 text-center">
                <div className="text-6xl font-bold mb-2">$0/month</div>
                <p className="text-2xl mb-4">Forever. No catch. Completely free for missionaries.</p>
                <p className="text-sm text-green-100">Sustained by optional donor tips (you never pay a subscription)</p>
              </div>
            </div>

            {/* Slide 2 - Cost Savings */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-green-200 mb-4">WHAT YOU'LL SAVE ANNUALLY</div>
                <h3 className="text-5xl font-bold mb-8">Stop Paying Platforms. Keep More Support.</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                    <h4 className="text-3xl font-bold mb-6 text-red-300">What Others Charge:</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Epistle.org / DonorElf</span>
                        <span className="font-bold text-xl">$1,068-1,788/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Mailchimp / Flodesk</span>
                        <span className="font-bold text-xl">$240-600/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Website (Squarespace)</span>
                        <span className="font-bold text-xl">$192-324/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>CRM / Supporter Tools</span>
                        <span className="font-bold text-xl">$120-360/yr</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 text-2xl">
                        <span className="font-bold">TOTAL COST:</span>
                        <span className="font-bold text-red-300">$1,620-3,072/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                    <h4 className="text-3xl font-bold mb-6 text-green-300">What Tektons Table Costs:</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Platform subscription</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Email newsletters (unlimited)</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Website + subdomain</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>CRM dashboard</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 text-2xl">
                        <span className="font-bold">TOTAL COST:</span>
                        <span className="font-bold text-green-300 text-4xl">$0/yr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/20 backdrop-blur rounded-xl p-8 text-center">
                  <p className="text-2xl mb-4">That's <span className="text-5xl font-bold text-yellow-300">$1,620-3,072</span> more for your ministry</p>
                  <p className="text-lg text-yellow-100">Equivalent to finding 2-4 new $85/month donors without any extra work</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">Only Pay:</div>
                  <div className="text-4xl font-bold mb-2">3%</div>
                  <div className="text-sm text-green-100">Per donation (vs 5-12% elsewhere)</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">Donors Can:</div>
                  <div className="text-4xl font-bold mb-2">Cover Fees</div>
                  <div className="text-sm text-green-100">Optional Stripe fee coverage checkbox</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">You Receive:</div>
                  <div className="text-4xl font-bold mb-2">97%+</div>
                  <div className="text-sm text-green-100">Of every donation (if fees covered: 100%)</div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Fundraising Increase Potential */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-purple-200 mb-4">RAISE MORE SUPPORT</div>
                <h3 className="text-5xl font-bold mb-8">Increase Your Fundraising 30-60%</h3>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold mb-6">How Tektons Table Helps You Raise More:</h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-blue-500 rounded-full p-3 text-3xl flex-shrink-0">📧</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Regular Email Updates</h5>
                          <p className="text-sm text-blue-100 mb-2">Missionaries who email monthly raise <strong className="text-white">30-40% more</strong></p>
                          <p className="text-xs text-blue-200">Source: Industry fundraising data</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-green-500 rounded-full p-3 text-3xl flex-shrink-0">🎯</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Visible Funding Goals</h5>
                          <p className="text-sm text-green-100 mb-2">Progress bars create <strong className="text-white">15-20% donation boost</strong></p>
                          <p className="text-xs text-green-200">Donors motivated to help you reach your goal</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-purple-500 rounded-full p-3 text-3xl flex-shrink-0">🔄</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Easy Recurring Gifts</h5>
                          <p className="text-sm text-purple-100 mb-2">Monthly donors give <strong className="text-white">5-10x more</strong> over time</p>
                          <p className="text-xs text-purple-200">One-click setup increases commitment</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-orange-500 rounded-full p-3 text-3xl flex-shrink-0">🔒</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Exclusive Content</h5>
                          <p className="text-sm text-orange-100 mb-2">Supporter-only posts <strong className="text-white">reduce donor churn 25%</strong></p>
                          <p className="text-xs text-orange-200">Make donors feel valued and connected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: New Missionary</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Goal:</span>
                        <span className="font-bold">$3,000/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>With email engagement:</span>
                        <span className="font-bold text-cyan-200">+$1,050/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>With funding goal:</span>
                        <span className="font-bold text-cyan-200">+$450/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-cyan-300 text-xl">$4,500/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-100 mt-4">That's $18,000 extra per year!</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: Established Missionary</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Current:</span>
                        <span className="font-bold">$3,200/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Better retention:</span>
                        <span className="font-bold text-emerald-200">+$400/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>More recurring:</span>
                        <span className="font-bold text-emerald-200">+$600/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-emerald-300 text-xl">$4,200/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-100 mt-4">That's $12,000 extra per year!</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: Missionary Family</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Current:</span>
                        <span className="font-bold">$6,000/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Engagement features:</span>
                        <span className="font-bold text-fuchsia-200">+$2,400/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Less attrition:</span>
                        <span className="font-bold text-fuchsia-200">+$600/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-fuchsia-300 text-xl">$9,000/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-fuchsia-100 mt-4">That's $36,000 extra per year!</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8 mt-8">
                <div className="text-center">
                  <p className="text-2xl mb-4">Combined Benefit: Save Money + Raise More</p>
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div>
                      <div className="text-sm text-orange-100 mb-1">Annual Savings</div>
                      <div className="text-5xl font-bold">$1,620-3,072</div>
                    </div>
                    <div className="text-6xl">+</div>
                    <div>
                      <div className="text-sm text-orange-100 mb-1">Fundraising Increase</div>
                      <div className="text-5xl font-bold">30-60%</div>
                    </div>
                  </div>
                  <p className="text-xl text-orange-50">= More resources for your mission field</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 mt-16 pt-16 border-t-4 border-blue-600">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">3-Slide Pitch Deck</h2>
            <p className="text-gray-600">A concise overview for investors and partners</p>
          </div>

          <div className="space-y-8">
            {/* Slide 1 - Problem & Solution */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-orange-200 mb-4">SLIDE 1 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">The Problem</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">$1,620-3,072</div>
                    <p className="text-xl text-orange-100">What missionaries currently pay annually for fundraising platforms + email marketing + websites</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">400,000+</div>
                    <p className="text-xl text-orange-100">Christian missionaries globally who need affordable fundraising solutions</p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold mb-4">Current Landscape:</h4>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Epistle.org / DonorElf charge $89-149/month subscriptions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Email marketing (Mailchimp/Flodesk) adds $20-50/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Website builders cost another $16-27/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Total: Missionaries lose 2-4 months of potential support to platform costs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 mt-8">
                <h4 className="text-3xl font-bold mb-4">The Solution: Tektons Table</h4>
                <p className="text-2xl mb-6">Zero subscription. Everything included. Self-sustaining from day one.</p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm">Monthly subscription</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">3%</div>
                    <div className="text-sm">Platform fee (vs 5-12% elsewhere)</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">Free</div>
                    <div className="text-sm">Email newsletters included</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 - Market & Business Model */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-4">SLIDE 2 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Market Opportunity & Business Model</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Target Market</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="font-semibold">400,000+ missionaries globally</div>
                          <div className="text-sm text-blue-200">English-speaking initially</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="font-semibold">$1,200-2,000/month average</div>
                          <div className="text-sm text-blue-200">Per missionary fundraising</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <div className="font-semibold">Growing digital adoption</div>
                          <div className="text-sm text-blue-200">45% increase since 2020</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Revenue Model</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-lg mb-2">3% Platform Fee</div>
                        <div className="text-sm text-blue-200">On all donations processed</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Optional Donor Tips</div>
                        <div className="text-sm text-blue-200">10-20% preselected, 40-60% adoption rate expected</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Fee Coverage</div>
                        <div className="text-sm text-blue-200">Donors can cover Stripe's 2.9% + $0.30</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8">
                  <h4 className="text-2xl font-bold mb-4">12-Month Revenue Projection</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-center mb-4">
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 1</div>
                      <div className="text-3xl font-bold">$108</div>
                      <div className="text-xs text-blue-300">1 missionary</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 6</div>
                      <div className="text-3xl font-bold">$1,188</div>
                      <div className="text-xs text-blue-300">11 missionaries</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 12</div>
                      <div className="text-3xl font-bold">$3,209</div>
                      <div className="text-xs text-blue-300">23 missionaries</div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-lg p-2">
                      <div className="text-sm text-yellow-200 mb-1">Year 1 Total</div>
                      <div className="text-3xl font-bold text-yellow-300">$17,897</div>
                      <div className="text-xs text-yellow-200">$38k annual run rate</div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-blue-200">
                    Self-sustaining from Month 1. No fundraising required. Profitable by Month 6.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-green-300">$200k</div>
                  <div className="text-sm text-green-200">Monthly donation volume</div>
                </div>
                <div className="bg-blue-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-blue-300">200+</div>
                  <div className="text-sm text-blue-200">Active missionaries</div>
                </div>
                <div className="bg-purple-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-purple-300">$15k</div>
                  <div className="text-sm text-purple-200">Monthly platform revenue</div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Competitive Advantage */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-green-200 mb-4">SLIDE 3 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Why We Win</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-2xl font-bold mb-6">Unique Advantages</h4>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🆓 Zero Subscription Model</div>
                        <p className="text-sm text-green-100">Only platform that's completely free for missionaries. Competitors charge $49-200/month.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">📧 Free Email Marketing</div>
                        <p className="text-sm text-green-100">Unlimited newsletters included. Saves missionaries $240-600/year vs Mailchimp/Flodesk.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🌍 Global from Day 1</div>
                        <p className="text-sm text-green-100">6 languages + 135 currencies via Stripe. Competitors support 44 max.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🎯 Mission-Specific Features</div>
                        <p className="text-sm text-green-100">Funding goals, prayer updates, supporter content locking, CRM dashboard.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold mb-6">Competitive Position</h4>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/30">
                            <th className="text-left py-2">Platform</th>
                            <th className="text-center py-2">Cost/Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Epistle.org</td>
                            <td className="text-center py-2">$1,068+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">DonorElf</td>
                            <td className="text-center py-2">$1,548+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Patreon</td>
                            <td className="text-center py-2">5-12% fees</td>
                          </tr>
                          <tr className="bg-yellow-500/20">
                            <td className="py-2 font-bold">Tektons Table</td>
                            <td className="text-center py-2 font-bold text-yellow-300">$0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                      <div className="font-bold text-xl mb-2">🔒 Enhanced Data Privacy</div>
                      <p className="text-sm text-green-100">Zero financial data stored. Everything through Stripe's bank-level security.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="font-bold text-xl mb-2">📱 Mobile App Roadmap</div>
                      <p className="text-sm text-green-100">PWA launching Day 1, native React Native app in Phase 2.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8">
                <h4 className="text-3xl font-bold mb-4">The Ask</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm mb-2">Funding Need</div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm text-orange-100">Self-sustaining from launch</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Build Timeline</div>
                    <div className="text-4xl font-bold mb-2">2-3 days</div>
                    <div className="text-sm text-orange-100">MVP to production</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Partnership Opportunity</div>
                    <div className="text-2xl font-bold mb-2">Mission Agencies</div>
                    <div className="text-sm text-orange-100">White-label & integrations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pitch Deck - USER FOCUSED */}
        <section className="mb-16 mt-16 pt-16 border-t-4 border-blue-600">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Missionaries Choose Tektons Table</h2>
            <p className="text-xl text-gray-600">See how much you can save and raise</p>
          </div>

          <div className="space-y-8">
            {/* Slide 1 - What We Do For You */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-4">YOUR COMPLETE FUNDRAISING SOLUTION</div>
                <h3 className="text-5xl font-bold mb-8">Everything You Need to Raise Support</h3>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📱</div>
                    <h4 className="font-bold text-xl mb-3">Your Fundraising Page</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Beautiful custom subdomain</li>
                      <li>✓ Live in 10 minutes</li>
                      <li>✓ Mobile-optimized</li>
                      <li>✓ Accept one-time & recurring gifts</li>
                      <li>✓ Funding goal tracker</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📧</div>
                    <h4 className="font-bold text-xl mb-3">Email Newsletters</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Unlimited newsletters</li>
                      <li>✓ Auto-notify supporters on posts</li>
                      <li>✓ Beautiful templates</li>
                      <li>✓ No Mailchimp needed</li>
                      <li>✓ Saves $240-600/year</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="font-bold text-xl mb-3">CRM Dashboard</h4>
                    <ul className="text-sm text-blue-100 space-y-2">
                      <li>✓ Track all supporters</li>
                      <li>✓ View donation history</li>
                      <li>✓ Financial reports</li>
                      <li>✓ Goal progress tracking</li>
                      <li>✓ Export to QuickBooks</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                  <h4 className="text-2xl font-bold mb-4">Plus Mission-Specific Features:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Locked Content:</strong> Reward supporters with exclusive updates
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Rich Editor:</strong> Add photos, videos, prayer requests easily
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Global Payments:</strong> 135 currencies via Stripe
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <strong>Mobile App:</strong> Update on-the-go (coming soon)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-8 mt-8 text-center">
                <div className="text-6xl font-bold mb-2">$0/month</div>
                <p className="text-2xl mb-4">Forever. No catch. Completely free for missionaries.</p>
                <p className="text-sm text-green-100">Sustained by optional donor tips (you never pay a subscription)</p>
              </div>
            </div>

            {/* Slide 2 - Cost Savings */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-green-200 mb-4">WHAT YOU'LL SAVE ANNUALLY</div>
                <h3 className="text-5xl font-bold mb-8">Stop Paying Platforms. Keep More Support.</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                    <h4 className="text-3xl font-bold mb-6 text-red-300">What Others Charge:</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Epistle.org / DonorElf</span>
                        <span className="font-bold text-xl">$1,068-1,788/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Mailchimp / Flodesk</span>
                        <span className="font-bold text-xl">$240-600/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Website (Squarespace)</span>
                        <span className="font-bold text-xl">$192-324/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>CRM / Supporter Tools</span>
                        <span className="font-bold text-xl">$120-360/yr</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 text-2xl">
                        <span className="font-bold">TOTAL COST:</span>
                        <span className="font-bold text-red-300">$1,620-3,072/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                    <h4 className="text-3xl font-bold mb-6 text-green-300">What Tektons Table Costs:</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Platform subscription</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Email newsletters (unlimited)</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>Website + subdomain</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                        <span>CRM dashboard</span>
                        <span className="font-bold text-xl text-green-300">$0/yr</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 text-2xl">
                        <span className="font-bold">TOTAL COST:</span>
                        <span className="font-bold text-green-300 text-4xl">$0/yr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/20 backdrop-blur rounded-xl p-8 text-center">
                  <p className="text-2xl mb-4">That's <span className="text-5xl font-bold text-yellow-300">$1,620-3,072</span> more for your ministry</p>
                  <p className="text-lg text-yellow-100">Equivalent to finding 2-4 new $85/month donors without any extra work</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">Only Pay:</div>
                  <div className="text-4xl font-bold mb-2">3%</div>
                  <div className="text-sm text-green-100">Per donation (vs 5-12% elsewhere)</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">Donors Can:</div>
                  <div className="text-4xl font-bold mb-2">Cover Fees</div>
                  <div className="text-sm text-green-100">Optional Stripe fee coverage checkbox</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                  <div className="text-sm text-green-200 mb-2">You Receive:</div>
                  <div className="text-4xl font-bold mb-2">97%+</div>
                  <div className="text-sm text-green-100">Of every donation (if fees covered: 100%)</div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Fundraising Increase Potential */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-purple-200 mb-4">RAISE MORE SUPPORT</div>
                <h3 className="text-5xl font-bold mb-8">Increase Your Fundraising 30-60%</h3>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold mb-6">How Tektons Table Helps You Raise More:</h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-blue-500 rounded-full p-3 text-3xl flex-shrink-0">📧</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Regular Email Updates</h5>
                          <p className="text-sm text-blue-100 mb-2">Missionaries who email monthly raise <strong className="text-white">30-40% more</strong></p>
                          <p className="text-xs text-blue-200">Source: Industry fundraising data</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-green-500 rounded-full p-3 text-3xl flex-shrink-0">🎯</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Visible Funding Goals</h5>
                          <p className="text-sm text-green-100 mb-2">Progress bars create <strong className="text-white">15-20% donation boost</strong></p>
                          <p className="text-xs text-green-200">Donors motivated to help you reach your goal</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-purple-500 rounded-full p-3 text-3xl flex-shrink-0">🔄</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Easy Recurring Gifts</h5>
                          <p className="text-sm text-purple-100 mb-2">Monthly donors give <strong className="text-white">5-10x more</strong> over time</p>
                          <p className="text-xs text-purple-200">One-click setup increases commitment</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-orange-500 rounded-full p-3 text-3xl flex-shrink-0">🔒</div>
                        <div>
                          <h5 className="font-bold text-xl mb-2">Exclusive Content</h5>
                          <p className="text-sm text-orange-100 mb-2">Supporter-only posts <strong className="text-white">reduce donor churn 25%</strong></p>
                          <p className="text-xs text-orange-200">Make donors feel valued and connected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: New Missionary</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Goal:</span>
                        <span className="font-bold">$3,000/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>With email engagement:</span>
                        <span className="font-bold text-cyan-200">+$1,050/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>With funding goal:</span>
                        <span className="font-bold text-cyan-200">+$450/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-cyan-300 text-xl">$4,500/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-100 mt-4">That's $18,000 extra per year!</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: Established Missionary</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Current:</span>
                        <span className="font-bold">$3,200/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Better retention:</span>
                        <span className="font-bold text-emerald-200">+$400/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>More recurring:</span>
                        <span className="font-bold text-emerald-200">+$600/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-emerald-300 text-xl">$4,200/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-100 mt-4">That's $12,000 extra per year!</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl p-6">
                    <h5 className="font-semibold mb-4">Example: Missionary Family</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Current:</span>
                        <span className="font-bold">$6,000/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Engagement features:</span>
                        <span className="font-bold text-fuchsia-200">+$2,400/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/30 pb-2">
                        <span>Less attrition:</span>
                        <span className="font-bold text-fuchsia-200">+$600/mo</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">New Total:</span>
                        <span className="font-bold text-fuchsia-300 text-xl">$9,000/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-fuchsia-100 mt-4">That's $36,000 extra per year!</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8 mt-8">
                <div className="text-center">
                  <p className="text-2xl mb-4">Combined Benefit: Save Money + Raise More</p>
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div>
                      <div className="text-sm text-orange-100 mb-1">Annual Savings</div>
                      <div className="text-5xl font-bold">$1,620-3,072</div>
                    </div>
                    <div className="text-6xl">+</div>
                    <div>
                      <div className="text-sm text-orange-100 mb-1">Fundraising Increase</div>
                      <div className="text-5xl font-bold">30-60%</div>
                    </div>
                  </div>
                  <p className="text-xl text-orange-50">= More resources for your mission field</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 mt-16 pt-16 border-t-4 border-blue-600">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">3-Slide Pitch Deck</h2>
            <p className="text-gray-600">A concise overview for investors and partners</p>
          </div>

          <div className="space-y-8">
            {/* Slide 1 - Problem & Solution */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-orange-200 mb-4">SLIDE 1 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">The Problem</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">$1,620-3,072</div>
                    <p className="text-xl text-orange-100">What missionaries currently pay annually for fundraising platforms + email marketing + websites</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="text-6xl font-bold mb-4">400,000+</div>
                    <p className="text-xl text-orange-100">Christian missionaries globally who need affordable fundraising solutions</p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8 mb-8">
                  <h4 className="text-2xl font-bold mb-4">Current Landscape:</h4>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Epistle.org / DonorElf charge $89-149/month subscriptions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Email marketing (Mailchimp/Flodesk) adds $20-50/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Website builders cost another $16-27/month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-3xl">❌</span>
                      <span>Total: Missionaries lose 2-4 months of potential support to platform costs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 mt-8">
                <h4 className="text-3xl font-bold mb-4">The Solution: Tektons Table</h4>
                <p className="text-2xl mb-6">Zero subscription. Everything included. Self-sustaining from day one.</p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm">Monthly subscription</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">3%</div>
                    <div className="text-sm">Platform fee (vs 5-12% elsewhere)</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">Free</div>
                    <div className="text-sm">Email newsletters included</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 - Market & Business Model */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-4">SLIDE 2 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Market Opportunity & Business Model</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Target Market</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="font-semibold">400,000+ missionaries globally</div>
                          <div className="text-sm text-blue-200">English-speaking initially</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="font-semibold">$1,200-2,000/month average</div>
                          <div className="text-sm text-blue-200">Per missionary fundraising</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <div className="font-semibold">Growing digital adoption</div>
                          <div className="text-sm text-blue-200">45% increase since 2020</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-4">Revenue Model</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-lg mb-2">3% Platform Fee</div>
                        <div className="text-sm text-blue-200">On all donations processed</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Optional Donor Tips</div>
                        <div className="text-sm text-blue-200">10-20% preselected, 40-60% adoption rate expected</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-2">Fee Coverage</div>
                        <div className="text-sm text-blue-200">Donors can cover Stripe's 2.9% + $0.30</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-8">
                  <h4 className="text-2xl font-bold mb-4">12-Month Revenue Projection</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-center mb-4">
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 1</div>
                      <div className="text-3xl font-bold">$108</div>
                      <div className="text-xs text-blue-300">1 missionary</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 6</div>
                      <div className="text-3xl font-bold">$1,188</div>
                      <div className="text-xs text-blue-300">11 missionaries</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-200 mb-1">Month 12</div>
                      <div className="text-3xl font-bold">$3,209</div>
                      <div className="text-xs text-blue-300">23 missionaries</div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-lg p-2">
                      <div className="text-sm text-yellow-200 mb-1">Year 1 Total</div>
                      <div className="text-3xl font-bold text-yellow-300">$17,897</div>
                      <div className="text-xs text-yellow-200">$38k annual run rate</div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-blue-200">
                    Self-sustaining from Month 1. No fundraising required. Profitable by Month 6.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-green-300">$200k</div>
                  <div className="text-sm text-green-200">Monthly donation volume</div>
                </div>
                <div className="bg-blue-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-blue-300">200+</div>
                  <div className="text-sm text-blue-200">Active missionaries</div>
                </div>
                <div className="bg-purple-500/20 backdrop-blur rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">Year 2 Goal</div>
                  <div className="text-4xl font-bold text-purple-300">$15k</div>
                  <div className="text-sm text-purple-200">Monthly platform revenue</div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Competitive Advantage */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-2xl p-12 text-white min-h-[600px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-green-200 mb-4">SLIDE 3 OF 3</div>
                <h3 className="text-5xl font-bold mb-8">Why We Win</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-2xl font-bold mb-6">Unique Advantages</h4>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🆓 Zero Subscription Model</div>
                        <p className="text-sm text-green-100">Only platform that's completely free for missionaries. Competitors charge $49-200/month.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">📧 Free Email Marketing</div>
                        <p className="text-sm text-green-100">Unlimited newsletters included. Saves missionaries $240-600/year vs Mailchimp/Flodesk.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🌍 Global from Day 1</div>
                        <p className="text-sm text-green-100">6 languages + 135 currencies via Stripe. Competitors support 44 max.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="font-bold text-xl mb-2">🎯 Mission-Specific Features</div>
                        <p className="text-sm text-green-100">Funding goals, prayer updates, supporter content locking, CRM dashboard.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold mb-6">Competitive Position</h4>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/30">
                            <th className="text-left py-2">Platform</th>
                            <th className="text-center py-2">Cost/Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Epistle.org</td>
                            <td className="text-center py-2">$1,068+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">DonorElf</td>
                            <td className="text-center py-2">$1,548+</td>
                          </tr>
                          <tr className="border-b border-white/20">
                            <td className="py-2">Patreon</td>
                            <td className="text-center py-2">5-12% fees</td>
                          </tr>
                          <tr className="bg-yellow-500/20">
                            <td className="py-2 font-bold">Tektons Table</td>
                            <td className="text-center py-2 font-bold text-yellow-300">$0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                      <div className="font-bold text-xl mb-2">🔒 Enhanced Data Privacy</div>
                      <p className="text-sm text-green-100">Zero financial data stored. Everything through Stripe's bank-level security.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="font-bold text-xl mb-2">📱 Mobile App Roadmap</div>
                      <p className="text-sm text-green-100">PWA launching Day 1, native React Native app in Phase 2.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8">
                <h4 className="text-3xl font-bold mb-4">The Ask</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm mb-2">Funding Need</div>
                    <div className="text-4xl font-bold mb-2">$0</div>
                    <div className="text-sm text-orange-100">Self-sustaining from launch</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Build Timeline</div>
                    <div className="text-4xl font-bold mb-2">2-3 days</div>
                    <div className="text-sm text-orange-100">MVP to production</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Partnership Opportunity</div>
                    <div className="text-2xl font-bold mb-2">Mission Agencies</div>
                    <div className="text-sm text-orange-100">White-label & integrations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
