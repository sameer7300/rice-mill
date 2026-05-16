import { Helmet } from 'react-helmet-async';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function TermsPage() {
  return (
    <PageTransition>
    <PolicyLayout title="Terms & Conditions" updated="January 2026">
      <Helmet>
        <title>Terms & Conditions — Al-Noor Rice Mills</title>
        <meta name="description" content="Terms and conditions for purchasing from Al-Noor Rice Mills, Batkhela, KPK, Pakistan." />
      </Helmet>

      <section id="acceptance">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Al-Noor Rice Mills website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
      </section>

      <section id="about">
        <h2>2. About Al-Noor Rice Mills</h2>
        <p>Al-Noor Rice Mills is a rice processing and retail business established in 2010, located at Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan. We operate Mon–Sat, 8:00 AM – 6:00 PM PKT.</p>
      </section>

      <section id="products-pricing">
        <h2>3. Products & Pricing</h2>
        <ul>
          <li>All prices are listed in Pakistani Rupees (PKR) and include applicable taxes.</li>
          <li>Prices are subject to change without prior notice due to market fluctuations.</li>
          <li>Product images are representative — actual color may vary slightly due to screen settings.</li>
          <li>Grade descriptions (Premium/Standard/Economy) follow industry standards for rice grading in Pakistan.</li>
          <li>We reserve the right to limit quantities sold per customer.</li>
        </ul>
      </section>

      <section id="orders">
        <h2>4. Orders & Contract</h2>
        <ul>
          <li>Placing an order constitutes an <strong>offer to purchase</strong>, not a binding contract.</li>
          <li>We confirm acceptance via email and/or WhatsApp after reviewing stock availability.</li>
          <li>We reserve the right to reject any order due to stock unavailability, pricing errors, or suspected fraud.</li>
          <li>Order confirmation is sent to the email/phone provided at checkout.</li>
        </ul>
      </section>

      <section id="payment">
        <h2>5. Payment Terms</h2>
        <p>We accept the following payment methods:</p>
        <ul>
          <li><strong>Cash on Delivery (COD):</strong> Payment collected at time of delivery. Customer must be present.</li>
          <li><strong>Bank Transfer:</strong> Full payment required before dispatch. Share payment screenshot via WhatsApp (+92-300-1234567).</li>
          <li><strong>EasyPaisa / JazzCash:</strong> Transfer to our registered account before dispatch.</li>
        </ul>
        <p>For bank transfers, orders are dispatched only after payment confirmation.</p>
      </section>

      <section id="delivery">
        <h2>6. Delivery</h2>
        <ul>
          <li>We deliver across all of Pakistan. See our <strong>Shipping Policy</strong> for timelines by region.</li>
          <li>Risk and title of goods passes to the buyer upon successful delivery.</li>
          <li>We are not responsible for delays caused by natural disasters, courier strikes, or force majeure events.</li>
        </ul>
      </section>

      <section id="cancellations">
        <h2>7. Cancellations</h2>
        <ul>
          <li><strong>Before Dispatch:</strong> Cancel anytime for a full refund. Contact us via WhatsApp or phone.</li>
          <li><strong>After Dispatch:</strong> Refuse the delivery at the door — the courier will return it to us.</li>
          <li><strong>Custom/Bulk Orders (500kg+):</strong> Non-cancellable once processing has begun. Contact us immediately if circumstances change.</li>
        </ul>
      </section>

      <section id="intellectual-property">
        <h2>8. Intellectual Property</h2>
        <p>All content on this website — including the Al-Noor Rice Mills brand, logo, product descriptions, and photographs — is our property and protected under Pakistani copyright law. Reproduction without written permission is prohibited.</p>
      </section>

      <section id="liability">
        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Al-Noor Rice Mills shall not be liable for indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability shall not exceed the amount paid for the relevant order.</p>
      </section>

      <section id="governing-law">
        <h2>10. Governing Law</h2>
        <p>These terms are governed by the laws of the <strong>Islamic Republic of Pakistan</strong>. Any disputes shall first be resolved through direct negotiation, failing which through the courts of <strong>Malakand, Khyber Pakhtunkhwa</strong>.</p>
      </section>

      <section id="contact">
        <h2>11. Contact</h2>
        <ul>
          <li><strong>Al-Noor Rice Mills</strong></li>
          <li>Main GT Road, Batkhela, Malakand, KPK 23200, Pakistan</li>
          <li>📞 +92-946-123456 &nbsp;|&nbsp; 📱 +92-300-1234567</li>
          <li>✉️ ricemill@sameergul.com</li>
        </ul>
      </section>
    </PolicyLayout>
    </PageTransition>
  );
}
