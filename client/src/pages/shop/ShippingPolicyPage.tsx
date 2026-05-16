import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import api from '../../api';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';

export default function ShippingPolicyPage() {
  const [settings, setSettings] = useState<any>({});
  useEffect(() => { api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {}); }, []);
  const freeAbove = settings.freeShippingAbove ? `PKR ${Number(settings.freeShippingAbove).toLocaleString()}` : 'PKR 10,000';
  const stdFee = settings.shippingFee ? `PKR ${Number(settings.shippingFee).toLocaleString()}` : 'PKR 500';

  return (
    <PageTransition>
    <PolicyLayout title="Shipping Policy" updated="January 2026">
      <Helmet>
        <title>Shipping Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Delivery timelines, shipping fees, and coverage information for Al-Noor Rice Mills orders across Pakistan." />
      </Helmet>

      <section id="coverage">
        <h2>1. Shipping Coverage</h2>
        <p>We deliver to <strong>all cities and towns across Pakistan</strong>. For international orders (UAE, UK, etc.), please contact us directly for a custom quote.</p>
      </section>

      <section id="timelines">
        <h2>2. Delivery Timelines</h2>
        <table>
          <thead>
            <tr><th>Region</th><th>Estimated Time</th></tr>
          </thead>
          <tbody>
            <tr><td>Batkhela / Malakand District</td><td>Same day / Next day</td></tr>
            <tr><td>Peshawar / Mardan / KPK</td><td>1–2 business days</td></tr>
            <tr><td>Islamabad / Rawalpindi</td><td>2–3 business days</td></tr>
            <tr><td>Lahore / Central Punjab</td><td>3–4 business days</td></tr>
            <tr><td>Karachi / Sindh</td><td>4–5 business days</td></tr>
            <tr><td>Balochistan / Gilgit-Baltistan</td><td>5–7 business days</td></tr>
          </tbody>
        </table>
        <p>Timelines are estimates and may vary due to courier load, public holidays, or weather conditions.</p>
      </section>

      <section id="fees">
        <h2>3. Shipping Fees</h2>
        <ul>
          <li><strong>Free Shipping:</strong> On all orders above <strong>{freeAbove}</strong></li>
          <li><strong>Standard Fee:</strong> <strong>{stdFee}</strong> for orders below the free-shipping threshold</li>
          <li><strong>Bulk Orders (500kg+):</strong> Custom shipping quote — contact us via WhatsApp</li>
          <li><strong>Same-Day Delivery (Batkhela area):</strong> Available for orders placed before 12 PM</li>
        </ul>
      </section>

      <section id="dispatch">
        <h2>4. Dispatch Schedule</h2>
        <ul>
          <li>Orders placed before <strong>2:00 PM PKT</strong>: Same-day dispatch</li>
          <li>Orders placed after 2:00 PM: Dispatched next business day</li>
          <li>Friday: Limited dispatch (Juma prayers, 12 PM – 2 PM)</li>
          <li>Sunday: No dispatch</li>
          <li>Public holidays: No dispatch — orders queued for next business day</li>
        </ul>
      </section>

      <section id="couriers">
        <h2>5. Courier Partners</h2>
        <ul>
          <li><strong>TCS Courier</strong> — primary partner for most of Pakistan</li>
          <li><strong>Leopards Courier</strong> — secondary, especially for remote areas</li>
          <li><strong>Al-Noor Own Vehicle</strong> — Batkhela, Malakand, and surrounding tehsils (free delivery within 30km)</li>
        </ul>
        <p>We select the most suitable courier based on your location and order size.</p>
      </section>

      <section id="tracking">
        <h2>6. Order Tracking</h2>
        <ul>
          <li>Track your order at <strong>/track</strong> using your order number</li>
          <li>WhatsApp updates sent at each status change (confirmed → shipped → delivered)</li>
          <li>Email notifications for major status changes</li>
          <li>Courier tracking number provided once dispatched</li>
        </ul>
      </section>

      <section id="packaging">
        <h2>7. Packaging</h2>
        <ul>
          <li>25kg and 50kg orders: Original mill jute/PP bags, sealed and labelled</li>
          <li>Smaller quantities: Food-grade sealed polypropylene bags</li>
          <li>Premium grade rice: Extra bubble-wrap protection on bag corners</li>
          <li>All bags are moisture-proof sealed</li>
        </ul>
      </section>

      <section id="failed-delivery">
        <h2>8. Failed Delivery</h2>
        <ul>
          <li>Courier will attempt delivery <strong>3 times</strong> before returning to sender</li>
          <li>You'll be contacted by phone before each attempt</li>
          <li>Re-delivery after return: Additional shipping fee applies</li>
          <li><strong>COD orders:</strong> You must be present with cash at delivery time</li>
        </ul>
      </section>

      <section id="contact">
        <h2>9. Contact for Shipping Queries</h2>
        <ul>
          <li>💬 WhatsApp: <strong>+92-300-1234567</strong> (fastest response)</li>
          <li>📞 Phone: +92-946-123456</li>
          <li>✉️ ricemill@sameergul.com</li>
          <li>🕐 Mon–Sat, 8:00 AM – 6:00 PM PKT</li>
        </ul>
      </section>
    </PolicyLayout>
    </PageTransition>
  );
}
