import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>Privacy Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Comprehensive privacy policy covering data collection, use, cookies, GDPR rights, and security practices for Al-Noor Rice Mills." />
      </Helmet>
      <PolicyLayout title="Privacy Policy" updated="1 May 2026" badge="GDPR · PDPA Aligned"
        icon={<Shield size={22} className="text-white" />}>

        <div className="callout callout-green">
          <strong>Summary for busy readers:</strong> We collect your name, contact details, and order history to run our service. We use IP-based geolocation to set your currency automatically. Analytics cookies are optional and require your consent. You can download your own data any time from your account. We never sell your data. This policy is governed by Pakistani law and aligned with GDPR principles for our international customers.
        </div>

        {/* ─── 1 ─────────────────────────────────────────────────────────── */}
        <h2>1. Introduction and Scope</h2>

        <h3>1.1 Who We Are</h3>
        <p>Al-Noor Rice Mills ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is a family-owned rice milling and retail business established in 2010 and operating from Batkhela, Malakand, Khyber Pakhtunkhwa, Pakistan. We operate the website <a href="https://alnoorice.pk" target="_blank" rel="noreferrer">alnoorice.pk</a> and all associated sub-domains, mobile experiences, and digital services.</p>

        <h3>1.2 Purpose of This Policy</h3>
        <p>This Privacy Policy explains how Al-Noor Rice Mills collects, uses, stores, shares, and protects personal data belonging to visitors, registered users, customers, job applicants, and wholesale partners who interact with our website and services. It also describes the rights you have over your personal data and how to exercise them.</p>

        <h3>1.3 Applicability</h3>
        <p>This policy applies to:</p>
        <ul>
          <li>All visitors to <a href="https://alnoorice.pk">alnoorice.pk</a>, regardless of country</li>
          <li>Registered account holders (customers, staff, suppliers)</li>
          <li>Individuals who contact us via form, email, phone, or live chat</li>
          <li>Job applicants who submit applications through our Careers page</li>
          <li>Wholesale and business partners submitting inquiries</li>
          <li>Newsletter subscribers</li>
        </ul>
        <p>This policy does not apply to third-party websites linked from our pages. We are not responsible for the privacy practices of external sites.</p>

        <h3>1.4 Legal Framework</h3>
        <p>Our privacy practices are governed primarily by the laws of the Islamic Republic of Pakistan, including the <strong>Prevention of Electronic Crimes Act 2016 (PECA)</strong> and applicable consumer protection legislation. For customers located in the European Economic Area (EEA), the United Kingdom, or other jurisdictions with comprehensive data protection laws, we align our practices with the <strong>General Data Protection Regulation (GDPR EU 2016/679)</strong> and its national implementations. Where Pakistani law and GDPR conflict, we apply the higher standard of protection.</p>

        <h3>1.5 Definitions</h3>
        <p>Throughout this policy, the following terms have the meanings set out below:</p>
        <ul>
          <li><strong>Personal Data:</strong> Any information that identifies or can identify a natural person directly or indirectly, including name, email, IP address, and order history.</li>
          <li><strong>Processing:</strong> Any operation performed on personal data — collection, storage, use, sharing, deletion, or any other action.</li>
          <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data — in this case, Al-Noor Rice Mills.</li>
          <li><strong>Data Processor:</strong> A third party that processes personal data on our behalf (e.g., Stripe for payments).</li>
          <li><strong>Consent:</strong> A freely given, specific, informed, and unambiguous indication of your agreement to processing.</li>
          <li><strong>Legitimate Interest:</strong> A legal basis for processing where we have a genuine business need that is not overridden by your rights and interests.</li>
        </ul>

        {/* ─── 2 ─────────────────────────────────────────────────────────── */}
        <h2>2. Data Controller and Contact Information</h2>

        <h3>2.1 Data Controller</h3>
        <p>Al-Noor Rice Mills acts as the <strong>Data Controller</strong> for all personal data collected through this website.</p>
        <ul>
          <li><strong>Legal Name:</strong> Al-Noor Rice Mills</li>
          <li><strong>Address:</strong> Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan</li>
          <li><strong>Phone:</strong> +92-946-123456</li>
          <li><strong>Email:</strong> <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a></li>
          <li><strong>Business Hours:</strong> Monday–Saturday, 8:00 AM – 6:00 PM PKT</li>
        </ul>

        <h3>2.2 Privacy Enquiries</h3>
        <p>For any questions, concerns, or requests relating to this Privacy Policy or your personal data, please contact us at <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a> with the subject line "<strong>Privacy Request — [Your Name]</strong>". We aim to respond to all privacy-related enquiries within <strong>72 hours</strong> and to complete any data subject request within <strong>30 calendar days</strong>.</p>

        {/* ─── 3 ─────────────────────────────────────────────────────────── */}
        <h2>3. Personal Data We Collect</h2>

        <h3>3.1 Data You Provide Directly</h3>
        <p>We collect the following categories of personal data that you provide when using our services:</p>
        <ul>
          <li><strong>Registration &amp; Account Data:</strong> Full name, email address, phone number (with international dial code), and hashed password when you create an account.</li>
          <li><strong>Order &amp; Transaction Data:</strong> Delivery name, address (street, city, state, postal code, country), phone number, payment method type, order contents, quantities, prices, and order history.</li>
          <li><strong>Payment Data:</strong> Card payments are processed entirely by Stripe, Inc. We receive only a tokenised payment confirmation and do not store any card number, expiry date, or CVV on our servers.</li>
          <li><strong>Saved Addresses:</strong> Multiple delivery addresses you choose to store in your account, including home, office, farm, or other label.</li>
          <li><strong>Saved Payment Methods:</strong> Saved method type and masked account information (e.g., ****7890) for non-card methods (EasyPaisa, JazzCash). No card data is ever saved.</li>
          <li><strong>Communication Data:</strong> Messages sent through our live chat system, contact form submissions, email correspondence, WhatsApp messages you send us, and wholesale inquiry forms.</li>
          <li><strong>Reviews &amp; Ratings:</strong> Product reviews and ratings you submit, including your rating (1–5 stars) and written comments.</li>
          <li><strong>Job Application Data:</strong> Full name, email, phone number, CV/résumé file, cover letter, LinkedIn or portfolio URL, expected salary, notice period, and any other information included in your application.</li>
          <li><strong>Newsletter Subscription:</strong> Email address when you subscribe to marketing communications.</li>
          <li><strong>Loyalty Programme Data:</strong> Points earned, redeemed, and referral relationships when using our loyalty and referral scheme.</li>
          <li><strong>Account Security Data:</strong> Two-factor authentication setup (authenticator app secret, hashed backup codes), session tokens, and login timestamps.</li>
        </ul>

        <h3>3.2 Data Collected Automatically</h3>
        <p>When you visit our website, we may automatically collect the following information. The extent of collection depends on your cookie consent choices:</p>
        <ul>
          <li><strong>IP Address:</strong> Your internet protocol address. We use this to detect your approximate country for currency and shipping zone auto-selection. This is done on every visit regardless of cookie consent (essential function). With analytics consent, your IP is also stored against your visit record for up to 12 months.</li>
          <li><strong>Geolocation (derived):</strong> Country, city, region, and timezone inferred from your IP address via the ipinfo.io service. Latitude and longitude coordinates are stored only with analytics consent.</li>
          <li><strong>Device Information:</strong> Device type (mobile / tablet / desktop), browser name and version, operating system. Collected only with analytics consent.</li>
          <li><strong>Session Identifier:</strong> A randomly generated UUID stored in your browser's localStorage. This pseudonymous identifier links page views within a session without identifying you personally. It is always collected as it is essential for cart and session management.</li>
          <li><strong>Page View Data:</strong> Pages visited, time spent on each page, search queries entered, product pages viewed, and navigation paths. Collected only with analytics consent.</li>
          <li><strong>Referrer:</strong> The URL of the webpage that linked you to our site. Collected only with analytics consent.</li>
          <li><strong>Technical Logs:</strong> Server-side error logs for debugging. These may contain IP addresses and are retained for 30 days.</li>
        </ul>

        <h3>3.3 Data Received from Third Parties</h3>
        <ul>
          <li><strong>Stripe:</strong> Payment confirmation status, payment intent ID, and fraud signals. We do not receive card details.</li>
          <li><strong>ipinfo.io:</strong> Country, city, region, timezone, and ISP name derived from your IP address.</li>
          <li><strong>Referral Programme:</strong> If someone refers you using their referral code, we record the referral relationship.</li>
        </ul>

        <h3>3.4 Data We Do Not Collect</h3>
        <p>We do not collect, process, or store any of the following without explicit, specific consent:</p>
        <ul>
          <li>Sensitive personal data (health, biometric, racial, religious, or political data)</li>
          <li>Full payment card numbers, CVVs, or expiry dates</li>
          <li>Precise GPS location (only approximate country/city from IP)</li>
          <li>Personal data of children under 13</li>
          <li>Social media profile data (beyond what you voluntarily share in contact forms)</li>
        </ul>

        {/* ─── 4 ─────────────────────────────────────────────────────────── */}
        <h2>4. Cookies and Tracking Technologies</h2>

        <h3>4.1 What Are Cookies</h3>
        <p>Cookies are small text files placed in your browser when you visit a website. We also use localStorage (browser storage) for certain functions. Both serve similar purposes but behave slightly differently: cookies are sent to the server with each request, while localStorage data stays in your browser.</p>

        <h3>4.2 Cookie Categories We Use</h3>
        <table>
          <thead><tr><th>Category</th><th>Description</th><th>Examples</th><th>Can be declined?</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Essential</strong></td>
              <td>Required for the site to function. Without these, core features such as login, cart, and checkout are unavailable.</td>
              <td>Authentication JWT token, cart contents (localStorage), session UUID (localStorage), CSRF protection, cookie consent record</td>
              <td>No — always active</td>
            </tr>
            <tr>
              <td><strong>Analytics</strong></td>
              <td>Help us understand how visitors use the site so we can improve it. Collected only with your consent.</td>
              <td>IP address (stored), page views, visit duration, device type, browser, city/country, referrer URL</td>
              <td>Yes — opt-in</td>
            </tr>
            <tr>
              <td><strong>Marketing</strong></td>
              <td>Used for personalised advertising and promotions. Not currently active but reserved for future use.</td>
              <td>Ad tracking pixels, retargeting identifiers</td>
              <td>Yes — opt-in (currently inactive)</td>
            </tr>
          </tbody>
        </table>

        <h3>4.3 Your Consent Choices</h3>
        <p>On your first visit, a cookie banner appears with two options:</p>
        <ul>
          <li><strong>"Accept Essential Only"</strong> — Only essential cookies and localStorage are used. Analytics data (IP, device, page views) is not collected or stored. Currency and country detection still work (IP lookup is performed but not stored).</li>
          <li><strong>"Accept All"</strong> — Essential plus analytics cookies. Your visit data is recorded to help us improve the site. We do not sell this data to any advertiser.</li>
        </ul>
        <p>Your choice is stored in your browser's localStorage and applied immediately. You can change your preference by clearing your browser's site data or by contacting us.</p>

        <h3>4.4 Third-Party Cookies</h3>
        <p>Stripe may set cookies as part of the payment process. These are governed by <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">Stripe's Privacy Policy</a> and are classified as essential (required for payment processing).</p>

        <h3>4.5 How to Block All Cookies</h3>
        <p>You can configure your browser to block all cookies. However, doing so will prevent you from logging in, adding items to cart, or completing checkout. Browser instructions:</p>
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings → Privacy &amp; Security → Enhanced Tracking Protection</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Block all cookies</li>
          <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
        </ul>

        {/* ─── 5 ─────────────────────────────────────────────────────────── */}
        <h2>5. How We Use Your Personal Data</h2>

        <h3>5.1 Order Fulfilment and Service Delivery</h3>
        <p>We use your contact details, delivery address, and order data to process your purchase, arrange shipping, issue tracking information, send order confirmation and dispatch notifications via email and/or WhatsApp, and resolve any delivery issues that arise.</p>

        <h3>5.2 Account Management</h3>
        <p>We use your account data to maintain your login session, facilitate password resets (via email link or WhatsApp OTP), manage two-factor authentication, store your saved addresses and payment methods, and allow you to view your order history and loyalty points balance.</p>

        <h3>5.3 Payment Processing</h3>
        <p>Payment card data is transmitted directly to Stripe, Inc. and is never seen or stored by our servers. For non-card methods (bank transfer, EasyPaisa, JazzCash, or international bank wire), we store only the payment method type and whether the payment was received. Our accounts team uses order payment status to manage dispatch.</p>

        <h3>5.4 Customer Support and Communications</h3>
        <p>We use your personal data to respond to enquiries submitted through our contact form, live chat, email, or WhatsApp. We retain this correspondence to maintain a service history and to improve the quality of future responses.</p>

        <h3>5.5 Notifications and Alerts</h3>
        <p>With your phone number or email address, we may send:</p>
        <ul>
          <li>Order confirmation messages</li>
          <li>Dispatch and delivery status updates</li>
          <li>Payment received confirmations</li>
          <li>Stock availability alerts (if you subscribed to a specific product)</li>
          <li>Review approval or rejection notifications</li>
          <li>Interview scheduling notifications (for job applicants)</li>
        </ul>
        <p>You can opt out of non-essential notifications by contacting us or updating your notification preferences.</p>

        <h3>5.6 Analytics and Site Improvement</h3>
        <p>With analytics consent, we use aggregated and pseudonymised visit data (page views, device types, geographic distribution, popular products) to understand how our site is used, which content is helpful, and where the user experience can be improved. This analysis is performed internally and is not shared with advertising networks.</p>

        <h3>5.7 Loyalty and Referral Programme</h3>
        <p>We use your purchase history to calculate loyalty points earned and your referral code to attribute new registrations. This data is retained for the lifetime of your account and any loyalty points are associated with your email address.</p>

        <h3>5.8 Fraud Prevention and Security</h3>
        <p>We process IP addresses, login timestamps, device fingerprints (device type + browser combination), and failed login attempts to detect and prevent fraudulent activity, account takeovers, and abuse of our platform. An account is temporarily locked after 5 consecutive failed login attempts.</p>

        <h3>5.9 Legal and Regulatory Compliance</h3>
        <p>We are required by Pakistani tax law and commercial regulations to retain certain order, payment, and customer records for a minimum of 7 years. This is a legal obligation and we cannot delete this data upon request within that retention window.</p>

        <h3>5.10 Marketing (with consent only)</h3>
        <p>If you subscribe to our newsletter or opt in to marketing communications, we use your email address to send promotional emails about new products, seasonal harvests, and special offers. You can unsubscribe at any time using the link in any email or by contacting us directly. We do not send marketing messages via WhatsApp without explicit prior consent.</p>

        {/* ─── 6 ─────────────────────────────────────────────────────────── */}
        <h2>6. Legal Basis for Processing</h2>

        <h3>6.1 Overview</h3>
        <p>Under GDPR and similar data protection frameworks, every act of processing personal data must have a lawful basis. The following table maps each processing purpose to its legal basis:</p>
        <table>
          <thead><tr><th>Processing Purpose</th><th>Legal Basis (GDPR Art. 6)</th></tr></thead>
          <tbody>
            <tr><td>Processing and fulfilling orders</td><td>Art. 6(1)(b) — Performance of a contract</td></tr>
            <tr><td>Creating and managing a user account</td><td>Art. 6(1)(b) — Performance of a contract</td></tr>
            <tr><td>Sending order and shipping notifications</td><td>Art. 6(1)(b) — Performance of a contract</td></tr>
            <tr><td>Analytics and page-view tracking</td><td>Art. 6(1)(a) — Consent</td></tr>
            <tr><td>Newsletter and marketing emails</td><td>Art. 6(1)(a) — Consent</td></tr>
            <tr><td>Fraud prevention and account security</td><td>Art. 6(1)(f) — Legitimate interests</td></tr>
            <tr><td>Improving website usability</td><td>Art. 6(1)(f) — Legitimate interests</td></tr>
            <tr><td>Retaining order records for tax purposes</td><td>Art. 6(1)(c) — Legal obligation</td></tr>
            <tr><td>Processing job applications</td><td>Art. 6(1)(b) — Pre-contractual steps</td></tr>
            <tr><td>IP geolocation for currency/shipping defaults</td><td>Art. 6(1)(f) — Legitimate interests (improves UX; no storage without analytics consent)</td></tr>
          </tbody>
        </table>

        <h3>6.2 Legitimate Interests Assessment</h3>
        <p>Where we rely on legitimate interests, we have assessed that our interests in running a secure and functional e-commerce service do not outweigh your fundamental rights and freedoms. You have the right to object to processing based on legitimate interests at any time (see Section 10).</p>

        {/* ─── 7 ─────────────────────────────────────────────────────────── */}
        <h2>7. Sharing and Disclosing Personal Data</h2>

        <h3>7.1 Our Commitment</h3>
        <div className="callout callout-green"><strong>We do not sell, rent, or trade your personal data to any third party for their own commercial purposes. Full stop.</strong></div>

        <h3>7.2 Service Providers and Data Processors</h3>
        <p>We share personal data with the following service providers strictly to the extent necessary for them to perform their services on our behalf. All are bound by data processing agreements or their own published privacy commitments:</p>
        <table>
          <thead><tr><th>Provider</th><th>Purpose</th><th>Data Shared</th><th>Country</th></tr></thead>
          <tbody>
            <tr><td><strong>Stripe, Inc.</strong></td><td>Card payment processing</td><td>Name, email, billing details (transmitted directly by your browser)</td><td>United States</td></tr>
            <tr><td><strong>UltraMsg / WhatsApp</strong></td><td>WhatsApp notification delivery</td><td>Phone number, message content</td><td>United States</td></tr>
            <tr><td><strong>Hostinger SMTP</strong></td><td>Transactional email delivery</td><td>Email address, name, email content</td><td>Lithuania / EU</td></tr>
            <tr><td><strong>ipinfo.io</strong></td><td>IP geolocation for UX defaults</td><td>IP address (your request's source)</td><td>United States</td></tr>
            <tr><td><strong>TCS Courier</strong></td><td>Domestic parcel delivery</td><td>Recipient name, address, phone</td><td>Pakistan</td></tr>
            <tr><td><strong>Leopards Courier</strong></td><td>Domestic parcel delivery</td><td>Recipient name, address, phone</td><td>Pakistan</td></tr>
            <tr><td><strong>DHL / FedEx</strong></td><td>International parcel delivery</td><td>Recipient name, address, phone, declared contents, value</td><td>Germany / United States</td></tr>
            <tr><td><strong>ExchangeRate-API</strong></td><td>Currency conversion rates</td><td>No personal data — rate lookup only</td><td>United States</td></tr>
          </tbody>
        </table>

        <h3>7.3 Legal Disclosures</h3>
        <p>We may disclose personal data without your consent where required to:</p>
        <ul>
          <li>Comply with a valid court order, subpoena, or legal process served on us</li>
          <li>Respond to a lawful request by Pakistani law enforcement authorities</li>
          <li>Protect and defend the rights, property, or safety of Al-Noor Rice Mills, our customers, or the public</li>
          <li>Investigate, detect, or prevent fraud or security incidents</li>
        </ul>
        <p>Where permitted by law, we will attempt to notify you before disclosing your data to authorities.</p>

        <h3>7.4 Business Transfers</h3>
        <p>If Al-Noor Rice Mills undergoes a merger, acquisition, restructuring, or sale of assets, your personal data may be transferred as part of that transaction. We will notify you via email at least 30 days before any such transfer takes effect and will ensure the receiving party agrees to honour this Privacy Policy or provide equivalent protection.</p>

        {/* ─── 8 ─────────────────────────────────────────────────────────── */}
        <h2>8. International Data Transfers</h2>

        <h3>8.1 Where Your Data Goes</h3>
        <p>Our primary server and database operate in Pakistan. However, because our service providers are global, your personal data may be processed in the United States, European Union, and other jurisdictions when those providers handle it.</p>

        <h3>8.2 Safeguards</h3>
        <p>For transfers outside Pakistan to jurisdictions without an equivalent level of data protection, we rely on one or more of the following safeguards:</p>
        <ul>
          <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>The provider's adherence to the EU-US Data Privacy Framework (where applicable)</li>
          <li>Binding corporate rules or equivalent certification</li>
          <li>Your explicit consent to the transfer (e.g., for analytics)</li>
        </ul>
        <p>Stripe and ipinfo.io operate under the EU-US Data Privacy Framework. Hostinger processes data within the EU under GDPR. Details are available in each provider's own privacy documentation.</p>

        {/* ─── 9 ─────────────────────────────────────────────────────────── */}
        <h2>9. Data Retention</h2>

        <h3>9.1 Retention Schedule</h3>
        <table>
          <thead><tr><th>Data Category</th><th>Retention Period</th><th>Reason</th></tr></thead>
          <tbody>
            <tr><td>Order records and invoices</td><td>7 years from order date</td><td>Pakistani tax / commercial law</td></tr>
            <tr><td>Account profile data</td><td>Until account deletion requested</td><td>Contract performance</td></tr>
            <tr><td>Password reset tokens</td><td>1 hour (OTP) / expiry date (email link)</td><td>Security — time-limited use</td></tr>
            <tr><td>Login session records</td><td>7 days (refresh token)</td><td>Authentication</td></tr>
            <tr><td>IP address (analytics)</td><td>12 months rolling</td><td>Analytics (consent-based)</td></tr>
            <tr><td>Page view records</td><td>12 months rolling</td><td>Analytics (consent-based)</td></tr>
            <tr><td>WhatsApp message logs</td><td>90 days</td><td>Support and audit trail</td></tr>
            <tr><td>Live chat conversations</td><td>90 days after resolution</td><td>Support quality review</td></tr>
            <tr><td>Contact form submissions</td><td>12 months</td><td>Support history</td></tr>
            <tr><td>Product reviews</td><td>Until account deletion or review removal</td><td>Platform integrity</td></tr>
            <tr><td>Job applications (successful)</td><td>Duration of employment + 2 years</td><td>HR records</td></tr>
            <tr><td>Job applications (unsuccessful)</td><td>12 months after decision</td><td>Legal claims window</td></tr>
            <tr><td>Newsletter subscriptions</td><td>Until unsubscribed</td><td>Marketing consent</td></tr>
            <tr><td>Server error logs</td><td>30 days</td><td>Debugging</td></tr>
          </tbody>
        </table>

        <h3>9.2 Deletion Process</h3>
        <p>When retention periods expire, data is either permanently deleted from our database or anonymised so it can no longer be linked to you. Backups are purged on the same schedule as live data.</p>

        {/* ─── 10 ─────────────────────────────────────────────────────────── */}
        <h2>10. Your Rights</h2>

        <h3>10.1 Overview of Rights</h3>
        <p>Depending on your location, you have the following rights regarding your personal data. Pakistani residents have rights under Pakistani consumer protection law. EEA/UK residents have the full suite of GDPR rights.</p>

        <h3>10.2 Right of Access (Data Subject Access Request)</h3>
        <p>You have the right to receive a copy of the personal data we hold about you. You can:</p>
        <ul>
          <li><strong>Instant download (basic data):</strong> Log into your account → <em>My Data</em> tab → click "Download My Data". This provides a JSON file containing your profile, orders, addresses, saved methods, reviews, and loyalty history. Available immediately, no approval required.</li>
          <li><strong>Full data export (includes analytics):</strong> Submit a formal request via the <em>My Data</em> tab or by emailing us. This includes IP logs, page view history, device records, and all analytics data tied to your account. We respond within 30 calendar days.</li>
        </ul>

        <h3>10.3 Right to Rectification</h3>
        <p>If any data we hold about you is inaccurate or incomplete, you can correct it at any time in your account settings (name, phone, address) or by contacting us. We will update the record within 48 hours of receiving your request.</p>

        <h3>10.4 Right to Erasure ("Right to be Forgotten")</h3>
        <p>You may request deletion of your personal data. We will comply unless we have a legal obligation to retain the data (e.g., order records for 7 years under tax law) or a legitimate interest that overrides your request (e.g., active legal proceedings). We will inform you of any exceptions and provide a timeline for the parts we can delete.</p>

        <h3>10.5 Right to Restrict Processing</h3>
        <p>You may request that we pause processing your personal data (for example, while you contest its accuracy) without deleting it. We will notify you before resuming any processing.</p>

        <h3>10.6 Right to Data Portability</h3>
        <p>You may request your personal data in a structured, commonly used, machine-readable format (JSON). See Section 10.2 for how to download it. Where technically feasible, we can also transmit it directly to another data controller upon request.</p>

        <h3>10.7 Right to Object</h3>
        <p>You have the right to object to processing based on our legitimate interests or for direct marketing purposes. Where you object to marketing, we will stop immediately. For other legitimate-interest processing, we will stop unless we can demonstrate compelling grounds that override your interests.</p>

        <h3>10.8 Rights Related to Automated Decision-Making</h3>
        <p>We do not currently make any automated decisions that have legal or similarly significant effects on you. If this changes, we will update this policy and provide you with the right to request human review.</p>

        <h3>10.9 Right to Withdraw Consent</h3>
        <p>Where processing is based on your consent (analytics cookies, marketing emails), you may withdraw consent at any time without affecting the lawfulness of prior processing. To withdraw:</p>
        <ul>
          <li><strong>Analytics cookies:</strong> Clear your browser's site data for alnoorice.pk, or contact us</li>
          <li><strong>Marketing emails:</strong> Click "Unsubscribe" in any email, or email us</li>
          <li><strong>WhatsApp notifications:</strong> Reply STOP to any notification, or contact us</li>
        </ul>

        <h3>10.10 Right to Lodge a Complaint</h3>
        <p>If you believe we have violated your data protection rights, you may lodge a complaint with:</p>
        <ul>
          <li><strong>In Pakistan:</strong> Pakistan Telecommunication Authority (PTA) or Federal Investigation Agency (FIA) Cybercrime Wing</li>
          <li><strong>In the EU:</strong> Your national data protection authority (find yours at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noreferrer">edpb.europa.eu</a>)</li>
          <li><strong>In the UK:</strong> Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a></li>
          <li><strong>In Australia:</strong> Office of the Australian Information Commissioner (OAIC)</li>
        </ul>
        <p>We always encourage you to contact us first so we can try to resolve the matter directly before you escalate to a regulatory authority.</p>

        {/* ─── 11 ─────────────────────────────────────────────────────────── */}
        <h2>11. Security Measures</h2>

        <h3>11.1 Technical Safeguards</h3>
        <ul>
          <li><strong>Encryption in transit:</strong> All data between your browser and our server is encrypted using TLS 1.2 or higher (HTTPS). HTTP connections are redirected to HTTPS.</li>
          <li><strong>Password hashing:</strong> Passwords are hashed using bcrypt with a work factor of 10 before storage. We cannot and do not know your actual password.</li>
          <li><strong>JWT authentication:</strong> Access tokens expire after 7 days. Refresh tokens are stored as httpOnly cookies (inaccessible to JavaScript) and are rotated on each use.</li>
          <li><strong>Two-factor authentication:</strong> TOTP-based 2FA is available for all accounts. Backup codes are individually bcrypt-hashed. 2FA is optional but strongly recommended for admin accounts.</li>
          <li><strong>Account lockout:</strong> After 5 consecutive failed login attempts, the account is locked for 15 minutes. This prevents brute-force attacks.</li>
          <li><strong>Session management:</strong> All active sessions can be viewed and revoked individually from account settings. Logging out invalidates the refresh token server-side.</li>
          <li><strong>Payment security:</strong> Card data is processed by Stripe (PCI-DSS Level 1 certified). Our servers are never in the card data path.</li>
          <li><strong>Rate limiting:</strong> AI-powered endpoints are rate-limited to 20 requests per minute per IP. Brute-force protections apply to authentication endpoints.</li>
        </ul>

        <h3>11.2 Organisational Safeguards</h3>
        <ul>
          <li>Access to personal data is restricted to staff with a business need. Admin-level access is individually credentialed with 2FA.</li>
          <li>All staff with data access are aware of their data protection obligations.</li>
          <li>Third-party vendors are evaluated for security practices before use.</li>
          <li>Database backups are encrypted. Production database credentials are not hardcoded and are managed via environment variables.</li>
        </ul>

        <h3>11.3 Data Breach Procedure</h3>
        <p>In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:</p>
        <ul>
          <li>Contain the breach as quickly as possible</li>
          <li>Assess the scope and nature of data affected</li>
          <li>Notify affected individuals within 72 hours of becoming aware of the breach, where technically feasible</li>
          <li>Report to relevant supervisory authorities as required by applicable law</li>
          <li>Provide guidance on steps you can take to protect yourself (e.g., changing passwords)</li>
        </ul>

        {/* ─── 12 ─────────────────────────────────────────────────────────── */}
        <h2>12. Children's Privacy</h2>

        <h3>12.1 Age Restriction</h3>
        <p>Our services are not directed at, marketed to, or intended for use by children under the age of <strong>13 years</strong>. We do not knowingly collect, maintain, or process personal data from children under 13.</p>

        <h3>12.2 Parental or Guardian Action</h3>
        <p>If you are a parent or guardian and believe that your child under 13 has provided personal data to us without your consent, please contact us immediately at <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a> with the subject line "<strong>Child Data — Urgent</strong>". We will investigate and delete any such data within 48 hours.</p>

        {/* ─── 13 ─────────────────────────────────────────────────────────── */}
        <h2>13. Links to Third-Party Websites</h2>
        <p>Our website may contain links to third-party websites, social media pages, and external resources. We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policy of any third-party site you visit. The presence of a link does not constitute our endorsement of that site's privacy practices.</p>

        {/* ─── 14 ─────────────────────────────────────────────────────────── */}
        <h2>14. Changes to This Privacy Policy</h2>

        <h3>14.1 Update Process</h3>
        <p>We review this Privacy Policy at least once per year and whenever we make material changes to our data practices. The "Last updated" date at the top of this page reflects the date of the most recent revision.</p>

        <h3>14.2 Notification of Changes</h3>
        <p>For material changes (changes that significantly affect how we collect or use your data, or that affect your rights), we will:</p>
        <ul>
          <li>Send an email notification to all registered users at least 14 days before the changes take effect</li>
          <li>Display a prominent notice on our website for 30 days after the effective date</li>
          <li>Where required by law, seek fresh consent for any new processing activities</li>
        </ul>
        <p>Your continued use of our services after the effective date constitutes acceptance of the revised policy. If you do not accept the changes, you may request account deletion before the effective date.</p>

        {/* ─── 15 ─────────────────────────────────────────────────────────── */}
        <h2>15. Contact and Complaints</h2>

        <h3>15.1 Privacy Enquiries</h3>
        <p>For any questions about this Privacy Policy or your personal data, contact us at:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a> — subject: "Privacy Enquiry"</li>
          <li><strong>Phone:</strong> +92-946-123456 (Mon–Sat, 8 AM–6 PM PKT)</li>
          <li><strong>Post:</strong> Al-Noor Rice Mills, Main GT Road, Batkhela, Malakand, KPK 23200, Pakistan</li>
        </ul>

        <h3>15.2 Data Subject Requests</h3>
        <p>Submit formal data subject requests (access, deletion, portability) via:</p>
        <ul>
          <li>Your account → <Link to="/dashboard">My Data tab</Link> (instant for basic data; formal request form for full export)</li>
          <li>Email: <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a> — subject: "Data Subject Request — [Your Full Name]"</li>
        </ul>
        <p>We will acknowledge receipt within 48 hours and complete the request within 30 calendar days. We may ask you to verify your identity before processing a request to protect against fraudulent access.</p>

      </PolicyLayout>
    </PageTransition>
  );
}
