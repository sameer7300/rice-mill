import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
    <PolicyLayout title="Privacy Policy" updated="January 2026">
      <Helmet>
        <title>Privacy Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Learn how Al-Noor Rice Mills collects, uses, and protects your personal information." />
      </Helmet>

      <section id="introduction">
        <h2>1. Introduction</h2>
        <p>Al-Noor Rice Mills ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you visit our website or place an order with us.</p>
        <p>By using our site, you agree to the collection and use of information in accordance with this policy.</p>
      </section>

      <section id="information-we-collect">
        <h2>2. Information We Collect</h2>
        <p>We collect information you provide directly to us:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, phone number, email address, and delivery address when you register or place an order.</li>
          <li><strong>Order Data:</strong> Purchase history, order amounts, product preferences, and payment method types (we do not store full card numbers).</li>
          <li><strong>Device & Browser:</strong> IP address, browser type, and device information collected automatically for security and fraud prevention.</li>
          <li><strong>Location Data:</strong> City and area information if you use our location autocomplete feature during checkout.</li>
          <li><strong>Communications:</strong> Messages you send us via the contact form, WhatsApp, or email.</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>Processing and delivering your orders</li>
          <li>Sending order confirmation, status updates, and payment receipts via email and WhatsApp</li>
          <li>Calculating and awarding loyalty points</li>
          <li>Sending newsletters and promotional offers (only if you subscribed)</li>
          <li>Improving our website, products, and customer experience</li>
          <li>Fraud prevention and account security</li>
          <li>Responding to your inquiries and support requests</li>
        </ul>
      </section>

      <section id="information-sharing">
        <h2>4. Information Sharing</h2>
        <p>We <strong>never sell your personal data</strong> to third parties. We may share limited information only in these situations:</p>
        <ul>
          <li><strong>Delivery Couriers:</strong> We share your name and delivery address with courier services (TCS, Leopards) solely to complete your delivery.</li>
          <li><strong>Legal Requirements:</strong> If required by Pakistani law or court order.</li>
        </ul>
      </section>

      <section id="data-security">
        <h2>5. Data Security</h2>
        <ul>
          <li>Passwords are hashed using <strong>bcrypt</strong> — we never store plain-text passwords</li>
          <li>Authentication uses signed <strong>JWT tokens</strong> with expiration</li>
          <li>Optional <strong>Two-Factor Authentication (2FA)</strong> available via authenticator apps</li>
          <li>Account lockout after 5 failed login attempts (15-minute cooldown)</li>
        </ul>
        <p>While we use industry-standard security, no method of transmission over the internet is 100% secure.</p>
      </section>

      <section id="cookies">
        <h2>6. Cookies & Local Storage</h2>
        <ul>
          <li><strong>Cart:</strong> Your shopping cart is stored in browser localStorage — it persists until you clear it or complete checkout.</li>
          <li><strong>Session Token:</strong> Your login token is stored in localStorage. It expires after 7 days.</li>
          <li><strong>Recently Viewed:</strong> A session ID is stored in localStorage to track recently viewed products — no personal data linked unless you're signed in.</li>
          <li>We use <strong>no third-party tracking cookies</strong> or advertising cookies.</li>
        </ul>
      </section>

      <section id="your-rights">
        <h2>7. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data by emailing us</li>
          <li><strong>Correction:</strong> Update your information at any time via <Link to="/dashboard" className="text-green-700 hover:underline">My Account</Link></li>
          <li><strong>Deletion:</strong> Request account deletion by contacting us — we'll remove your data within 30 days</li>
          <li><strong>Unsubscribe:</strong> Opt out of marketing emails by visiting our <Link to="/policies" className="text-green-700 hover:underline">Policies page</Link> unsubscribe link</li>
        </ul>
      </section>

      <section id="childrens-privacy">
        <h2>8. Children's Privacy</h2>
        <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us data, please contact us immediately.</p>
      </section>

      <section id="changes">
        <h2>9. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We'll notify registered users by email of significant changes. Continued use of our site after changes constitutes acceptance.</p>
      </section>

      <section id="contact">
        <h2>10. Contact Us</h2>
        <p>For privacy-related questions or requests:</p>
        <ul>
          <li><strong>Al-Noor Rice Mills</strong></li>
          <li>Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200</li>
          <li>📞 +92-946-123456</li>
          <li>📱 WhatsApp: +92-300-1234567</li>
          <li>✉️ ricemill@sameergul.com</li>
        </ul>
      </section>
    </PolicyLayout>
    </PageTransition>
  );
}
