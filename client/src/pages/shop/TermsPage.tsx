import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function TermsPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>Terms & Conditions — Al-Noor Rice Mills</title>
        <meta name="description" content="Complete terms and conditions for purchasing from Al-Noor Rice Mills, covering domestic and international orders, payments, delivery, and your legal rights." />
      </Helmet>
      <PolicyLayout title="Terms & Conditions" updated="1 May 2026"
        icon={<FileText size={22} className="text-white" />}>

        <div className="callout callout-blue">
          <strong>Please read these Terms carefully before placing an order.</strong> By using alnoorice.pk or purchasing from us, you agree to be bound by these Terms. If you do not agree, please do not use our services. These Terms form a legally binding contract between you and Al-Noor Rice Mills.
        </div>

        {/* ─── 1 ─────────────────────────────────────────────────────────── */}
        <h2>1. Introduction and Acceptance</h2>

        <h3>1.1 About These Terms</h3>
        <p>These Terms and Conditions ("<strong>Terms</strong>") govern your use of the website <strong>alnoorice.pk</strong> and all associated services operated by <strong>Al-Noor Rice Mills</strong> ("<strong>we</strong>", "<strong>us</strong>", "<strong>the Company</strong>"). They apply to all visitors, registered users, customers, and business partners who access or transact with us through any channel.</p>

        <h3>1.2 About Al-Noor Rice Mills</h3>
        <p>Al-Noor Rice Mills is a family-owned agri-processing and retail business established in 2010, operating from Batkhela, Malakand, Khyber Pakhtunkhwa, Pakistan. We grow, source, mill, and sell premium Pakistani rice directly to domestic and international consumers and businesses.</p>
        <ul>
          <li><strong>Registered Office:</strong> Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan</li>
          <li><strong>Phone:</strong> +92-946-123456</li>
          <li><strong>Email:</strong> ricemill@sameergul.com</li>
          <li><strong>Business Hours:</strong> Monday–Saturday, 8:00 AM – 6:00 PM Pakistan Standard Time (PKT / UTC+5)</li>
        </ul>

        <h3>1.3 Eligibility</h3>
        <p>By using our website and placing an order, you represent and warrant that:</p>
        <ul>
          <li>You are at least 18 years of age (or the legal age of majority in your jurisdiction, whichever is higher)</li>
          <li>You have the legal capacity to enter into binding contracts</li>
          <li>All information you provide is accurate, current, and complete</li>
          <li>You are accessing this site for lawful purposes and not on behalf of a sanctioned entity</li>
        </ul>

        <h3>1.4 Amendments</h3>
        <p>We reserve the right to modify these Terms at any time. Changes take effect when posted on this page. For material changes (those that significantly affect your rights or obligations), we will provide at least 14 days' notice via email to registered users. Your continued use of the site after the effective date constitutes acceptance. It is your responsibility to review these Terms periodically.</p>

        {/* ─── 2 ─────────────────────────────────────────────────────────── */}
        <h2>2. Account Registration</h2>

        <h3>2.1 Creating an Account</h3>
        <p>You may browse our store without creating an account. An account is required to access your order history, earn loyalty points, save addresses, and use the customer dashboard. Account creation requires a verified email address or phone number (via OTP).</p>

        <h3>2.2 Account Security</h3>
        <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must:</p>
        <ul>
          <li>Choose a strong, unique password of at least 6 characters</li>
          <li>Enable two-factor authentication (2FA) if you are concerned about account security</li>
          <li>Not share your account credentials with any third party</li>
          <li>Notify us immediately at <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a> if you suspect unauthorised access</li>
        </ul>
        <p>We are not liable for losses arising from your failure to keep credentials secure.</p>

        <h3>2.3 Account Termination</h3>
        <p>We reserve the right to suspend or terminate your account without notice if you:</p>
        <ul>
          <li>Violate any provision of these Terms</li>
          <li>Engage in fraudulent, abusive, or illegal activity</li>
          <li>Submit false or misleading information</li>
          <li>Attempt to manipulate our loyalty, referral, or review systems</li>
        </ul>
        <p>You may request account deletion at any time via the My Data tab in your account or by contacting us. Order records will be retained as required by law.</p>

        {/* ─── 3 ─────────────────────────────────────────────────────────── */}
        <h2>3. Products, Descriptions, and Pricing</h2>

        <h3>3.1 Product Descriptions</h3>
        <p>We make every reasonable effort to ensure that product names, variety descriptions, grade classifications, weight statements, and images are accurate. However:</p>
        <ul>
          <li>Product images are representative; actual grain colour, texture, and appearance may vary slightly between harvest seasons and milling batches</li>
          <li>Nutritional information is approximate and based on standard published values for each rice variety</li>
          <li>Grade classifications (A, B, C) refer to our internal quality grading system based on grain length, broken grain percentage, and moisture content</li>
          <li>Aroma and flavour descriptions are subjective indicators based on industry standards and our own assessment</li>
        </ul>
        <p>If you believe a product has been materially misdescribed, please contact us before or within 48 hours of delivery. We will investigate and, if the description was materially inaccurate, offer a full remedy under our Refund Policy.</p>

        <h3>3.2 Pricing and Currency</h3>
        <p>All prices on our website are set and maintained in <strong>Pakistani Rupees (PKR)</strong>. When you select a different currency, prices are displayed as an approximate equivalent using live exchange rates sourced from ExchangeRate-API and updated hourly. The following apply:</p>
        <ul>
          <li>Prices may change between browsing and checkout due to exchange rate fluctuations; the rate at the time of payment processing is the binding rate</li>
          <li>For card payments, you are charged in the currency selected at checkout; Stripe applies its prevailing exchange rate at the time of settlement</li>
          <li>All prices are <strong>exclusive of</strong> import duties, customs taxes, and local sales taxes unless explicitly stated otherwise</li>
          <li>Domestic Pakistan prices include applicable Pakistani taxes where required by law</li>
          <li>Price errors: if a product is listed at an obviously incorrect price, we reserve the right to cancel any orders placed at that price and issue a full refund. We will notify you promptly if this occurs.</li>
        </ul>

        <h3>3.3 Minimum Order Quantities</h3>
        <p>Most products have a minimum order quantity (MOQ) of 5 kg or as specified on the product page. Wholesale orders of 500 kg or more are handled through our dedicated <a href="/wholesale">Wholesale Inquiry</a> process.</p>

        <h3>3.4 Availability</h3>
        <p>All products are subject to availability. Stock levels are updated in real time. We reserve the right to cancel or partially fulfil an order if stock becomes unavailable after your purchase. In such cases, we will contact you within 24 hours and offer a full or partial refund or an alternative product of equivalent value.</p>

        {/* ─── 4 ─────────────────────────────────────────────────────────── */}
        <h2>4. Ordering Process and Contract Formation</h2>

        <h3>4.1 How to Place an Order</h3>
        <p>Orders are placed through our website checkout process. You may checkout as a guest (providing contact and delivery details without creating an account) or as a registered user with saved addresses and payment methods.</p>

        <h3>4.2 Order Confirmation</h3>
        <p>Submission of an order constitutes an offer to purchase. A binding contract is formed only when:</p>
        <ul>
          <li>We send you an order confirmation email and/or WhatsApp message with your unique order number, and</li>
          <li>We have confirmed stock availability and accepted your order</li>
        </ul>
        <p>An order confirmation is not issued automatically for every submission — we may need to contact you if stock is insufficient or if there is an issue with your payment or delivery address.</p>

        <h3>4.3 Order Accuracy</h3>
        <p>You are responsible for ensuring that your order details — including product selection, quantity, delivery address, and contact information — are correct before completing checkout. While we will try to accommodate corrections, we cannot guarantee changes can be made after an order is confirmed.</p>

        <h3>4.4 Order Cancellation by Customer</h3>
        <p>You may cancel an order within <strong>2 hours</strong> of placement, provided the order has not yet been dispatched. To cancel, contact us immediately via:</p>
        <ul>
          <li>WhatsApp: +92-300-1234567 (fastest)</li>
          <li>Email: ricemill@sameergul.com with your order number in the subject</li>
          <li>Phone: +92-946-123456</li>
        </ul>
        <p>Once an order is dispatched, it cannot be cancelled. Please refer to our Refund &amp; Returns Policy for post-dispatch options.</p>

        <h3>4.5 Order Cancellation by Al-Noor Rice Mills</h3>
        <p>We reserve the right to cancel any order at our discretion, including where:</p>
        <ul>
          <li>The product is out of stock at the time of processing</li>
          <li>We identify a pricing error</li>
          <li>The delivery address is unserviceable by our courier network</li>
          <li>We have reasonable grounds to believe the order is fraudulent</li>
          <li>Payment is declined or not received within the required timeframe (for bank wire orders)</li>
        </ul>
        <p>In all cases, a full refund of amounts paid will be processed within 5 business days.</p>

        {/* ─── 5 ─────────────────────────────────────────────────────────── */}
        <h2>5. Payment Terms</h2>

        <h3>5.1 Accepted Payment Methods</h3>
        <table>
          <thead><tr><th>Payment Method</th><th>Availability</th><th>When Charged</th><th>Order Status at Dispatch</th></tr></thead>
          <tbody>
            <tr><td>Credit / Debit Card (Visa, Mastercard)</td><td>Worldwide</td><td>Immediately at checkout (Stripe)</td><td>Paid</td></tr>
            <tr><td>Cash on Delivery (COD)</td><td>Pakistan only</td><td>At delivery to your door</td><td>Pending payment</td></tr>
            <tr><td>Local Bank Transfer</td><td>Pakistan only</td><td>Before dispatch (within 24h)</td><td>Pending payment</td></tr>
            <tr><td>EasyPaisa</td><td>Pakistan only</td><td>Before dispatch (within 24h)</td><td>Pending payment</td></tr>
            <tr><td>JazzCash</td><td>Pakistan only</td><td>Before dispatch (within 24h)</td><td>Pending payment</td></tr>
            <tr><td>International Bank Wire (SWIFT/IBAN)</td><td>International only</td><td>Before dispatch (within 3 business days)</td><td>Pending payment</td></tr>
          </tbody>
        </table>

        <h3>5.2 Card Payments</h3>
        <p>Card payments are processed securely by <strong>Stripe, Inc.</strong> (USA). Your card details are entered directly into Stripe's secure hosted fields and are never transmitted to or stored on our servers. Stripe is PCI-DSS Level 1 certified — the highest level of payment security compliance. By using card payment, you also agree to <a href="https://stripe.com/legal/consumer" target="_blank" rel="noreferrer">Stripe's Consumer Terms</a>.</p>

        <h3>5.3 Bank Wire (International Orders)</h3>
        <p>For international orders paid by bank wire:</p>
        <ul>
          <li>Our IBAN, SWIFT/BIC code, and beneficiary details are provided to you by email after order placement</li>
          <li>Payment must be received within <strong>3 business days</strong> of order placement; orders not paid within this window may be cancelled</li>
          <li>Bank wire fees charged by your bank are your responsibility</li>
          <li>Currency conversion is handled by your bank at their prevailing rate; we apply the rate at which the funds arrive in our account</li>
          <li>Dispatch occurs only after funds are confirmed in our account</li>
        </ul>

        <h3>5.4 Non-Payment and Partial Payment</h3>
        <p>Orders requiring advance payment (bank transfer, EasyPaisa, JazzCash, bank wire) will be held in "Pending" status until payment is confirmed by our accounts team. If payment is not received within the specified window, the order will be cancelled and stock released. Partially paid orders will not be dispatched until the outstanding balance is settled.</p>

        <h3>5.5 Chargebacks and Disputes</h3>
        <p>If you believe a charge is incorrect, please contact us before initiating a chargeback with your bank. Most billing issues can be resolved quickly and directly. Fraudulent chargebacks may result in account suspension and may be subject to legal action.</p>

        {/* ─── 6 ─────────────────────────────────────────────────────────── */}
        <h2>6. Delivery</h2>

        <h3>6.1 Delivery Responsibility</h3>
        <p>We take responsibility for your order until it is handed to the courier for dispatch. Risk of loss or damage passes to you at the point of handover to the courier. Please ensure your delivery address is accurate — we cannot be held responsible for delays or losses caused by incorrect address information.</p>

        <h3>6.2 Delivery Timeframes</h3>
        <p>Estimated delivery timeframes are stated in our <a href="/policies/shipping">Shipping Policy</a> and on your order confirmation. These are estimates only and not guarantees. We are not liable for delays caused by:</p>
        <ul>
          <li>Courier delays, industrial action, or capacity constraints</li>
          <li>Customs processing and clearance times (international orders)</li>
          <li>Adverse weather, natural disasters, or force majeure events</li>
          <li>Incorrect or incomplete delivery address provided by you</li>
          <li>Recipient unavailability at the delivery address</li>
        </ul>

        <h3>6.3 Failed Delivery</h3>
        <p>If a delivery attempt fails, the courier will typically leave a notification and attempt re-delivery. If the package is returned to us after failed delivery attempts caused by:</p>
        <ul>
          <li><strong>Courier error:</strong> We will redeliver at no additional charge</li>
          <li><strong>Incorrect address provided by you:</strong> Redelivery is at your cost</li>
          <li><strong>Recipient refusal:</strong> A restocking fee may apply and return shipping is at your cost</li>
        </ul>

        <h3>6.4 International Delivery</h3>
        <p>For full details on international shipping zones, timeframes, and costs, please see our <a href="/policies/shipping">Shipping Policy</a>. Key points:</p>
        <ul>
          <li>You are the importer of record for your country and are responsible for all customs duties, import taxes, and regulatory compliance</li>
          <li>We will not under-declare the value of goods on customs documentation</li>
          <li>We cannot guarantee delivery in jurisdictions where rice importation is restricted</li>
        </ul>

        {/* ─── 7 ─────────────────────────────────────────────────────────── */}
        <h2>7. Refunds and Returns</h2>
        <p>Our complete refund and returns process is detailed in our separate <a href="/policies/refund">Refund &amp; Returns Policy</a>, which is incorporated into these Terms by reference. Key provisions:</p>
        <ul>
          <li>Quality issues must be reported within 48 hours of delivery with photographic evidence</li>
          <li>We offer full refunds or replacements for quality below description, damaged goods on arrival, or incorrect items</li>
          <li>Food products that have been opened or partially used cannot be returned</li>
          <li>Change-of-mind returns are not accepted for food products</li>
        </ul>

        {/* ─── 8 ─────────────────────────────────────────────────────────── */}
        <h2>8. Intellectual Property</h2>

        <h3>8.1 Ownership</h3>
        <p>All content on alnoorice.pk — including but not limited to text, product descriptions, blog articles, photographs, product images, brand logos, trademarks, website design, UI components, animations, and source code — is owned by or licensed to Al-Noor Rice Mills and is protected by applicable intellectual property laws in Pakistan and internationally.</p>

        <h3>8.2 Permitted Use</h3>
        <p>You may access and use our website content for personal, non-commercial purposes only. You may not:</p>
        <ul>
          <li>Reproduce, distribute, or republish our content without prior written permission</li>
          <li>Use our brand name, logo, or trademarks in any manner that implies endorsement or affiliation</li>
          <li>Create derivative works, reverse-engineer, or decompile any part of the website</li>
          <li>Scrape, crawl, or harvest data from our website using automated tools (except standard search engine indexing bots)</li>
          <li>Frame or mirror any part of our website on another site without our written consent</li>
        </ul>

        <h3>8.3 User-Generated Content</h3>
        <p>By submitting a product review, comment, or other content to our platform, you grant Al-Noor Rice Mills a non-exclusive, royalty-free, perpetual, worldwide licence to use, display, reproduce, and distribute that content for marketing and service improvement purposes, subject to the right to request its removal from your account.</p>

        {/* ─── 9 ─────────────────────────────────────────────────────────── */}
        <h2>9. Loyalty, Referral, and Promotions</h2>

        <h3>9.1 Loyalty Points</h3>
        <p>Our loyalty programme awards points at the rate of <strong>1 point per PKR 100 spent</strong> on eligible orders. Points have no cash value except for redemption against future orders at a rate of 100 points = PKR 10 discount. We reserve the right to:</p>
        <ul>
          <li>Modify the earning rate, redemption rate, or tier thresholds with 30 days' notice</li>
          <li>Expire inactive points after 24 months of account inactivity</li>
          <li>Cancel points awarded fraudulently or in error</li>
          <li>Discontinue the loyalty programme with 30 days' notice to members</li>
        </ul>

        <h3>9.2 Referral Programme</h3>
        <p>Referral codes are personal and may not be sold, transferred, or published publicly. We reserve the right to disqualify referral earnings that appear to have been obtained through abuse, self-referral, or artificial manipulation. Referral bonuses are credited only when the referee places a genuine qualifying order.</p>

        <h3>9.3 Discount Codes and Promotions</h3>
        <p>Promotional discount codes are subject to their own terms (validity period, minimum order, single-use or multi-use, applicable products). Only one discount code may be applied per order unless stated otherwise. Codes may not be combined with other promotional offers unless explicitly permitted.</p>

        {/* ─── 10 ─────────────────────────────────────────────────────────── */}
        <h2>10. Prohibited Uses</h2>
        <p>You agree not to use our website or services to:</p>
        <ul>
          <li>Violate any applicable law, regulation, or third-party rights</li>
          <li>Submit false, misleading, or fraudulent information</li>
          <li>Engage in any form of automated purchasing, price scraping, or bot activity</li>
          <li>Attempt to gain unauthorised access to our systems, databases, or other users' accounts</li>
          <li>Introduce malware, viruses, trojans, or other malicious code</li>
          <li>Transmit spam, unsolicited marketing, or phishing communications via our chat or contact systems</li>
          <li>Post defamatory, offensive, discriminatory, or illegal content in reviews or messages</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
          <li>Circumvent any security, access control, or rate-limiting mechanism</li>
        </ul>
        <p>Violation of any of the above may result in immediate account termination, blocking of IP addresses, and referral to law enforcement authorities where appropriate.</p>

        {/* ─── 11 ─────────────────────────────────────────────────────────── */}
        <h2>11. Disclaimers and Warranties</h2>

        <h3>11.1 "As Is" Service</h3>
        <p>Our website is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, accuracy, completeness, or fitness for a particular purpose of the website or its content, except as required by applicable law.</p>

        <h3>11.2 Uptime and Availability</h3>
        <p>We do not guarantee uninterrupted, error-free access to our website. Maintenance, updates, or technical issues may occasionally cause downtime. We will endeavour to minimise disruptions and provide advance notice of planned maintenance where possible.</p>

        <h3>11.3 Third-Party Content</h3>
        <p>Our website may link to or display content from third parties (e.g., payment processors, courier tracking pages, social media). We do not endorse or take responsibility for third-party content, services, or websites.</p>

        {/* ─── 12 ─────────────────────────────────────────────────────────── */}
        <h2>12. Limitation of Liability</h2>

        <h3>12.1 Cap on Liability</h3>
        <p>To the maximum extent permitted by applicable law, Al-Noor Rice Mills' total aggregate liability to you for any claim arising out of or in connection with these Terms or your use of our services shall not exceed the <strong>total amount paid by you for the specific order that gave rise to the claim</strong>.</p>

        <h3>12.2 Excluded Losses</h3>
        <p>We are not liable — whether in contract, tort (including negligence), breach of statutory duty, or otherwise — for:</p>
        <ul>
          <li>Indirect, incidental, or consequential losses</li>
          <li>Loss of profits, revenue, business, goodwill, or data</li>
          <li>Losses caused by courier delays beyond our control</li>
          <li>Customs seizure, refusal, or processing delays for international shipments</li>
          <li>Exchange rate fluctuations affecting the amount charged in your currency</li>
          <li>Losses caused by your failure to maintain account security</li>
          <li>Losses arising from force majeure events (see Section 13)</li>
        </ul>

        <h3>12.3 Consumer Rights</h3>
        <p>Nothing in these Terms limits or excludes any right you have under mandatory consumer protection laws in your country of residence that cannot be waived by contract. If any part of these limitations conflicts with applicable mandatory law, that part shall be deemed modified to the minimum extent necessary to comply with that law.</p>

        {/* ─── 13 ─────────────────────────────────────────────────────────── */}
        <h2>13. Force Majeure</h2>
        <p>We will not be in breach of these Terms, nor liable for any failure or delay in performing our obligations, where such failure or delay arises from causes beyond our reasonable control, including: acts of God, natural disasters, floods, earthquakes, epidemics, pandemics, war, terrorism, civil unrest, strikes or labour disputes, government actions or restrictions, power failures, internet outages, or any other event of a similar nature. We will make reasonable efforts to minimise the impact of such events and resume normal operations as quickly as possible.</p>

        {/* ─── 14 ─────────────────────────────────────────────────────────── */}
        <h2>14. Governing Law and Dispute Resolution</h2>

        <h3>14.1 Governing Law</h3>
        <p>These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>.</p>

        <h3>14.2 Jurisdiction</h3>
        <p>Subject to Section 14.3, the courts of <strong>Malakand, Khyber Pakhtunkhwa, Pakistan</strong> shall have exclusive jurisdiction over any dispute. By using our services, you irrevocably submit to the jurisdiction of those courts.</p>

        <h3>14.3 Consumer Rights — International Customers</h3>
        <p>If you are a consumer located in the European Union, United Kingdom, Australia, or any jurisdiction with mandatory consumer protection laws, you retain the right to bring legal proceedings in the courts of your country of residence in respect of mandatory consumer rights. This clause does not limit those rights.</p>

        <h3>14.4 Informal Dispute Resolution</h3>
        <p>Before initiating formal legal proceedings, we encourage you to contact us to try to resolve any dispute informally. Email us at ricemill@sameergul.com with a description of your complaint. We will acknowledge within 48 hours and aim to resolve within 14 business days.</p>

        {/* ─── 15 ─────────────────────────────────────────────────────────── */}
        <h2>15. Severability and Entire Agreement</h2>

        <h3>15.1 Severability</h3>
        <p>If any provision of these Terms is found by a court to be illegal, invalid, or unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible. The remaining provisions will continue in full force and effect.</p>

        <h3>15.2 Entire Agreement</h3>
        <p>These Terms, together with our <a href="/policies/privacy">Privacy Policy</a>, <a href="/policies/refund">Refund &amp; Returns Policy</a>, and <a href="/policies/shipping">Shipping Policy</a>, constitute the entire agreement between you and Al-Noor Rice Mills regarding your use of our services and supersede all prior discussions, representations, and agreements.</p>

        <h3>15.3 Waiver</h3>
        <p>A failure or delay by us to exercise any right or remedy does not constitute a waiver of that or any other right or remedy.</p>

        {/* ─── 16 ─────────────────────────────────────────────────────────── */}
        <h2>16. Contact</h2>
        <p>For any questions about these Terms, please contact:</p>
        <ul>
          <li><strong>Email:</strong> ricemill@sameergul.com</li>
          <li><strong>Phone:</strong> +92-946-123456 · Mon–Sat 8 AM–6 PM PKT</li>
          <li><strong>Address:</strong> Al-Noor Rice Mills, Main GT Road, Batkhela, Malakand, KPK 23200, Pakistan</li>
        </ul>

      </PolicyLayout>
    </PageTransition>
  );
}
