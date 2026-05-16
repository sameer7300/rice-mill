import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const NAV_ITEMS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'refund', label: 'Refund & Returns' },
  { id: 'shipping', label: 'Shipping Policy' },
];

export default function PolicyPage() {
  const [settings, setSettings] = useState<any>({});
  useEffect(() => { api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {}); }, []);

  const formatPKR = (n: number) => `PKR ${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-2">Policies</h1>
        <p className="text-gray-300 text-sm">Al-Noor Rice Mills · Last updated: May 2026</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 flex gap-10">
        {/* Sticky sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            {NAV_ITEMS.map(n => (
              <a key={n.id} href={`#${n.id}`}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors font-medium">
                {n.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="text-xs text-gray-400 px-3">Al-Noor Rice Mills</p>
              <p className="text-xs text-gray-400 px-3">Batkhela, Malakand, KPK</p>
              <a href="tel:+929461234567" className="text-xs text-green-600 hover:underline px-3 block mt-1">+92-946-123456</a>
              <a href="mailto:info@alnoorice.pk" className="text-xs text-green-600 hover:underline px-3 block">info@alnoorice.pk</a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-14">
          {/* PRIVACY POLICY */}
          <section id="privacy" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Privacy Policy</h2>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <PolicyBlock title="Information We Collect">
                When you place an order or create an account, we collect your name, phone number, email address (optional), and delivery address. We also collect order history and payment records. This information is necessary to process your orders and provide customer support.
              </PolicyBlock>
              <PolicyBlock title="How We Use Your Information">
                Your information is used to: process and deliver your orders; send order confirmations and updates via WhatsApp and email; notify you of account changes (password updates, etc.); respond to your inquiries. We do not sell, trade, or share your personal information with third parties.
              </PolicyBlock>
              <PolicyBlock title="WhatsApp Notifications">
                If you provide a phone number, we may send order confirmations and status updates via WhatsApp. These messages are transactional (not marketing). You can opt out by contacting us at <a href="mailto:info@alnoorice.pk" className="text-green-600 hover:underline">info@alnoorice.pk</a>.
              </PolicyBlock>
              <PolicyBlock title="Data Security">
                All passwords are securely hashed using bcrypt. We do not store payment card details. Your shopping cart is stored locally in your browser (localStorage) and is never transmitted to our servers until checkout. We use HTTPS for all data transmission.
              </PolicyBlock>
              <PolicyBlock title="Cookies & Local Storage">
                We use browser localStorage to maintain your shopping cart and authentication session. We do not use tracking cookies or third-party advertising cookies.
              </PolicyBlock>
              <PolicyBlock title="Data Requests">
                To request a copy of your data or to request deletion of your account, email us at <a href="mailto:info@alnoorice.pk" className="text-green-600 hover:underline">info@alnoorice.pk</a>. We will respond within 7 business days.
              </PolicyBlock>
            </div>
          </section>

          {/* TERMS */}
          <section id="terms" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Terms & Conditions</h2>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <PolicyBlock title="Acceptance of Terms">
                By accessing the Al-Noor Rice Mills website or placing an order, you agree to these Terms & Conditions. If you do not agree, please do not use our services.
              </PolicyBlock>
              <PolicyBlock title="Product Descriptions & Pricing">
                All prices are displayed in Pakistani Rupees (PKR) and include applicable taxes. We make every effort to accurately describe our products, but we reserve the right to correct errors and omissions at any time. Prices may change without prior notice; the price displayed at checkout is the final price.
              </PolicyBlock>
              <PolicyBlock title="Order Placement & Confirmation">
                Placing an order constitutes an offer to purchase. Your order is confirmed when you receive a WhatsApp or email confirmation from us. We reserve the right to cancel or refuse orders in cases of pricing errors, stock unavailability, or suspected fraud.
              </PolicyBlock>
              <PolicyBlock title="Payment Terms">
                We currently accept Cash on Delivery (COD) and Bank Transfer. For bank transfers, payment must be confirmed before dispatch. For COD orders, payment is due upon delivery.
              </PolicyBlock>
              <PolicyBlock title="Order Cancellation">
                Orders may be cancelled before dispatch by contacting us on WhatsApp at +92-300-1234567. Once dispatched, the order cannot be cancelled — please see our Refund Policy below.
              </PolicyBlock>
              <PolicyBlock title="Minimum Order Quantities">
                Each product has a minimum order quantity as listed on the product page. Orders below the minimum will not be processed.
              </PolicyBlock>
              <PolicyBlock title="Governing Law">
                These terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes will be subject to the jurisdiction of courts in Malakand, KPK, Pakistan.
              </PolicyBlock>
            </div>
          </section>

          {/* REFUND */}
          <section id="refund" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Refund & Return Policy</h2>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-green-800 mb-1">Our Quality Guarantee</p>
                <p className="text-green-700">We stand behind every bag of rice we sell. If you receive a product that does not match the description, is damaged, or has quality issues, we will replace it or issue a full refund.</p>
              </div>
              <PolicyBlock title="How to Report an Issue">
                Report any quality issues within <strong>24 hours of delivery</strong> by contacting us on WhatsApp at +92-300-1234567 or email info@alnoorice.pk. Please include:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Your order number (e.g. ORD-202505-12345)</li>
                  <li>A clear photo of the product and packaging</li>
                  <li>Description of the issue</li>
                </ul>
              </PolicyBlock>
              <PolicyBlock title="Return Conditions">
                Returns are accepted within 24 hours of delivery, subject to the following conditions:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Product must be in original, sealed packaging</li>
                  <li>Product must not have been opened or used</li>
                  <li>Return must be reported within 24 hours of delivery</li>
                </ul>
              </PolicyBlock>
              <PolicyBlock title="Non-Returnable Items">
                The following items cannot be returned: opened bags of rice; custom/bulk orders; items purchased on clearance or heavy discount; items showing misuse or mishandling by the buyer.
              </PolicyBlock>
              <PolicyBlock title="Refund Process">
                Once a return is approved, we will arrange pick-up or ask you to ship the item back. Refunds are processed within <strong>5–7 business days</strong> via bank transfer to the account details you provide.
              </PolicyBlock>
            </div>
          </section>

          {/* SHIPPING */}
          <section id="shipping" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Shipping Policy</h2>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <PolicyBlock title="Coverage Area">
                We currently deliver to all major cities and districts across Pakistan. Remote areas may be subject to additional lead time.
              </PolicyBlock>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Region</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Delivery Time</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Carrier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { region: 'Batkhela / Malakand District', time: 'Same day / Next day', carrier: 'Own delivery' },
                      { region: 'Other KPK Cities', time: '2–3 business days', carrier: 'TCS / Leopards' },
                      { region: 'Punjab (Lahore, Islamabad, etc.)', time: '3–4 business days', carrier: 'TCS / Leopards' },
                      { region: 'Sindh (Karachi, Hyderabad)', time: '4–5 business days', carrier: 'TCS / Leopards' },
                      { region: 'Balochistan / AJK', time: '5–7 business days', carrier: 'TCS' },
                    ].map(r => (
                      <tr key={r.region} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{r.region}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.time}</td>
                        <td className="px-4 py-3 text-gray-500">{r.carrier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PolicyBlock title="Shipping Fees">
                <div className="space-y-1 mt-1">
                  <p>Standard shipping fee: <strong>{formatPKR(settings.shippingFee || 500)}</strong></p>
                  <p className="text-green-700 font-medium">Free shipping on orders above <strong>{formatPKR(settings.freeShippingAbove || 10000)}</strong></p>
                </div>
              </PolicyBlock>
              <PolicyBlock title="Order Tracking">
                You can track your order anytime at <Link to="/track" className="text-green-600 hover:underline font-medium">alnoorice.pk/track</Link> using your order number (e.g. ORD-202505-12345). You will also receive WhatsApp notifications when your order is shipped.
              </PolicyBlock>
              <PolicyBlock title="Damaged in Transit">
                If your order arrives damaged, please report it immediately at delivery — do not accept the package. Take photos and contact us at +92-300-1234567. We will arrange replacement at no extra cost.
              </PolicyBlock>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-1.5">{title}</h3>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
