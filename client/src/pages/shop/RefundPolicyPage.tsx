import { Helmet } from 'react-helmet-async';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function RefundPolicyPage() {
  return (
    <PageTransition>
    <PolicyLayout title="Refund & Return Policy" updated="January 2026">
      <Helmet>
        <title>Refund & Return Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Al-Noor Rice Mills quality guarantee, return process, and refund policy." />
      </Helmet>

      <section id="guarantee">
        <h2>1. Our Quality Guarantee</h2>
        <p>At Al-Noor Rice Mills, we stand behind every bag we sell. All rice is cleaned, sorted, and quality-checked at our Batkhela mill before dispatch. If you receive a product that does not meet our standards, we will make it right — guaranteed.</p>
      </section>

      <section id="eligibility">
        <h2>2. Eligibility for Return</h2>
        <p>To be eligible for a return or refund:</p>
        <ul>
          <li><strong>Report within 24 hours</strong> of delivery</li>
          <li>Bag must be <strong>unopened and in original packaging</strong></li>
          <li>Provide <strong>photo or video evidence</strong> via WhatsApp showing the issue</li>
          <li>Valid reasons: wrong product delivered, quality defect, visible damage to packaging</li>
        </ul>
      </section>

      <section id="non-returnable">
        <h2>3. Non-Returnable Items</h2>
        <ul>
          <li>Opened or partially used bags</li>
          <li>Custom-milled or custom-blended orders</li>
          <li>Items marked as <strong>Final Sale</strong> at time of purchase</li>
          <li>Damage due to improper storage after delivery</li>
        </ul>
      </section>

      <section id="process">
        <h2>4. Return Process</h2>
        <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.9', color: '#4b5563' }}>
          <li><strong>Step 1:</strong> WhatsApp us at +92-300-1234567 with your order number and photos/videos of the issue.</li>
          <li><strong>Step 2:</strong> Our team verifies within 4 business hours (Mon–Sat, 8 AM – 6 PM PKT).</li>
          <li><strong>Step 3:</strong> We arrange pickup from your address, or you drop off at our Batkhela mill.</li>
          <li><strong>Step 4:</strong> After inspection, refund is processed within 2–5 business days.</li>
        </ol>
      </section>

      <section id="refund-methods">
        <h2>5. Refund Methods</h2>
        <table>
          <thead>
            <tr><th>Original Payment</th><th>Refund Method</th><th>Timeline</th></tr>
          </thead>
          <tbody>
            <tr><td>Cash on Delivery</td><td>Bank Transfer or EasyPaisa/JazzCash</td><td>3–5 business days</td></tr>
            <tr><td>Bank Transfer</td><td>Same bank account</td><td>5–7 business days</td></tr>
            <tr><td>EasyPaisa</td><td>Same EasyPaisa account</td><td>2–3 business days</td></tr>
            <tr><td>JazzCash</td><td>Same JazzCash account</td><td>2–3 business days</td></tr>
          </tbody>
        </table>
      </section>

      <section id="exchange">
        <h2>6. Exchange Option</h2>
        <p>We offer exchange for the same product in a different grade (e.g., Premium → Standard), subject to stock availability. Exchanges are processed at no extra charge if the fault is ours.</p>
      </section>

      <section id="transit-damage">
        <h2>7. Damaged in Transit</h2>
        <p>If your order arrives damaged by the courier:</p>
        <ul>
          <li>Report within <strong>2 hours</strong> of delivery (not 24 hours)</li>
          <li>Send WhatsApp photos/video immediately</li>
          <li>Do not discard the original packaging</li>
          <li>We will arrange a <strong>full replacement or refund</strong> at no cost to you</li>
        </ul>
      </section>

      <section id="contact">
        <h2>8. Contact for Returns</h2>
        <ul>
          <li>💬 WhatsApp: <strong>+92-300-1234567</strong> (fastest response)</li>
          <li>📞 Phone: +92-946-123456</li>
          <li>✉️ Email: ricemill@sameergul.com</li>
          <li>🕐 Hours: Mon–Sat, 8:00 AM – 6:00 PM PKT</li>
        </ul>
      </section>
    </PolicyLayout>
    </PageTransition>
  );
}
