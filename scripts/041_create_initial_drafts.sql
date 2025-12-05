-- Phase 2: Create initial draft pages for content planning

-- 1. Pricing Comparison Page
INSERT INTO draft_pages (id, title, slug, category, html_content, notes, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Pricing Comparison',
  'pricing-comparison',
  'marketing',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing Comparison - TektonStable vs Competitors</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Geist", -apple-system, sans-serif; line-height: 1.6; color: #0f0f0f; background: #fafafa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
    
    /* Hero Section */
    .hero { text-align: center; margin-bottom: 4rem; padding: 3rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(14, 165, 233, 0.1)); border-radius: 1.5rem; }
    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; color: #0f0f0f; }
    .hero p { font-size: 1.25rem; color: #525252; max-width: 700px; margin: 0 auto 2rem; }
    .badge { display: inline-block; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.875rem; font-weight: 600; color: #3b82f6; margin-bottom: 1.5rem; }
    
    /* Comparison Table */
    .comparison-table { background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 3rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1.25rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #fafafa; font-weight: 700; color: #0f0f0f; }
    .platform-name { font-weight: 600; color: #0f0f0f; }
    .highlight-row { background: rgba(59, 130, 246, 0.05); }
    .highlight-row .platform-name { color: #3b82f6; }
    .check { color: #10b981; font-weight: 700; }
    .cross { color: #ef4444; font-weight: 700; }
    
    /* Feature Cards */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
    .feature-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .feature-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #0f0f0f; }
    .feature-card p { color: #525252; margin-bottom: 1rem; }
    .feature-card ul { list-style: none; }
    .feature-card ul li { padding: 0.5rem 0; color: #525252; }
    .feature-card ul li:before { content: "✓"; color: #3b82f6; font-weight: 700; margin-right: 0.5rem; }
    
    /* Missions Agency Section */
    .agency-section { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 3rem; }
    .agency-section h2 { font-size: 2rem; margin-bottom: 1.5rem; color: #0f0f0f; }
    .agency-grid { display: grid; gap: 1.5rem; }
    .agency-item { padding: 1.5rem; background: #fafafa; border-radius: 0.75rem; border-left: 4px solid #3b82f6; }
    .agency-item h4 { font-weight: 600; margin-bottom: 0.5rem; color: #0f0f0f; }
    .agency-item p { color: #525252; font-size: 0.95rem; }
    
    /* CTA Section */
    .cta { text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.15)); padding: 3rem; border-radius: 1.5rem; }
    .cta h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #0f0f0f; }
    .cta p { font-size: 1.125rem; color: #525252; margin-bottom: 2rem; }
    .cta-button { display: inline-block; background: #0f0f0f; color: white; padding: 1rem 2.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: 600; font-size: 1.125rem; transition: opacity 0.2s; }
    .cta-button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero Section -->
    <div class="hero">
      <div class="badge">💰 Save $1,620 - $3,072 Annually</div>
      <h1>Why TektonStable is the Best Value</h1>
      <p>Stop paying expensive monthly subscriptions. Get everything you need with transparent, pay-as-you-go pricing.</p>
    </div>
    
    <!-- Main Comparison Table -->
    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Platform</th>
            <th>Monthly Fee</th>
            <th>Transaction Fee</th>
            <th>Custom Domain</th>
            <th>Branded Website</th>
            <th>Email Tools</th>
            <th>Annual Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr class="highlight-row">
            <td class="platform-name">TektonStable</td>
            <td><strong>$0</strong></td>
            <td>3.5%</td>
            <td class="check">✓</td>
            <td class="check">✓</td>
            <td class="check">✓ Unlimited</td>
            <td><strong>$0</strong></td>
          </tr>
          <tr>
            <td class="platform-name">GoFundMe</td>
            <td>$0</td>
            <td>2.9% + $0.30</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td>$0</td>
          </tr>
          <tr>
            <td class="platform-name">Patreon</td>
            <td>$0-200</td>
            <td>5-12%</td>
            <td class="cross">✗</td>
            <td class="cross">Limited</td>
            <td class="check">✓</td>
            <td>$0-2,400</td>
          </tr>
          <tr>
            <td class="platform-name">GiveSendGo</td>
            <td>$0</td>
            <td>2.9% + $0.30</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td>$0</td>
          </tr>
          <tr>
            <td class="platform-name">DonorBox</td>
            <td>$49+</td>
            <td>1.75% + Stripe</td>
            <td class="check">✓</td>
            <td class="cross">Limited</td>
            <td>$49+/mo extra</td>
            <td>$588+</td>
          </tr>
          <tr>
            <td class="platform-name">Givebutter</td>
            <td>$0</td>
            <td>0% (donor tips)</td>
            <td class="cross">✗</td>
            <td class="cross">Limited</td>
            <td class="check">✓</td>
            <td>$0</td>
          </tr>
          <tr>
            <td class="platform-name">Classy</td>
            <td>$199+</td>
            <td>2.9% + $0.30</td>
            <td class="check">✓</td>
            <td class="check">✓</td>
            <td class="check">✓</td>
            <td>$2,388+</td>
          </tr>
          <tr>
            <td class="platform-name">Fundly</td>
            <td>$0</td>
            <td>4.9%</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td>$0</td>
          </tr>
          <tr>
            <td class="platform-name">Missionbox</td>
            <td>$49-199</td>
            <td>2.9%</td>
            <td class="check">✓</td>
            <td class="check">✓</td>
            <td class="check">✓ Limited</td>
            <td>$588-2,388</td>
          </tr>
          <tr>
            <td class="platform-name">FaithLauncher</td>
            <td>$29-99</td>
            <td>3%</td>
            <td class="check">✓</td>
            <td class="check">✓</td>
            <td class="cross">Limited</td>
            <td>$348-1,188</td>
          </tr>
          <tr>
            <td class="platform-name">missions.me</td>
            <td>$20</td>
            <td>2.9% + $0.30</td>
            <td class="cross">✗</td>
            <td class="cross">Limited</td>
            <td class="cross">✗</td>
            <td>$240</td>
          </tr>
          <tr>
            <td class="platform-name">Overflow</td>
            <td>$99+</td>
            <td>2%</td>
            <td class="check">✓</td>
            <td class="cross">Limited</td>
            <td class="check">✓</td>
            <td>$1,188+</td>
          </tr>
          <tr>
            <td class="platform-name">Kindest</td>
            <td>$29</td>
            <td>2.9%</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td>$348</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Why TektonStable Section -->
    <div class="features-grid">
      <div class="feature-card">
        <h3>🎯 Mission-Focused</h3>
        <p>Built specifically for missionaries, not generic crowdfunding.</p>
        <ul>
          <li>Prayer letter management</li>
          <li>Supporter relationship tools</li>
          <li>Ministry update scheduling</li>
          <li>Recurring donation tracking</li>
        </ul>
      </div>
      
      <div class="feature-card">
        <h3>💎 All-Inclusive Platform</h3>
        <p>Everything you need in one place, no additional subscriptions.</p>
        <ul>
          <li>Custom branded website</li>
          <li>Unlimited email newsletters</li>
          <li>Donor CRM system</li>
          <li>Analytics dashboard</li>
        </ul>
      </div>
      
      <div class="feature-card">
        <h3>💰 Transparent Pricing</h3>
        <p>Only 3.5% per donation. No hidden fees or monthly charges.</p>
        <ul>
          <li>Zero setup costs</li>
          <li>No monthly subscription</li>
          <li>No email sending limits</li>
          <li>No feature paywalls</li>
        </ul>
      </div>
      
      <div class="feature-card">
        <h3>🔐 Professional Tools</h3>
        <p>Enterprise-grade features without enterprise pricing.</p>
        <ul>
          <li>Secure payment processing</li>
          <li>Tax receipt generation</li>
          <li>Custom domain support</li>
          <li>24/7 platform support</li>
        </ul>
      </div>
    </div>
    
    <!-- Missions Agency Comparison -->
    <div class="agency-section">
      <h2>Better Than Agency-Provided Tools</h2>
      <p style="margin-bottom: 2rem; color: #525252;">Many missions agencies offer fundraising support, but with significant limitations:</p>
      
      <div class="agency-grid">
        <div class="agency-item">
          <h4>YWAM, OM, Cru, and Similar Agencies</h4>
          <p><strong>Limitations:</strong> You''re locked into their platform with no customization, limited branding control, and often restrictive donor management. If you change agencies, you lose your supporter database and have to start over.</p>
        </div>
        
        <div class="agency-item">
          <h4>TektonStable Difference</h4>
          <p><strong>Freedom:</strong> You own your supporter relationships and data. Fully customizable branding. Works with any agency or independent ministry. Switch organizations without losing your fundraising infrastructure.</p>
        </div>
      </div>
    </div>
    
    <!-- Cost Calculator Widget Placeholder -->
    <div style="background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 3rem; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Calculate Your Savings</h2>
      <p style="color: #525252; margin-bottom: 2rem;">See how much you''ll save compared to other platforms</p>
      <div style="background: #fafafa; padding: 2rem; border-radius: 0.75rem; max-width: 600px; margin: 0 auto;">
        <p style="font-size: 0.875rem; color: #525252;">[Interactive calculator widget will go here]</p>
        <p style="margin-top: 1rem; color: #525252;">Input your expected monthly donations to see real cost comparisons across platforms.</p>
      </div>
    </div>
    
    <!-- CTA -->
    <div class="cta">
      <h2>Start Saving Today</h2>
      <p>Join hundreds of missionaries who are keeping more of their support with TektonStable.</p>
      <a href="/auth/signup" class="cta-button">Create Your Free Account →</a>
      <p style="margin-top: 1rem; font-size: 0.875rem; color: #737373;">No credit card required • Setup in 5 minutes • Cancel anytime</p>
    </div>
    
  </div>
</body>
</html>',
  'Comprehensive pricing comparison showing TektonStable advantages over 12+ competitors and missions agencies',
  'draft',
  NOW(),
  NOW()
);

-- 2. How It Works Page
INSERT INTO draft_pages (id, title, slug, category, html_content, notes, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'How It Works',
  'how-it-works',
  'marketing',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How It Works - Get Started in Minutes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Geist", -apple-system, sans-serif; line-height: 1.6; color: #0f0f0f; background: #fafafa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
    
    /* Hero */
    .hero { text-align: center; margin-bottom: 5rem; }
    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; color: #0f0f0f; }
    .hero p { font-size: 1.25rem; color: #525252; max-width: 700px; margin: 0 auto; }
    .badge { display: inline-block; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.875rem; font-weight: 600; color: #3b82f6; margin-bottom: 1.5rem; }
    
    /* Steps Timeline */
    .timeline { position: relative; padding-left: 3rem; margin-bottom: 5rem; }
    .timeline:before { content: ""; position: absolute; left: 1rem; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #3b82f6, #0ea5e9); }
    .step { position: relative; margin-bottom: 4rem; background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .step-number { position: absolute; left: -2.5rem; top: 2.5rem; width: 2.5rem; height: 2.5rem; background: linear-gradient(135deg, #3b82f6, #0ea5e9); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); }
    .step h2 { font-size: 1.75rem; margin-bottom: 1rem; color: #0f0f0f; }
    .step p { color: #525252; margin-bottom: 1.5rem; font-size: 1.125rem; }
    .step ul { list-style: none; margin-left: 0; }
    .step ul li { padding: 0.75rem 0; color: #525252; padding-left: 2rem; position: relative; }
    .step ul li:before { content: "→"; position: absolute; left: 0; color: #3b82f6; font-weight: 700; }
    .step-image { background: #fafafa; border-radius: 0.75rem; padding: 2rem; text-align: center; margin-top: 1.5rem; border: 2px dashed #e5e5e5; color: #737373; font-size: 0.875rem; }
    
    /* Video Section */
    .video-section { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 5rem; text-align: center; }
    .video-section h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #0f0f0f; }
    .video-section p { color: #525252; margin-bottom: 2rem; font-size: 1.125rem; }
    .video-placeholder { background: #0f0f0f; border-radius: 1rem; padding: 6rem 2rem; color: white; }
    
    /* FAQ Quick List */
    .faq-section { margin-bottom: 5rem; }
    .faq-section h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #0f0f0f; }
    .faq-grid { display: grid; gap: 1.5rem; }
    .faq-item { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .faq-item h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #0f0f0f; }
    .faq-item p { color: #525252; }
    
    /* CTA */
    .cta { text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.15)); padding: 3rem; border-radius: 1.5rem; }
    .cta h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #0f0f0f; }
    .cta p { font-size: 1.125rem; color: #525252; margin-bottom: 2rem; }
    .cta-button { display: inline-block; background: #0f0f0f; color: white; padding: 1rem 2.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: 600; font-size: 1.125rem; transition: opacity 0.2s; }
    .cta-button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero -->
    <div class="hero">
      <div class="badge">⚡ Setup in 5 Minutes</div>
      <h1>Launch Your Mission in Minutes</h1>
      <p>From signup to receiving donations - see how easy it is to get started with TektonStable.</p>
    </div>
    
    <!-- Steps Timeline -->
    <div class="timeline">
      
      <!-- Step 1 -->
      <div class="step">
        <div class="step-number">1</div>
        <h2>Create Your Account</h2>
        <p>Sign up with your email in under 60 seconds. No credit card required.</p>
        <ul>
          <li>Enter your name and email address</li>
          <li>Verify your email with one click</li>
          <li>Answer 3 quick questions about your ministry</li>
          <li>Choose your custom subdomain (e.g., yourname.tektonstable.com)</li>
        </ul>
        <div class="step-image">[Screenshot: Sign-up form]</div>
      </div>
      
      <!-- Step 2 -->
      <div class="step">
        <div class="step-number">2</div>
        <h2>Customize Your Site</h2>
        <p>Make it yours with our simple customization wizard. No technical skills needed.</p>
        <ul>
          <li>Upload your photo and ministry logo</li>
          <li>Write your ministry story and fundraising goal</li>
          <li>Choose your color scheme and layout</li>
          <li>Add photos and videos from your ministry</li>
          <li>Preview your site in real-time</li>
        </ul>
        <div class="step-image">[Screenshot: Site customization interface]</div>
      </div>
      
      <!-- Step 3 -->
      <div class="step">
        <div class="step-number">3</div>
        <h2>Connect Payment Processing</h2>
        <p>Link your Stripe account to start receiving donations securely.</p>
        <ul>
          <li>Click "Connect Stripe" button</li>
          <li>Fill out Stripe''s secure onboarding (5 minutes)</li>
          <li>Verify your bank account for payouts</li>
          <li>Set your donation amounts and options</li>
          <li>Test a donation to make sure everything works</li>
        </ul>
        <div class="step-image">[Screenshot: Stripe connection flow]</div>
      </div>
      
      <!-- Step 4 -->
      <div class="step">
        <div class="step-number">4</div>
        <h2>Launch & Share</h2>
        <p>Go live and start sharing your fundraising page with supporters!</p>
        <ul>
          <li>Click "Publish" to make your site live</li>
          <li>Get your shareable link instantly</li>
          <li>Share on social media, email, and prayer letters</li>
          <li>Import existing supporters to your database</li>
          <li>Send your first ministry update newsletter</li>
        </ul>
        <div class="step-image">[Screenshot: Published site + share options]</div>
      </div>
      
      <!-- Step 5 -->
      <div class="step">
        <div class="step-number">5</div>
        <h2>Receive & Manage Donations</h2>
        <p>Watch donations come in and manage your supporters effortlessly.</p>
        <ul>
          <li>Get instant email notifications for every donation</li>
          <li>Send automatic thank-you messages to donors</li>
          <li>Track recurring vs one-time donations</li>
          <li>Export donor data for tax receipts</li>
          <li>Send prayer letters and ministry updates</li>
        </ul>
        <div class="step-image">[Screenshot: Dashboard showing donations + CRM]</div>
      </div>
      
    </div>
    
    <!-- Video Walkthrough -->
    <div class="video-section">
      <h2>See It In Action</h2>
      <p>Watch our 3-minute walkthrough of the complete setup process.</p>
      <div class="video-placeholder">
        <p style="font-size: 3rem; margin-bottom: 1rem;">▶️</p>
        <p>[Embed setup walkthrough video here]</p>
        <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.7;">Full setup from signup to first donation in under 3 minutes</p>
      </div>
    </div>
    
    <!-- Quick FAQ -->
    <div class="faq-section">
      <h2>Common Questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <h3>How long does setup really take?</h3>
          <p>Most missionaries complete setup in 5-10 minutes. The Stripe connection is the longest part (about 5 minutes), and then you''re ready to receive donations immediately.</p>
        </div>
        
        <div class="faq-item">
          <h3>Do I need technical skills?</h3>
          <p>Not at all! Our platform is designed for missionaries, not developers. If you can send an email, you can set up your fundraising site.</p>
        </div>
        
        <div class="faq-item">
          <h3>Can I customize my site later?</h3>
          <p>You can edit your content, photos, colors, and settings anytime. Changes go live instantly.</p>
        </div>
        
        <div class="faq-item">
          <h3>What if I need help?</h3>
          <p>We provide 24/7 support via chat and email. Plus, our Help Center has step-by-step guides for every feature.</p>
        </div>
        
        <div class="faq-item">
          <h3>Can I import my existing donors?</h3>
          <p>Yes! You can import donor lists from spreadsheets or other platforms. We''ll help you migrate your data.</p>
        </div>
        
        <div class="faq-item">
          <h3>What happens after I launch?</h3>
          <p>Your site goes live immediately at your custom domain. You can start sharing it right away, and donations will flow directly to your bank account.</p>
        </div>
      </div>
    </div>
    
    <!-- CTA -->
    <div class="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join hundreds of missionaries already fundraising smarter with TektonStable.</p>
      <a href="/auth/signup" class="cta-button">Start Your Free Account →</a>
      <p style="margin-top: 1rem; font-size: 0.875rem; color: #737373;">No credit card • No commitments • Live in 5 minutes</p>
    </div>
    
  </div>
</body>
</html>',
  'Step-by-step guide showing how easy it is to get started, with placeholders for screenshots and video',
  'draft',
  NOW(),
  NOW()
);

-- 3. Security & Trust Page
INSERT INTO draft_pages (id, title, slug, category, html_content, notes, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Security & Trust',
  'security',
  'marketing',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security & Trust - Your Donations Are Safe</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Geist", -apple-system, sans-serif; line-height: 1.6; color: #0f0f0f; background: #fafafa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
    
    /* Hero */
    .hero { text-align: center; margin-bottom: 5rem; padding: 3rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.1)); border-radius: 1.5rem; }
    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; color: #0f0f0f; }
    .hero p { font-size: 1.25rem; color: #525252; max-width: 700px; margin: 0 auto; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.875rem; font-weight: 600; color: #10b981; margin-bottom: 1.5rem; }
    
    /* Trust Badges */
    .trust-badges { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 5rem; }
    .badge-item { background: white; padding: 2rem; border-radius: 1rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .badge-icon { font-size: 3rem; margin-bottom: 1rem; }
    .badge-item h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #0f0f0f; }
    .badge-item p { font-size: 0.875rem; color: #525252; }
    
    /* Security Features Grid */
    .security-grid { display: grid; gap: 2rem; margin-bottom: 5rem; }
    .security-card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .security-card h2 { font-size: 1.75rem; margin-bottom: 1rem; color: #0f0f0f; display: flex; align-items: center; gap: 0.75rem; }
    .security-icon { font-size: 2rem; }
    .security-card p { color: #525252; margin-bottom: 1.5rem; font-size: 1.125rem; }
    .security-card ul { list-style: none; }
    .security-card ul li { padding: 0.75rem 0; color: #525252; padding-left: 2rem; position: relative; border-bottom: 1px solid #f5f5f5; }
    .security-card ul li:last-child { border-bottom: none; }
    .security-card ul li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: 700; }
    
    /* Stripe Partnership */
    .stripe-section { background: linear-gradient(135deg, #635bff 0%, #4f46e5 100%); color: white; padding: 4rem 3rem; border-radius: 1.5rem; margin-bottom: 5rem; text-align: center; }
    .stripe-section h2 { font-size: 2.5rem; margin-bottom: 1.5rem; }
    .stripe-section p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.95; }
    .stripe-logo { background: white; padding: 2rem; border-radius: 1rem; display: inline-block; margin-bottom: 2rem; }
    .stripe-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: left; margin-top: 3rem; }
    .stripe-feature { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.75rem; backdrop-filter: blur(10px); }
    .stripe-feature h4 { margin-bottom: 0.5rem; font-weight: 600; }
    
    /* Data Protection */
    .protection-section { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 5rem; }
    .protection-section h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #0f0f0f; }
    .protection-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .protection-item { padding: 1.5rem; border-left: 4px solid #10b981; background: #fafafa; border-radius: 0.5rem; }
    .protection-item h3 { margin-bottom: 0.75rem; color: #0f0f0f; }
    .protection-item p { color: #525252; font-size: 0.95rem; }
    
    /* Compliance Badges */
    .compliance-section { margin-bottom: 5rem; text-align: center; }
    .compliance-section h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #0f0f0f; }
    .compliance-badges { display: flex; justify-content: center; flex-wrap: wrap; gap: 2rem; }
    .compliance-badge { background: white; padding: 1.5rem 2.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; color: #0f0f0f; }
    
    /* Testimonials */
    .testimonials { margin-bottom: 5rem; }
    .testimonials h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #0f0f0f; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
    .testimonial { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .testimonial-quote { font-size: 1.125rem; color: #0f0f0f; margin-bottom: 1.5rem; font-style: italic; }
    .testimonial-author { display: flex; align-items: center; gap: 1rem; }
    .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: #e5e5e5; }
    .author-info h4 { font-size: 1rem; color: #0f0f0f; }
    .author-info p { font-size: 0.875rem; color: #737373; }
    
    /* CTA */
    .cta { text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.15)); padding: 3rem; border-radius: 1.5rem; }
    .cta h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #0f0f0f; }
    .cta p { font-size: 1.125rem; color: #525252; margin-bottom: 2rem; }
    .cta-button { display: inline-block; background: #0f0f0f; color: white; padding: 1rem 2.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: 600; font-size: 1.125rem; transition: opacity 0.2s; }
    .cta-button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero -->
    <div class="hero">
      <div class="badge">🔒 Bank-Level Security</div>
      <h1>Your Donations Are Safe</h1>
      <p>We take security seriously. Learn how we protect your donors and their payment information.</p>
    </div>
    
    <!-- Trust Badges -->
    <div class="trust-badges">
      <div class="badge-item">
        <div class="badge-icon">🛡️</div>
        <h3>SSL Encrypted</h3>
        <p>256-bit encryption on all transactions</p>
      </div>
      <div class="badge-item">
        <div class="badge-icon">✅</div>
        <h3>PCI Compliant</h3>
        <p>Certified payment security standards</p>
      </div>
      <div class="badge-item">
        <div class="badge-icon">🔐</div>
        <h3>SOC 2 Type II</h3>
        <p>Audited security controls</p>
      </div>
      <div class="badge-item">
        <div class="badge-icon">🏦</div>
        <h3>Stripe Verified</h3>
        <p>Powered by industry leader</p>
      </div>
    </div>
    
    <!-- We Don''t Store Payment Data -->
    <div class="security-card" style="margin-bottom: 3rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(14, 165, 233, 0.1)); border: 2px solid rgba(59, 130, 246, 0.2);">
      <h2>
        <span class="security-icon">💳</span>
        We Never Store Payment Information
      </h2>
      <p style="font-size: 1.25rem; font-weight: 600; color: #0f0f0f;">This is the most important thing to understand: TektonStable never sees or stores your donors'' credit card information.</p>
      <p>When someone makes a donation, their payment details go directly to Stripe (our payment processor) through a secure, encrypted connection. We never have access to card numbers, CVV codes, or banking information.</p>
      <ul style="margin-top: 1.5rem;">
        <li>All payment data is handled by Stripe, not TektonStable</li>
        <li>Credit card information never touches our servers</li>
        <li>We only receive confirmation that payment was successful</li>
        <li>Stripe is PCI Level 1 certified (highest security standard)</li>
        <li>Same security used by Apple, Amazon, and Google</li>
      </ul>
    </div>
    
    <!-- Stripe Partnership Section -->
    <div class="stripe-section">
      <div class="stripe-logo">
        <h3 style="color: #635bff; font-size: 2rem; margin: 0;">[Stripe Logo]</h3>
      </div>
      <h2>Powered by Stripe</h2>
      <p>We partner with Stripe, the world''s most trusted payment platform, processing billions of dollars annually for millions of businesses.</p>
      
      <div class="stripe-features">
        <div class="stripe-feature">
          <h4>🏦 Bank-Grade Security</h4>
          <p>Same infrastructure that powers major banks and financial institutions</p>
        </div>
        <div class="stripe-feature">
          <h4>🌍 Global Trust</h4>
          <p>Processes payments for Amazon, Google, Shopify, and millions more</p>
        </div>
        <div class="stripe-feature">
          <h4>🔒 Fraud Protection</h4>
          <p>Advanced machine learning detects and blocks fraudulent transactions</p>
        </div>
        <div class="stripe-feature">
          <h4>✅ Certified Compliance</h4>
          <p>PCI DSS Level 1 certified - the highest security standard</p>
        </div>
      </div>
    </div>
    
    <!-- Security Features Grid -->
    <div class="security-grid">
      <div class="security-card">
        <h2>
          <span class="security-icon">🔐</span>
          Encryption Everywhere
        </h2>
        <p>All data transmitted to and from TektonStable is encrypted with industry-standard SSL/TLS protocols.</p>
        <ul>
          <li>256-bit SSL encryption on all pages</li>
          <li>HTTPS enforced across the entire platform</li>
          <li>Encrypted database storage</li>
          <li>Secure API connections</li>
          <li>Regular security audits and penetration testing</li>
        </ul>
      </div>
      
      <div class="security-card">
        <h2>
          <span class="security-icon">👥</span>
          Donor Data Protection
        </h2>
        <p>We protect your donors'' personal information with enterprise-grade security measures.</p>
        <ul>
          <li>GDPR and CCPA compliant data handling</li>
          <li>Encrypted storage of names and email addresses</li>
          <li>Secure access controls and authentication</li>
          <li>Regular automated backups</li>
          <li>Role-based permissions for multi-user accounts</li>
        </ul>
      </div>
      
      <div class="security-card">
        <h2>
          <span class="security-icon">🛡️</span>
          Fraud Prevention
        </h2>
        <p>Multiple layers of protection prevent fraudulent transactions and protect your ministry.</p>
        <ul>
          <li>Stripe Radar for real-time fraud detection</li>
          <li>Machine learning algorithms flag suspicious activity</li>
          <li>3D Secure authentication for high-risk transactions</li>
          <li>Instant notifications for all donations</li>
          <li>Chargeback protection and dispute resolution</li>
        </ul>
      </div>
      
      <div class="security-card">
        <h2>
          <span class="security-icon">🔍</span>
          Regular Security Audits
        </h2>
        <p>Our platform undergoes continuous security monitoring and regular third-party audits.</p>
        <ul>
          <li>Quarterly penetration testing by security experts</li>
          <li>24/7 infrastructure monitoring and alerts</li>
          <li>Automated vulnerability scanning</li>
          <li>SOC 2 Type II compliance</li>
          <li>Incident response protocols</li>
        </ul>
      </div>
    </div>
    
    <!-- Data Protection Details -->
    <div class="protection-section">
      <h2>What Data We Do Store (And How We Protect It)</h2>
      <p style="text-align: center; color: #525252; margin-bottom: 3rem; max-width: 800px; margin-left: auto; margin-right: auto;">While we never store payment information, we do keep certain data to help you manage your ministry and communicate with supporters. Here''s exactly what we store and how it''s protected:</p>
      
      <div class="protection-grid">
        <div class="protection-item">
          <h3>Donor Contact Information</h3>
          <p><strong>What:</strong> Names, email addresses, and mailing addresses (if provided)<br><strong>Why:</strong> To send receipts, updates, and prayer letters<br><strong>Protection:</strong> Encrypted at rest, GDPR compliant, never sold or shared</p>
        </div>
        
        <div class="protection-item">
          <h3>Donation History</h3>
          <p><strong>What:</strong> Donation amounts, dates, and status<br><strong>Why:</strong> For your records and donor tax receipts<br><strong>Protection:</strong> Encrypted database, secure access controls, regular backups</p>
        </div>
        
        <div class="protection-item">
          <h3>Account Credentials</h3>
          <p><strong>What:</strong> Your email and hashed password<br><strong>Why:</strong> For secure login to your dashboard<br><strong>Protection:</strong> Passwords hashed with bcrypt, 2FA available, session encryption</p>
        </div>
        
        <div class="protection-item">
          <h3>Site Content</h3>
          <p><strong>What:</strong> Your ministry story, photos, and updates<br><strong>Why:</strong> To display on your fundraising site<br><strong>Protection:</strong> Secure CDN hosting, version control, automated backups</p>
        </div>
      </div>
    </div>
    
    <!-- Compliance -->
    <div class="compliance-section">
      <h2>Compliance & Certifications</h2>
      <div class="compliance-badges">
        <div class="compliance-badge">PCI DSS Level 1</div>
        <div class="compliance-badge">SOC 2 Type II</div>
        <div class="compliance-badge">GDPR Compliant</div>
        <div class="compliance-badge">CCPA Compliant</div>
        <div class="compliance-badge">ISO 27001</div>
      </div>
    </div>
    
    <!-- Testimonials About Security -->
    <div class="testimonials">
      <h2>Trusted by Missionaries Worldwide</h2>
      <div class="testimonials-grid">
        <div class="testimonial">
          <div class="testimonial-quote">
            "As someone who manages sensitive donor information, I needed to know our platform was secure. TektonStable''s partnership with Stripe and their transparent security practices gave me complete peace of mind."
          </div>
          <div class="testimonial-author">
            <div class="author-avatar"></div>
            <div class="author-info">
              <h4>Sarah Johnson</h4>
              <p>Missionary, Southeast Asia</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial">
          <div class="testimonial-quote">
            "I was concerned about online giving security, but learning that card details never even touch TektonStable''s servers - they go straight to Stripe - made me confident in recommending this to my donors."
          </div>
          <div class="testimonial-author">
            <div class="author-avatar"></div>
            <div class="author-info">
              <h4>Michael Chen</h4>
              <p>Campus Minister, University Outreach</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial">
          <div class="testimonial-quote">
            "The level of security and transparency is impressive. I appreciate that they use the same payment processor as major companies like Amazon. My donors feel safe giving online."
          </div>
          <div class="testimonial-author">
            <div class="author-avatar"></div>
            <div class="author-info">
              <h4>David Martinez</h4>
              <p>Church Planter, Latin America</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CTA -->
    <div class="cta">
      <h2>Start Fundraising with Confidence</h2>
      <p>Join hundreds of missionaries who trust TektonStable with their ministry fundraising.</p>
      <a href="/auth/signup" class="cta-button">Create Your Secure Account →</a>
      <p style="margin-top: 1rem; font-size: 0.875rem; color: #737373;">Bank-level security • No payment data stored • Stripe-powered</p>
    </div>
    
  </div>
</body>
</html>',
  'Comprehensive security page emphasizing no payment data storage, Stripe partnership, and donor protection',
  'draft',
  NOW(),
  NOW()
);
