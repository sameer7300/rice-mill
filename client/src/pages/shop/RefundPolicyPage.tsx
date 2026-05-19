import { Helmet } from 'react-helmet-async';
import { RefreshCw } from 'lucide-react';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function RefundPolicyPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>Refund & Returns Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Al-Noor Rice Mills complete refund, return, and exchange policy covering eligibility, process, timelines, and international order considerations." />
      </Helmet>
      <PolicyLayout title="Refund & Returns Policy" updated="1 May 2026"
        icon={<RefreshCw size={22} className="text-white" />}>

        <div className="callout callout-green">
          <strong>Our Commitment:</strong> Every bag of rice we sell is milled and packed by us. If your order falls short of the standard described — in quality, grade, variety, or condition — we will make it right. This policy explains exactly how, and by when.
        </div>

        {/* ─── 1 ─────────────────────────────────────────────────────────── */}
        <h2>1. Quality Guarantee</h2>

        <h3>1.1 Our Standard</h3>
        <p>Al-Noor Rice Mills applies a rigorous quality control process to every batch we produce:</p>
        <ul>
          <li>Paddy is sourced from verified farms in the Malakand and adjacent regions</li>
          <li>Each milling batch is inspected for moisture content, broken grain percentage, and foreign matter</li>
          <li>All bags are sealed in food-grade packaging and labelled with lot number, grade, variety, net weight, and pack date</li>
          <li>Grade A, B, and C products meet defined specifications communicated on each product page</li>
        </ul>

        <h3>1.2 Satisfaction Guarantee</h3>
        <p>If any product you receive does not materially match its description on our website in terms of rice variety, grade, quality, or weight, you are entitled to a full refund or replacement at no additional cost to you. This guarantee applies regardless of which payment method you used.</p>

        {/* ─── 2 ─────────────────────────────────────────────────────────── */}
        <h2>2. What Can Be Returned or Refunded</h2>

        <h3>2.1 Eligible Claims</h3>
        <table>
          <thead><tr><th>Issue</th><th>Eligible?</th><th>Time Limit</th></tr></thead>
          <tbody>
            <tr><td>Rice variety does not match what was ordered (e.g., Super Kernel received instead of Basmati)</td><td>✅ Full refund or replacement</td><td>48 hours of delivery</td></tr>
            <tr><td>Grade materially below what was described (e.g., Grade C received when Grade A ordered)</td><td>✅ Full refund or replacement</td><td>48 hours of delivery</td></tr>
            <tr><td>Packaging damaged on arrival and product contaminated or compromised</td><td>✅ Full refund or replacement</td><td>24 hours of delivery</td></tr>
            <tr><td>Significantly underweight bag (more than 5% below stated net weight)</td><td>✅ Full refund or replacement</td><td>48 hours of delivery</td></tr>
            <tr><td>Foreign matter, pests, or contamination discovered in sealed bag</td><td>✅ Full refund or replacement</td><td>48 hours of opening</td></tr>
            <tr><td>Order not received within stated delivery window (after investigation)</td><td>✅ Full refund or re-shipment</td><td>Within 14 days of order date</td></tr>
            <tr><td>Incorrect quantity received (fewer bags than ordered)</td><td>✅ Refund for shortfall or delivery of missing items</td><td>24 hours of delivery</td></tr>
          </tbody>
        </table>

        <h3>2.2 Non-Eligible Claims</h3>
        <table>
          <thead><tr><th>Issue</th><th>Eligible?</th><th>Reason</th></tr></thead>
          <tbody>
            <tr><td>Change of mind after receiving correct order</td><td>❌ No</td><td>Food safety regulations prevent re-sale of returned food products</td></tr>
            <tr><td>Bag already opened and partially used (unless contamination found)</td><td>❌ No</td><td>Food safety — opened bags cannot be verified or resold</td></tr>
            <tr><td>Quality complaint raised more than 48 hours after delivery</td><td>❌ No</td><td>Time limits exist to ensure claims are assessed while product is verifiable</td></tr>
            <tr><td>Personal taste preference (e.g., "I didn't like the aroma")</td><td>❌ No</td><td>Subjective preferences are not quality defects</td></tr>
            <tr><td>Improper storage by customer leading to spoilage</td><td>❌ No</td><td>We are not responsible for post-delivery storage conditions</td></tr>
            <tr><td>Clearance or final-sale items explicitly marked as non-returnable</td><td>❌ No</td><td>Declared at time of purchase</td></tr>
            <tr><td>Custom-milled or special-order batches</td><td>❌ No unless defective</td><td>Made to specification</td></tr>
            <tr><td>Damage or loss after delivery confirmed by courier (theft, damage by recipient)</td><td>❌ No</td><td>Risk passes to buyer at delivery confirmation</td></tr>
          </tbody>
        </table>

        {/* ─── 3 ─────────────────────────────────────────────────────────── */}
        <h2>3. Time Limits for Reporting Issues</h2>

        <h3>3.1 Why Time Limits Apply</h3>
        <p>Time limits are necessary because:</p>
        <ul>
          <li>Quality defects need to be assessed while the product is in a verifiable, near-original condition</li>
          <li>Photographic evidence of packaging and product is most reliable immediately after delivery</li>
          <li>Transit damage must be reported before the product is consumed or significantly altered</li>
          <li>Logistics claims with couriers must be filed within their own deadlines (typically 24–48 hours)</li>
        </ul>

        <h3>3.2 Reporting Deadlines</h3>
        <ul>
          <li><strong>Damaged packaging or external damage visible at delivery:</strong> Report within <strong>24 hours</strong> of receiving the parcel. Ideally note this on the courier delivery receipt before signing.</li>
          <li><strong>Quality issues, wrong variety, or wrong grade:</strong> Report within <strong>48 hours</strong> of delivery.</li>
          <li><strong>Contamination or pest discovery in sealed bag:</strong> Report within <strong>48 hours</strong> of opening the bag.</li>
          <li><strong>Non-delivery:</strong> If your order has not arrived within the maximum estimated delivery window shown on your confirmation, contact us to initiate a trace. Do not wait more than 14 days from the order date.</li>
        </ul>

        <div className="callout callout-amber">
          <strong>Start the clock at delivery, not at opening.</strong> For packaging damage, the 24-hour clock starts when the parcel is delivered to you or your chosen delivery point, regardless of when you open it. Please inspect packaging on receipt where possible.
        </div>

        {/* ─── 4 ─────────────────────────────────────────────────────────── */}
        <h2>4. How to Submit a Claim</h2>

        <h3>4.1 Required Information</h3>
        <p>To process your claim efficiently, we need:</p>
        <ul>
          <li><strong>Order number</strong> (shown in your confirmation email / WhatsApp message and on your account)</li>
          <li><strong>Your name and contact information</strong></li>
          <li><strong>Clear photographs</strong> — of the bag label (showing lot number and variety), the affected product, and the packaging (including any visible damage)</li>
          <li><strong>A description of the issue</strong> — what you received vs. what you expected</li>
        </ul>
        <p>Claims submitted without photographs may be delayed while we request them. The stronger your evidence, the faster we can resolve your claim.</p>

        <h3>4.2 How to Contact Us</h3>
        <ul>
          <li><strong>WhatsApp (fastest):</strong> +92-300-1234567 — send your order number and photos directly</li>
          <li><strong>Email:</strong> ricemill@sameergul.com — attach photos and include your order number in the subject line</li>
          <li><strong>Phone:</strong> +92-946-123456 · Mon–Sat 8 AM–6 PM PKT</li>
          <li><strong>Live Chat:</strong> Available on our website during business hours</li>
        </ul>

        <h3>4.3 Claim Processing Steps</h3>
        <ol>
          <li><strong>Submission:</strong> You contact us with your order number, description, and photos.</li>
          <li><strong>Acknowledgement:</strong> We confirm receipt of your claim within <strong>24 business hours</strong>.</li>
          <li><strong>Assessment:</strong> Our team reviews the evidence and, if necessary, contacts our dispatch team or courier to investigate. This typically takes 1–3 business days.</li>
          <li><strong>Decision:</strong> We notify you of our decision and the proposed remedy — replacement, refund, or exchange.</li>
          <li><strong>Resolution:</strong> Replacement is dispatched or refund is processed per Section 6 timelines.</li>
        </ol>
        <p>We aim to resolve most claims within <strong>5 business days</strong> of submission. Complex cases (e.g., lost international shipments requiring courier investigation) may take up to 14 business days.</p>

        <h3>4.4 Physical Return of Product</h3>
        <p>For domestic orders, we may ask you to make the product available for courier collection if we need to inspect it. In most quality claims, photographic evidence is sufficient and we will not require you to return the product. If we do arrange a return collection:</p>
        <ul>
          <li>We arrange and pay for courier pickup for eligible claims</li>
          <li>Do not return the product by your own means without prior agreement — unrequested returns cannot be accepted</li>
        </ul>

        {/* ─── 5 ─────────────────────────────────────────────────────────── */}
        <h2>5. Remedies Available</h2>

        <h3>5.1 Replacement</h3>
        <p>We will dispatch the correct product (correct variety, grade, and quantity) at no additional cost. Replacement dispatch follows the same schedule as standard orders. For domestic orders, replacement typically arrives within 3–7 business days of approval.</p>

        <h3>5.2 Exchange</h3>
        <p>If you prefer a different variety or grade of equivalent value, we can arrange an exchange at no additional cost for domestic orders. Any price difference will be credited to your account or charged accordingly.</p>

        <h3>5.3 Full Refund</h3>
        <p>A full refund of the order value (excluding any non-refundable charges — see Section 7) will be processed to your original payment method. See Section 6 for timelines.</p>

        <h3>5.4 Partial Refund</h3>
        <p>Where only part of an order is affected (e.g., one bag in a multi-bag order is damaged), we will refund or replace the affected portion only, unless the condition of the remaining items is also compromised.</p>

        <h3>5.5 Store Credit</h3>
        <p>As an alternative to a refund, we may offer store credit to your account balance, which can be used against any future order. Store credit does not expire and is transferable to another account on request.</p>

        {/* ─── 6 ─────────────────────────────────────────────────────────── */}
        <h2>6. Refund Timelines by Payment Method</h2>

        <h3>6.1 Processing Schedule</h3>
        <table>
          <thead><tr><th>Original Payment Method</th><th>Refund Method</th><th>Business Days After Approval</th></tr></thead>
          <tbody>
            <tr><td>Credit / Debit Card (Stripe)</td><td>Credit back to original card</td><td>5–10 business days (depending on your card issuer)</td></tr>
            <tr><td>International Bank Wire (SWIFT/IBAN)</td><td>Wire to your provided bank account</td><td>3–7 business days (international bank processing)</td></tr>
            <tr><td>Cash on Delivery</td><td>Bank transfer (your account details required)</td><td>2–3 business days</td></tr>
            <tr><td>EasyPaisa</td><td>EasyPaisa wallet transfer</td><td>1–2 business days</td></tr>
            <tr><td>JazzCash</td><td>JazzCash wallet transfer</td><td>1–2 business days</td></tr>
            <tr><td>Local Bank Transfer (Pakistan)</td><td>Bank transfer to your account</td><td>2–3 business days</td></tr>
          </tbody>
        </table>

        <h3>6.2 What "Approved" Means</h3>
        <p>"After approval" means from the date we send you our written confirmation that the refund has been authorised. For card refunds, the timeline reflects when funds should appear in your statement; your bank may take additional time to post the credit. If you do not see a refund within the stated window after receiving approval confirmation, please contact us and we will provide a reference number to share with your bank.</p>

        <h3>6.3 Refund Currency</h3>
        <p>Refunds are always issued in the same currency as the original charge. If you paid in a currency other than PKR and exchange rates have moved, the refund amount in PKR will reflect the original PKR value of the order. We do not compensate for exchange rate differences between purchase date and refund date.</p>

        {/* ─── 7 ─────────────────────────────────────────────────────────── */}
        <h2>7. Non-Refundable Charges</h2>

        <h3>7.1 Shipping Fees</h3>
        <p>Shipping fees are non-refundable in the following cases:</p>
        <ul>
          <li>Where the issue was caused by the customer (incorrect address, refusal to receive, absence at delivery)</li>
          <li>Change-of-mind returns (where applicable)</li>
          <li>International orders where the refund is for a portion of the order and the shipping was validly performed</li>
        </ul>
        <p>Shipping fees <strong>are</strong> refunded when the error is entirely on our part (wrong item sent, failed to dispatch, significant quality failure).</p>

        <h3>7.2 Import Duties and Taxes (International Orders)</h3>
        <div className="callout callout-amber">
          <strong>Customs and import duties paid to your government are non-refundable by us</strong> under any circumstance. These charges are levied by your country's customs authority, not by Al-Noor Rice Mills, and we have no ability to issue refunds for them. This applies even if the goods are returned to us.
        </div>

        <h3>7.3 Bank Wire Transfer Fees</h3>
        <p>Any bank charges applied by your bank for sending a wire transfer are non-refundable by us, as these are fees charged by your financial institution.</p>

        <h3>7.4 Currency Conversion Losses</h3>
        <p>We do not compensate for any currency conversion losses or fees charged by your bank, credit card issuer, or payment processor in connection with a refund.</p>

        {/* ─── 8 ─────────────────────────────────────────────────────────── */}
        <h2>8. International Order Considerations</h2>

        <h3>8.1 Customs Seizure and Refusal</h3>
        <p>If your country's customs authority seizes, holds, or refuses your shipment, we will work with you to understand the situation. However:</p>
        <ul>
          <li>We cannot guarantee a refund for goods seized by customs, as the goods left our possession in good order and compliant with Pakistani export requirements</li>
          <li>It is your responsibility to ensure importing rice is legal in your country and at the quantities ordered before placing an order</li>
          <li>If goods are returned to us by customs at your expense and arrive in saleable condition, we may offer a partial refund (excluding all shipping costs)</li>
          <li>Each customs-related case is assessed on its individual merits and we will communicate clearly with you throughout the process</li>
        </ul>

        <h3>8.2 International Return Logistics</h3>
        <p>Due to the logistical complexity and cost of international returns, we generally resolve international quality claims through refund or credit rather than requesting physical return of goods. In exceptional cases where return is requested:</p>
        <ul>
          <li>We will provide clear instructions on packaging and labelling for customs compliance</li>
          <li>International return shipping is at our cost only where the fault is entirely ours</li>
          <li>Where return shipping is at your cost, we will not process the refund until the goods are received back and inspected</li>
        </ul>

        <h3>8.3 Long Transit Times</h3>
        <p>For international orders with long transit times, please wait for the maximum estimated delivery window before reporting a non-delivery. We understand international shipping can be unpredictable, and we will always investigate and resolve genuine non-delivery cases promptly.</p>

        {/* ─── 9 ─────────────────────────────────────────────────────────── */}
        <h2>9. Dispute Escalation</h2>

        <h3>9.1 Internal Escalation</h3>
        <p>If you are not satisfied with the resolution offered by our customer service team, you may request escalation to a senior manager. Email ricemill@sameergul.com with the subject "<strong>Escalation — Order #[your order number]</strong>". A senior team member will respond within 2 business days.</p>

        <h3>9.2 External Dispute Resolution</h3>
        <p>If we are unable to resolve your complaint to your satisfaction, you may escalate to:</p>
        <ul>
          <li><strong>Pakistan:</strong> Federal Ombudsman Secretariat or relevant provincial consumer court</li>
          <li><strong>European Union:</strong> Your national consumer protection authority or the EU Online Dispute Resolution platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a></li>
          <li><strong>United Kingdom:</strong> Citizens Advice Consumer Service or Trading Standards</li>
          <li><strong>Australia:</strong> Australian Consumer Law disputes via your state consumer affairs agency</li>
        </ul>

        {/* ─── 10 ─────────────────────────────────────────────────────────── */}
        <h2>10. Contact for Returns and Refunds</h2>
        <p>Our dedicated support channels for return and refund claims:</p>
        <ul>
          <li><strong>WhatsApp (fastest response):</strong> +92-300-1234567 — available during business hours</li>
          <li><strong>Email:</strong> ricemill@sameergul.com — include your order number and photos</li>
          <li><strong>Phone:</strong> +92-946-123456 · Mon–Sat 8 AM–6 PM PKT</li>
          <li><strong>Live Chat:</strong> Available on alnoorice.pk during business hours</li>
        </ul>
        <p>We aim to acknowledge all claims within <strong>24 business hours</strong> and resolve them within <strong>5 business days</strong>. Your satisfaction is our priority.</p>

      </PolicyLayout>
    </PageTransition>
  );
}
