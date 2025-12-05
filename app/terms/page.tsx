export const metadata = {
  title: "Terms and Conditions | Tektons Table",
  description: "Terms and Conditions for using Tektons Table fundraising platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 20, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Tektons Table ("Platform", "Service", "we", "us", or "our"), you agree to be bound
              by these Terms and Conditions. If you do not agree to these terms, you may not use the Service.
            </p>
            <p>
              Tektons Table is a fundraising platform designed for missionaries, ministries, and registered 501(c)(3)
              nonprofit organizations to accept donations and manage supporter relationships.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility and Account Registration</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Eligibility</h3>
            <p>To use Tektons Table, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Be a missionary, ministry, or registered 501(c)(3) nonprofit organization</li>
              <li>Have the legal authority to enter into this agreement</li>
              <li>Comply with all applicable local, state, national, and international laws</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You agree to notify us immediately of any unauthorized access or security
              breach.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How the Platform Works</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">3.1 Platform Services</h3>
            <p>Tektons Table provides:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A personalized fundraising website (subdomain: yourname.tektonstable.com)</li>
              <li>Donation processing through Stripe payment gateway</li>
              <li>Donor management and communication tools</li>
              <li>Blog and newsletter capabilities</li>
              <li>Fundraising analytics and reporting</li>
              <li>Multi-language support (14 languages)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">3.2 Payment Processing</h3>
            <p>
              All donations and payments are processed through Stripe, Inc. ("Stripe"), a third-party payment processor.
              By using Tektons Table, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe's Services Agreement and terms of service</li>
              <li>Connect your own Stripe account to receive funds</li>
              <li>Comply with all Stripe requirements and policies</li>
              <li>Provide accurate bank account information for payouts</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">3.3 Financial Flow</h3>
            <p className="font-medium">
              IMPORTANT: Tektons Table DOES NOT store, hold, or have access to any donated funds. Here's how money
              flows:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Donors make payments through your fundraising page</li>
              <li>Payments go directly to your connected Stripe account</li>
              <li>Stripe processes the payment and applies its fees</li>
              <li>
                Stripe transfers funds to your connected bank account on their payout schedule (typically 2-7 business
                days)
              </li>
              <li>You have full control over your funds through your Stripe dashboard</li>
            </ol>
            <p className="mt-4">
              We never touch your funds. All financial data and transaction records are maintained by Stripe, not by
              Tektons Table.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Platform Fees and Pricing</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">4.1 Platform Maintenance Fee</h3>
            <p>
              Tektons Table charges a <strong>3.5% platform maintenance fee</strong> on all donations processed through
              the platform. This fee covers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform hosting and infrastructure costs</li>
              <li>Software maintenance and updates</li>
              <li>Security and compliance measures</li>
              <li>Customer support services</li>
              <li>Feature development and improvements</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">4.2 How Fees Are Applied</h3>
            <p>When a donor contributes, the following fees apply:</p>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-medium">Example: $100 donation</p>
              <ul className="mt-2 space-y-1">
                <li>
                  Stripe Standard Rate: 2.9% + $0.30 = <strong>$3.20</strong>
                </li>
                <li>
                  Tektons Table Fee: 3.5% = <strong>$3.50</strong>
                </li>
                <li className="font-semibold pt-2 border-t">You receive: $93.30</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-medium">Example with Nonprofit Discount: $100 donation</p>
              <ul className="mt-2 space-y-1">
                <li>
                  Stripe Nonprofit Rate: 2.2% + $0.30 = <strong>$2.50</strong>
                </li>
                <li>
                  Tektons Table Fee: 3.5% = <strong>$3.50</strong>
                </li>
                <li className="font-semibold pt-2 border-t">You receive: $94.00</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-4 mb-2">4.3 Fee Acceptance</h3>
            <p>
              By creating an account and using Tektons Table, you explicitly acknowledge and agree to the 3.5% platform
              maintenance fee on all donations. This fee is automatically deducted by Stripe before funds reach your
              bank account.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.4 Stripe Fees</h3>
            <p>In addition to our platform fee, Stripe charges its own processing fees:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Standard Rate:</strong> 2.9% + $0.30 per successful transaction
              </li>
              <li>
                <strong>Nonprofit Rate:</strong> 2.2% + $0.30 per successful transaction (if approved by Stripe)
              </li>
              <li>International card fees may apply for non-US cards</li>
              <li>Currency conversion fees may apply for non-USD transactions</li>
            </ul>
            <p className="mt-4">
              To qualify for Stripe's nonprofit discount, you must apply directly through Stripe and provide 501(c)(3)
              verification documents. This can save you 0.7% per transaction.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.5 Fee Changes</h3>
            <p>
              We reserve the right to modify our platform fee with 30 days' advance notice. Continued use of the Service
              after fee changes constitutes acceptance of the new fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">5.1 Fundraising Compliance</h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accurately represent your mission and fundraising purpose</li>
              <li>Comply with all charitable solicitation laws in your jurisdiction</li>
              <li>Properly acknowledge and receipt all donations</li>
              <li>Use donated funds only for stated purposes</li>
              <li>Maintain proper financial records and reporting</li>
              <li>Provide tax receipts where applicable and legally required</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">5.2 Content Standards</h3>
            <p>You are solely responsible for all content posted on your fundraising page, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Profile information and mission statements</li>
              <li>Blog posts and newsletters</li>
              <li>Photos and media</li>
              <li>Communication with donors</li>
            </ul>
            <p className="mt-4">All content must be accurate, lawful, and not violate any third-party rights.</p>

            <h3 className="text-xl font-medium mt-4 mb-2">5.3 Stripe Account Management</h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Connect a valid Stripe account to receive donations</li>
              <li>Keep your Stripe account in good standing</li>
              <li>Respond promptly to Stripe verification requests</li>
              <li>Handle any disputes or chargebacks through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <p>You may not use Tektons Table to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Engage in fraudulent or deceptive fundraising</li>
              <li>Misrepresent your identity, mission, or use of funds</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Harass, abuse, or harm others</li>
              <li>Circumvent platform fees or payment processing</li>
              <li>Use automated systems to scrape or collect data</li>
              <li>Fundraise for illegal activities or prohibited causes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">7.1 Platform Ownership</h3>
            <p>
              Tektons Table and all related trademarks, logos, and service marks are owned by us. The platform's code,
              design, and functionality are protected by copyright and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">7.2 Your Content</h3>
            <p>
              You retain ownership of all content you create on the platform. By using Tektons Table, you grant us a
              limited license to display and distribute your content as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data and Privacy</h2>
            <p>
              Your use of Tektons Table is also governed by our Privacy Policy, which describes how we collect, use, and
              protect your personal information and donor data.
            </p>
            <p className="mt-4">Key privacy points:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We use Supabase for secure database hosting</li>
              <li>All payment data is handled exclusively by Stripe (PCI-DSS compliant)</li>
              <li>We implement industry-standard security measures</li>
              <li>You control your donor data and can export it at any time</li>
              <li>We comply with GDPR, CCPA, and other privacy regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">9.1 Service Availability</h3>
            <p>
              Tektons Table is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. We do not guarantee
              uninterrupted, error-free, or secure service. We may modify, suspend, or discontinue any part of the
              Service at any time.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">9.2 Financial Disclaimer</h3>
            <p>We are not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe's processing of payments or transfers to your bank</li>
              <li>Stripe's fee structure or changes</li>
              <li>Delays in payouts or holds placed by Stripe</li>
              <li>Tax reporting or compliance (you are responsible for your own taxes)</li>
              <li>Disputes between you and your donors</li>
              <li>Chargebacks or refund requests</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">9.3 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TEKTONS TABLE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
              OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mt-4">
              Our total liability shall not exceed the amount of platform fees you paid in the 12 months preceding the
              claim, or $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Tektons Table, its affiliates, and their respective officers,
              directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including
              legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your fundraising activities and use of donated funds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Account Termination</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">11.1 Termination by You</h3>
            <p>
              You may terminate your account at any time through your account settings or by contacting support. You
              remain responsible for all fees incurred before termination.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">11.2 Termination by Us</h3>
            <p>We reserve the right to suspend or terminate your account if you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Fail to maintain a connected Stripe account</li>
              <li>Receive excessive complaints or disputes</li>
              <li>Use the Service in a way that harms us or other users</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">11.3 Effect of Termination</h3>
            <p>
              Upon termination, your access to the platform will be revoked. You may request an export of your donor
              data within 30 days. We are not responsible for any ongoing Stripe payouts or transfers after termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">12.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without
              regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">12.2 Arbitration</h3>
            <p>
              Any dispute arising from these Terms or your use of the Service shall be resolved through binding
              arbitration, except for disputes that may be brought in small claims court. You waive your right to
              participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email or through
              the platform. Continued use of the Service after changes become effective constitutes acceptance of the
              new Terms.
            </p>
            <p className="mt-4">You can always view the current Terms at tektonstable.com/terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">14.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Tektons
              Table regarding the Service.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">14.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in
              full force and effect.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">14.3 Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
              rights.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">14.4 Assignment</h3>
            <p>
              You may not assign these Terms without our prior written consent. We may assign these Terms without
              restriction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p>If you have questions about these Terms, please contact us at:</p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p>Tektons Table Support</p>
              <p>Email: support@tektonstable.com</p>
              <p>Website: tektonstable.com</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border-l-4 border-primary rounded">
            <p className="font-semibold mb-2">Key Takeaways:</p>
            <ul className="space-y-2">
              <li>✓ 3.5% platform fee + Stripe fees apply to all donations</li>
              <li>✓ Funds go directly to your Stripe account, never stored by us</li>
              <li>✓ You control all payouts through your connected bank</li>
              <li>✓ Apply for Stripe nonprofit discount to save 0.7% per transaction</li>
              <li>✓ You're responsible for tax reporting and compliance</li>
              <li>✓ Keep your fundraising accurate and lawful</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
