-- Update the Pricing Comparison draft page with accurate competitor research

UPDATE draft_pages
SET html_content = $$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Comparison - TektonStable</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Geist', sans-serif; line-height: 1.6; color: #1a1a1a; }
        
        .hero { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 80px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
        .hero p { font-size: 1.25rem; max-width: 700px; margin: 0 auto; opacity: 0.95; }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
        
        .section { margin-bottom: 80px; }
        .section h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #0ea5e9; }
        .section p { font-size: 1.125rem; color: #666; margin-bottom: 2rem; }
        
        .comparison-table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
        .comparison-table thead { background: #0ea5e9; color: white; }
        .comparison-table th { padding: 20px; text-align: left; font-weight: 600; }
        .comparison-table td { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
        .comparison-table tr:hover { background: #f9fafb; }
        .comparison-table .highlight { background: #dbeafe; font-weight: 600; }
        
        .advantage-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
        .warning-badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
        
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .feature-card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .feature-card h3 { color: #0ea5e9; margin-bottom: 1rem; font-size: 1.5rem; }
        .feature-card ul { list-style: none; }
        .feature-card li { padding: 8px 0; padding-left: 24px; position: relative; }
        .feature-card li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
        
        .calculator { background: #f0f9ff; padding: 40px; border-radius: 12px; margin: 40px 0; }
        .calculator h3 { color: #0ea5e9; margin-bottom: 20px; font-size: 1.75rem; }
        .calculator-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .calculator-item { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        .calculator-item .amount { font-size: 2rem; font-weight: 700; color: #0ea5e9; }
        .calculator-item .label { color: #666; margin-top: 8px; }
        
        .missions-agencies { background: #fef3c7; padding: 40px; border-radius: 12px; margin-top: 40px; }
        .missions-agencies h3 { color: #d97706; margin-bottom: 20px; font-size: 1.75rem; }
        .missions-agencies ul { list-style: none; }
        .missions-agencies li { padding: 12px 0; padding-left: 24px; position: relative; }
        .missions-agencies li:before { content: "⚠"; position: absolute; left: 0; color: #d97706; }
        
        .cta { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; margin-top: 60px; }
        .cta h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .cta p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.95; }
        .cta button { background: white; color: #0ea5e9; padding: 16px 40px; border: none; border-radius: 8px; font-size: 1.125rem; font-weight: 600; cursor: pointer; }
        .cta button:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Why TektonStable is the Best Value</h1>
        <p>Compare our transparent 3.5% all-inclusive pricing to other fundraising platforms. No hidden fees, no monthly charges, just simple and fair pricing.</p>
    </div>
    
    <div class="container">
        <!-- Main Comparison Table -->
        <div class="section">
            <h2>Platform Comparison</h2>
            <p>See how TektonStable compares to popular fundraising platforms</p>
            
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Platform</th>
                        <th>Platform Fee</th>
                        <th>Processing Fee</th>
                        <th>Monthly Cost</th>
                        <th>Limitations</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="highlight">
                        <td><strong>TektonStable</strong> <span class="advantage-badge">Best Value</span></td>
                        <td><strong>3.5%</strong></td>
                        <td><strong>Included</strong></td>
                        <td><strong>$0</strong></td>
                        <td>✓ Full custom site<br>✓ Unlimited campaigns<br>✓ No contracts</td>
                    </tr>
                    <tr>
                        <td>GoFundMe</td>
                        <td>0%</td>
                        <td>2.9% + $0.30</td>
                        <td>$0</td>
                        <td>❌ No custom domain<br>❌ Limited branding<br>❌ Donor tips requested</td>
                    </tr>
                    <tr>
                        <td>Patreon</td>
                        <td>10%</td>
                        <td>2.9% + $0.30</td>
                        <td>$0</td>
                        <td>❌ Membership focused<br>❌ Not for one-time donations<br>❌ Higher fees (12.9%+ total)</td>
                    </tr>
                    <tr>
                        <td>GiveSendGo</td>
                        <td>0%</td>
                        <td>2.9% + $0.30</td>
                        <td>$0</td>
                        <td>❌ No custom sites<br>❌ Limited features<br>❌ Donor tips requested</td>
                    </tr>
                    <tr>
                        <td>DonorBox</td>
                        <td>2.95% (or 1.75% with Pro)</td>
                        <td>2.9% + $0.30</td>
                        <td>$0 / $150</td>
                        <td>❌ $150/month for lower fees<br>❌ Add-ons cost extra ($8-$85/mo)<br>⚠ 5.85%+ total on free plan</td>
                    </tr>
                    <tr>
                        <td>Givebutter</td>
                        <td>0-5% (depends on campaign type)</td>
                        <td>2.9% + $0.30</td>
                        <td>$0</td>
                        <td>⚠ Relies on donor tips<br>⚠ 1-5% fee if tips disabled<br>❌ Pressure on donors</td>
                    </tr>
                    <tr>
                        <td>Classy</td>
                        <td>2-5%</td>
                        <td>2.9% + $0.30</td>
                        <td>$299+</td>
                        <td>❌ $299-$500+/month<br>❌ Complex pricing<br>❌ Enterprise focus</td>
                    </tr>
                    <tr>
                        <td>Fundly</td>
                        <td>0%</td>
                        <td>2.9% + $0.30</td>
                        <td>$0</td>
                        <td>❌ Limited customization<br>❌ No custom domains<br>❌ Basic features</td>
                    </tr>
                    <tr>
                        <td>Overflow</td>
                        <td>3%</td>
                        <td>Varies</td>
                        <td>$100-$208</td>
                        <td>❌ $1,200-$2,500/year<br>❌ Crypto/stock focus<br>❌ Not for standard donations</td>
                    </tr>
                    <tr>
                        <td>Kindest</td>
                        <td>0.5%+ (with donor coverage)</td>
                        <td>2.9% + $0.30</td>
                        <td>Varies</td>
                        <td>⚠ Relies on donor fee coverage<br>⚠ Actual fees unclear<br>❌ Limited transparency</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Cost Calculator -->
        <div class="calculator">
            <h3>See What You Keep with TektonStable</h3>
            <p style="margin-bottom: 30px; color: #666;">Based on a $100 donation</p>
            <div class="calculator-grid">
                <div class="calculator-item">
                    <div class="amount">$96.50</div>
                    <div class="label">TektonStable<br>(3.5% all-inclusive)</div>
                </div>
                <div class="calculator-item">
                    <div class="amount">$87.10</div>
                    <div class="label">Patreon<br>(10% + 2.9% + $0.30)</div>
                </div>
                <div class="calculator-item">
                    <div class="amount">$91.15</div>
                    <div class="label">DonorBox Free<br>(2.95% + 2.9% + $0.30)</div>
                </div>
                <div class="calculator-item">
                    <div class="amount">$97.10</div>
                    <div class="label">GoFundMe<br>(2.9% + $0.30, if no tips)</div>
                </div>
            </div>
        </div>
        
        <!-- Why TektonStable -->
        <div class="section">
            <h2>What Makes TektonStable Better?</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>💰 Transparent Pricing</h3>
                    <ul>
                        <li>One simple rate: 3.5%</li>
                        <li>No hidden fees or charges</li>
                        <li>No monthly subscriptions</li>
                        <li>No contracts or commitments</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h3>🎨 Full Customization</h3>
                    <ul>
                        <li>Custom branded website</li>
                        <li>Your own domain name</li>
                        <li>Complete design control</li>
                        <li>Professional appearance</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h3>✝️ Mission-Focused</h3>
                    <ul>
                        <li>Built specifically for missionaries</li>
                        <li>Supporter management tools</li>
                        <li>Prayer request features</li>
                        <li>Ministry updates system</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h3>🔒 Secure & Reliable</h3>
                    <ul>
                        <li>Powered by Stripe</li>
                        <li>PCI compliant</li>
                        <li>No payment data stored</li>
                        <li>24/7 uptime</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h3>📊 Complete Management</h3>
                    <ul>
                        <li>Donor database</li>
                        <li>Email notifications</li>
                        <li>Financial reporting</li>
                        <li>Tax receipts</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h3>🤝 No Donor Pressure</h3>
                    <ul>
                        <li>No tip requests to donors</li>
                        <li>Clean checkout experience</li>
                        <li>Professional presentation</li>
                        <li>Builds donor trust</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Missions Agencies -->
        <div class="missions-agencies">
            <h3>Why Not Use Your Mission Agency's System?</h3>
            <p>Many missionaries are required to fundraise through their sending organization (YWAM, OM, Cru, etc.), but these systems often have significant limitations:</p>
            <ul>
                <li><strong>No custom branding:</strong> Generic pages that look the same for every missionary</li>
                <li><strong>Limited control:</strong> Can't customize content, layout, or design</li>
                <li><strong>Basic features:</strong> Often just a donation form with minimal functionality</li>
                <li><strong>No direct access:</strong> You don't control your supporter data or communications</li>
                <li><strong>Rigid structure:</strong> Can't add your story, photos, videos the way you want</li>
                <li><strong>Poor mobile experience:</strong> Often not optimized for mobile donors</li>
            </ul>
            <p style="margin-top: 20px;"><strong>TektonStable complements your agency:</strong> Use your agency's official system for tax-deductible receipts and compliance, while TektonStable provides a professional, customizable presence for your supporters to connect with your ministry.</p>
        </div>
        
        <!-- CTA -->
        <div class="cta">
            <h2>Ready to Launch Your Campaign?</h2>
            <p>Join missionaries who are raising support more effectively with TektonStable</p>
            <button>Get Started Free</button>
        </div>
    </div>
</body>
</html>
$$,
updated_at = NOW()
WHERE slug = 'pricing-comparison';
