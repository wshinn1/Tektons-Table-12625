export const metadata = {
  title: "Privacy Policy | Tektons Table",
  description: "Privacy Policy for Tektons Table fundraising platform",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 20, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Tektons Table ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our fundraising platform.
            </p>
            <p className="mt-4">
              By using Tektons Table, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address</li>
              <li>Organization or ministry name</li>
              <li>Profile information (bio, mission statement, photo)</li>
              <li>Preferred language</li>
              <li>Nonprofit status (if applicable)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Donor Information</h3>
            <p>When donors contribute through your page, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Donor name and email address</li>
              <li>Donation amount and frequency</li>
              <li>Optional message or note</li>
              <li>Contact preferences</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.3 Payment Information</h3>
            <p className="font-medium">IMPORTANT: We DO NOT collect, store, or process payment card information.</p>
            <p className="mt-2">
              All payment processing is handled directly by Stripe, Inc. Payment card numbers, CVV codes, and banking
              information are transmitted directly to Stripe and never touch our servers. Stripe is PCI-DSS Level 1
              certified.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">2.4 Usage Data</h3>
            <p>We automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address and browser information</li>
              <li>Pages visited and actions taken</li>
              <li>Time and date of visits</li>
              <li>Referring website</li>
              <li>Device and operating system information</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.5 Cookies and Tracking</h3>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the fundraising platform</li>
              <li>Process and facilitate donations</li>
              <li>Communicate with you about your account</li>
              <li>Send transactional emails (donation receipts, notifications)</li>
              <li>Provide customer support</li>
              <li>Improve and optimize the platform</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
              <li>Send optional marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">4.1 Service Providers</h3>
            <p>We share information with trusted third-party service providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Stripe:</strong> Payment processing (see Stripe's Privacy Policy)
              </li>
              <li>
                <strong>Supabase:</strong> Database hosting and authentication
              </li>
              <li>
                <strong>Vercel:</strong> Web hosting and infrastructure
              </li>
              <li>
                <strong>Resend:</strong> Email delivery services
              </li>
            </ul>
            <p className="mt-4">
              These providers have access only to information necessary to perform their functions and are obligated to
              protect your data.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.2 With Your Consent</h3>
            <p>
              We may share information when you explicitly consent, such as when you choose to share your fundraising
              page publicly or send newsletters to your donors.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.3 Legal Requirements</h3>
            <p>We may disclose information if required by law or to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with legal processes or government requests</li>
              <li>Enforce our Terms and Conditions</li>
              <li>Protect our rights, privacy, safety, or property</li>
              <li>Investigate potential violations</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">4.4 Business Transfers</h3>
            <p>
              If Tektons Table is involved in a merger, acquisition, or sale of assets, your information may be
              transferred. We will notify you before your information becomes subject to a different privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted databases with row-level security (RLS)</li>
              <li>Secure authentication via Supabase</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
              <li>Secure server infrastructure</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your
              information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">6.1 Access and Correction</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Update your account details</li>
              <li>Export your donor data</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">6.2 Data Deletion</h3>
            <p>
              You can request deletion of your account and associated data at any time. We will retain some information
              as required by law or for legitimate business purposes (e.g., financial records, fraud prevention).
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">6.3 Marketing Communications</h3>
            <p>
              You can opt out of marketing emails by clicking the unsubscribe link in any email or adjusting your
              account settings. You cannot opt out of transactional emails related to your account or donations.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">6.4 Cookie Preferences</h3>
            <p>
              You can control cookie settings through your browser. Note that disabling cookies may limit platform
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>We retain your information for as long as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your account is active</li>
              <li>Needed to provide services</li>
              <li>Required by law (e.g., tax records for 7 years)</li>
              <li>Necessary to resolve disputes or enforce agreements</li>
            </ul>
            <p className="mt-4">
              After account deletion, we will delete or anonymize your information within 90 days, except for records we
              must retain by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have different data protection laws. By using Tektons Table, you consent to such
              transfers.
            </p>
            <p className="mt-4">
              We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy
              Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              Tektons Table is not intended for individuals under 18 years of age. We do not knowingly collect
              information from children. If you believe we have collected information from a child, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. California Privacy Rights (CCPA)</h2>
            <p>California residents have additional rights under the CCPA:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access your personal information</li>
              <li>Right to equal service and price</li>
            </ul>
            <p className="mt-4 font-medium">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. European Privacy Rights (GDPR)</h2>
            <p>If you are in the European Economic Area, you have rights under GDPR:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at privacy@tektonstable.com.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or
              through a notice on the platform. The "Last Updated" date at the top will be revised.
            </p>
            <p className="mt-4">
              Continued use of the platform after changes become effective constitutes acceptance of the updated Privacy
              Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p>Tektons Table Privacy Team</p>
              <p>Email: privacy@tektonstable.com</p>
              <p>Support Email: support@tektonstable.com</p>
              <p>Website: tektonstable.com</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/5 border-l-4 border-primary rounded">
            <p className="font-semibold mb-2">Privacy Highlights:</p>
            <ul className="space-y-2">
              <li>✓ We never store your payment card information</li>
              <li>✓ All financial data handled by Stripe (PCI-DSS compliant)</li>
              <li>✓ Your data is encrypted and secured</li>
              <li>✓ You control your information and can export or delete it</li>
              <li>✓ We don't sell your data to third parties</li>
              <li>✓ Compliant with GDPR, CCPA, and other privacy laws</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
