import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import api from '../../api';
import PolicyLayout from './PolicyLayout';
import PageTransition from '../../components/PageTransition';
import { useCurrency } from '../../contexts/CurrencyContext';

export default function ShippingPolicyPage() {
  const [settings, setSettings] = useState<any>({});
  const { format } = useCurrency();
  useEffect(() => { api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {}); }, []);
  const freeAbove = format(settings.freeShippingAbove ?? 10000);
  const stdFee    = format(settings.shippingFee ?? 500);

  return (
    <PageTransition>
      <Helmet>
        <title>Shipping Policy — Al-Noor Rice Mills</title>
        <meta name="description" content="Full shipping policy for domestic Pakistan and international orders from Al-Noor Rice Mills — zones, timelines, fees, customs, packaging, and tracking." />
      </Helmet>
      <PolicyLayout title="Shipping Policy" updated="1 May 2026"
        icon={<Truck size={22} className="text-white" />}>

        <div className="callout callout-green">
          Al-Noor Rice Mills ships to <strong>all of Pakistan</strong> and to <strong>international destinations worldwide</strong>. This policy explains our shipping zones, delivery timelines, costs, customs responsibilities, dispatch schedule, packaging standards, and tracking procedures.
        </div>

        {/* ─── 1 ─────────────────────────────────────────────────────────── */}
        <h2>1. Shipping Coverage</h2>

        <h3>1.1 Domestic — Pakistan</h3>
        <p>We deliver to all districts, cities, towns, and villages across Pakistan. Deliveries to major urban centres (Lahore, Karachi, Islamabad, Peshawar, Quetta) are handled by our national courier partners TCS and Leopards. Local deliveries within Batkhela, Malakand, and adjacent areas may be fulfilled by our own vehicle for faster service.</p>

        <h3>1.2 International</h3>
        <p>We export Pakistani rice globally. International orders are accepted from any country subject to:</p>
        <ul>
          <li>Rice importation being permitted in your country at the ordered quantity</li>
          <li>A suitable international courier route being available</li>
          <li>Your order value and weight falling within our standard shipping tier (for custom or bulk freight over 500 kg, please submit a <a href="/wholesale">Wholesale Inquiry</a>)</li>
        </ul>
        <p>If you are unsure whether we can ship to your specific location, contact us before placing an order.</p>

        <h3>1.3 Restricted Destinations</h3>
        <p>We cannot ship to destinations subject to international sanctions, UN arms embargoes, or comprehensive trade restrictions. We also cannot ship to jurisdictions where Pakistani rice importation is prohibited by local law. A list of currently restricted destinations is available on request.</p>

        {/* ─── 2 ─────────────────────────────────────────────────────────── */}
        <h2>2. Domestic Delivery Timelines</h2>

        <h3>2.1 Estimated Delivery by Region</h3>
        <table>
          <thead><tr><th>Region / Area</th><th>Estimated Delivery Time</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Batkhela, Dargai, Malakand city (local)</td><td>Same day or next day</td><td>Own vehicle delivery where available</td></tr>
            <tr><td>Rest of KPK province</td><td>1–3 business days</td><td>Peshawar, Mardan, Swat, Dir, Abbottabad</td></tr>
            <tr><td>Islamabad / Rawalpindi</td><td>2–3 business days</td><td>—</td></tr>
            <tr><td>Punjab (Lahore, Faisalabad, Multan, Gujranwala)</td><td>2–4 business days</td><td>Major cities at lower end</td></tr>
            <tr><td>Karachi and urban Sindh</td><td>3–5 business days</td><td>—</td></tr>
            <tr><td>Interior Sindh</td><td>4–7 business days</td><td>Remote areas may take longer</td></tr>
            <tr><td>Balochistan (Quetta, Hub, Turbat)</td><td>5–8 business days</td><td>Quetta at lower end; remote districts at upper end</td></tr>
            <tr><td>Gilgit-Baltistan</td><td>5–9 business days</td><td>Seasonal road conditions may affect timing</td></tr>
            <tr><td>Azad Jammu &amp; Kashmir (AJK)</td><td>4–7 business days</td><td>—</td></tr>
            <tr><td>FATA / Tribal Districts (merged)</td><td>4–8 business days</td><td>Coverage depends on courier routing</td></tr>
          </tbody>
        </table>

        <h3>2.2 Understanding "Business Days"</h3>
        <p>Business days for the purpose of this policy are Monday, Tuesday, Wednesday, Thursday, and Saturday. <strong>Friday is excluded</strong> (Jumu'ah). Pakistani public holidays are also excluded. If your order is placed on a Thursday, the "next business day" for dispatch purposes is Saturday.</p>

        <h3>2.3 These Are Estimates, Not Guarantees</h3>
        <p>Domestic delivery timelines are estimates based on historical courier performance data. Actual delivery may vary due to: courier capacity at the time of dispatch, routing changes, adverse weather, public holidays, labour actions, or force majeure events. We will keep you informed of any known significant delays.</p>

        {/* ─── 3 ─────────────────────────────────────────────────────────── */}
        <h2>3. International Delivery Timelines</h2>

        <h3>3.1 Estimated Transit by Zone</h3>
        <table>
          <thead><tr><th>Zone</th><th>Key Countries</th><th>Transit Time (business days)</th></tr></thead>
          <tbody>
            <tr><td>Gulf — Standard</td><td>UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman</td><td>5–10</td></tr>
            <tr><td>Gulf — Economy</td><td>Yemen, Iraq (where accessible)</td><td>10–21</td></tr>
            <tr><td>South Asia</td><td>India, Bangladesh, Sri Lanka, Nepal</td><td>7–14</td></tr>
            <tr><td>Southeast Asia</td><td>Malaysia, Singapore, Indonesia, Thailand</td><td>8–16</td></tr>
            <tr><td>East Asia</td><td>Japan, China, South Korea, Hong Kong</td><td>10–18</td></tr>
            <tr><td>Europe (Western)</td><td>UK, Germany, France, Netherlands, Belgium, Sweden, Spain</td><td>10–18</td></tr>
            <tr><td>Europe (Eastern)</td><td>Poland, Czech Republic, Romania, Hungary</td><td>12–21</td></tr>
            <tr><td>North America</td><td>United States (all states), Canada</td><td>12–21</td></tr>
            <tr><td>Oceania</td><td>Australia, New Zealand</td><td>14–25</td></tr>
            <tr><td>Africa (North)</td><td>Egypt, Morocco, Tunisia, Libya</td><td>10–20</td></tr>
            <tr><td>Africa (Sub-Saharan)</td><td>Nigeria, South Africa, Kenya, Ethiopia, Ghana</td><td>14–28</td></tr>
            <tr><td>Middle East (Non-Gulf)</td><td>Jordan, Lebanon, Turkey</td><td>8–16</td></tr>
            <tr><td>Central Asia</td><td>Kazakhstan, Uzbekistan, Tajikistan, Kyrgyzstan</td><td>10–20</td></tr>
            <tr><td>Rest of World</td><td>All other accessible destinations</td><td>15–35</td></tr>
          </tbody>
        </table>

        <h3>3.2 Customs Clearance Time</h3>
        <div className="callout callout-amber">
          <strong>Important:</strong> The transit times above do not include customs clearance time. Customs processing varies by country and can add anywhere from <strong>1 business day</strong> (e.g., UAE) to <strong>3–4 weeks</strong> (e.g., some African countries) to the total delivery time. We have no control over how quickly customs processes your shipment.
        </div>

        <h3>3.3 Express and Economy Options</h3>
        <p>For most international destinations, we offer both express (DHL/FedEx priority) and economy (EMS / Pakistan Post EMS) shipping. The option available to you and its cost will be shown during checkout based on your country and order weight. Express shipping typically halves the transit time but costs significantly more.</p>

        {/* ─── 4 ─────────────────────────────────────────────────────────── */}
        <h2>4. Shipping Fees</h2>

        <h3>4.1 Domestic Shipping Fees</h3>
        <ul>
          <li><strong>Standard shipping fee:</strong> {stdFee} per order (all domestic destinations)</li>
          <li><strong>Free shipping:</strong> All domestic orders with a subtotal of {freeAbove} or more qualify for free shipping</li>
          <li><strong>Local delivery (Batkhela area):</strong> Free for orders of 50 kg or above; {stdFee} for smaller orders</li>
          <li><strong>Same-day local delivery:</strong> Available within Batkhela and Malakand for orders placed before 12:00 PM on weekdays; {stdFee} applies regardless of order value</li>
        </ul>

        <h3>4.2 International Shipping Fees</h3>
        <p>International shipping fees are calculated at checkout using a two-part formula set by our shipping zone configuration:</p>
        <ul>
          <li><strong>Base fee</strong> (fixed charge per zone) + <strong>per-kg rate</strong> × total order weight in kg</li>
          <li>Both components are denominated in USD and converted to your selected currency at the current exchange rate</li>
          <li>Fees are displayed on the checkout page before you confirm the order</li>
        </ul>
        <p>Example: A Middle East zone with a base fee of $25 and per-kg rate of $0.80, for an order of 25 kg = $25 + (25 × $0.80) = <strong>$45</strong> total shipping.</p>

        <h3>4.3 Free International Shipping</h3>
        <p>Selected shipping zones may have a free-shipping threshold (shown on the checkout page). If your order subtotal (in USD) meets or exceeds the threshold for your zone, shipping is provided free of charge.</p>

        <h3>4.4 Bulk Freight — Custom Quotation</h3>
        <p>For international orders of <strong>500 kg or more</strong>, standard courier shipping may not be the most cost-effective option. We can arrange sea freight (FCL or LCL container), air cargo, or consolidated freight. To receive a custom quotation, submit a <a href="/wholesale">Wholesale Inquiry</a> with your destination port, required quantity, and preferred incoterms (FOB, CIF, DAP, etc.).</p>

        {/* ─── 5 ─────────────────────────────────────────────────────────── */}
        <h2>5. Customs, Import Duties, and Taxes</h2>

        <h3>5.1 Buyer's Responsibility</h3>
        <div className="callout callout-blue">
          <strong>For all international orders, import duties, customs taxes, VAT/GST, and any other fees levied by your country's customs authority are entirely the buyer's responsibility.</strong> These charges are separate from our product prices and shipping fees and are not included in what you pay us.
        </div>

        <h3>5.2 Why We Cannot Pay These Fees</h3>
        <p>Each country has its own import tariff schedule. Rice import duties range from 0% in some Gulf states to 70%+ in some countries. It is impractical for us to pre-calculate and collect these fees on behalf of hundreds of customs authorities worldwide. Your courier or a local customs broker will contact you with any duties owed before or at delivery.</p>

        <h3>5.3 Our Customs Documentation</h3>
        <p>We provide accurate and compliant customs documentation with every international shipment, including:</p>
        <ul>
          <li>Commercial Invoice stating accurate product description, quantity, unit price, and total declared value in USD</li>
          <li>Packing List showing number of bags, net weight, and gross weight per package</li>
          <li>Certificate of Origin (Pakistan) where required or requested</li>
          <li>Phytosanitary Certificate (confirming the product is free of pests and meets importing country's plant health standards) — available on request at an additional fee of PKR 2,000–5,000 per shipment</li>
          <li>Halal Certificate — available on request at an additional fee</li>
        </ul>

        <h3>5.4 Under-Declaration Refusal</h3>
        <p>We will not under-declare the value of your goods on customs documents or falsely mark shipments as "gifts" to help you avoid customs duties. This is illegal and could result in seizure of the shipment, fines, or prosecution of both parties. All declared values are accurate commercial values.</p>

        <h3>5.5 Phytosanitary Requirements</h3>
        <p>Many countries require a phytosanitary certificate for rice importation. It is your responsibility to check whether your country requires this certificate before placing an order. We can arrange one upon request (advance notice of at least 5 business days required) at an additional cost.</p>

        <h3>5.6 Restricted and Prohibited Importation</h3>
        <p>Some countries restrict or prohibit the importation of specific rice varieties, polished rice, or bulk food commodities. It is your responsibility to verify that importing rice is legal in your country at the quantity you are ordering. Al-Noor Rice Mills is not liable for shipments refused or seized because of legal restrictions in the destination country.</p>

        {/* ─── 6 ─────────────────────────────────────────────────────────── */}
        <h2>6. Dispatch Schedule and Cut-Off Times</h2>

        <h3>6.1 Dispatch Cut-Off</h3>
        <table>
          <thead><tr><th>Day</th><th>Order placed by</th><th>Dispatch</th></tr></thead>
          <tbody>
            <tr><td>Monday – Thursday</td><td>2:00 PM PKT</td><td>Same day</td></tr>
            <tr><td>Monday – Thursday</td><td>After 2:00 PM PKT</td><td>Next business day (Saturday)</td></tr>
            <tr><td>Saturday</td><td>12:00 PM PKT</td><td>Same day (if stock available)</td></tr>
            <tr><td>Saturday</td><td>After 12:00 PM PKT</td><td>Monday</td></tr>
            <tr><td>Friday (Jumu'ah)</td><td>Any time</td><td>Saturday (next business day)</td></tr>
            <tr><td>Public holidays</td><td>Any time</td><td>First business day after holiday</td></tr>
          </tbody>
        </table>

        <h3>6.2 Payment Verification Delay</h3>
        <p>For orders paid by bank transfer, EasyPaisa, JazzCash, or bank wire, dispatch is subject to payment being confirmed by our accounts team. Payment confirmation typically occurs within 2–4 business hours of receipt during business hours. International bank wires may take 1–3 business days to clear depending on correspondent banking routes.</p>

        <h3>6.3 Milling-to-Order Products</h3>
        <p>Some products, particularly bulk or custom-grade orders, may be milled to order. In such cases, the order confirmation will indicate an extended dispatch timeline (typically 2–5 additional business days). You will be informed of this at checkout or via email after order placement.</p>

        {/* ─── 7 ─────────────────────────────────────────────────────────── */}
        <h2>7. Courier Partners</h2>

        <h3>7.1 Domestic Couriers</h3>
        <table>
          <thead><tr><th>Courier</th><th>Coverage</th><th>Tracking</th></tr></thead>
          <tbody>
            <tr><td>TCS Courier</td><td>Nationwide including rural areas; air-connect for remote cities</td><td>Real-time via TCS website / app</td></tr>
            <tr><td>Leopards Courier</td><td>Nationwide; strong in Punjab and KPK</td><td>Real-time via Leopards website</td></tr>
            <tr><td>Al-Noor Own Vehicle</td><td>Batkhela, Malakand, Dargai, and nearby areas only</td><td>Driver contact number provided</td></tr>
            <tr><td>M&P Express</td><td>Selected urban centres</td><td>Via M&P website</td></tr>
          </tbody>
        </table>

        <h3>7.2 International Couriers</h3>
        <table>
          <thead><tr><th>Courier</th><th>Service Type</th><th>Coverage</th></tr></thead>
          <tbody>
            <tr><td>DHL Express</td><td>Express priority (2–5 days to major hubs)</td><td>220+ countries</td></tr>
            <tr><td>FedEx International</td><td>Express priority</td><td>220+ countries</td></tr>
            <tr><td>EMS (Pakistan Post)</td><td>Economy international</td><td>190+ countries</td></tr>
            <tr><td>UPS</td><td>Express / standard</td><td>Selected routes</td></tr>
            <tr><td>Aramex</td><td>Middle East and South Asia express</td><td>Gulf, South Asia, East Africa</td></tr>
          </tbody>
        </table>
        <p>We select the most appropriate courier for your destination and order size. You will be informed of the assigned courier and tracking number upon dispatch.</p>

        {/* ─── 8 ─────────────────────────────────────────────────────────── */}
        <h2>8. Order Tracking</h2>

        <h3>8.1 Tracking Notification</h3>
        <p>Once your order is dispatched, we will send you:</p>
        <ul>
          <li>An email notification (if you provided an email address) with the courier name and tracking number</li>
          <li>A WhatsApp message (if you provided a phone number and opted into notifications) with the same information</li>
          <li>An update on your order detail page in your account dashboard</li>
        </ul>

        <h3>8.2 Tracking Your Order</h3>
        <ul>
          <li><strong>On our website:</strong> Visit <a href="/track">alnoorice.pk/track</a> and enter your order number</li>
          <li><strong>Courier websites:</strong> Use the tracking number provided on the respective courier's website for real-time location updates</li>
          <li><strong>In your account:</strong> Go to My Orders → click your order → the courier and tracking number are shown in the shipping section</li>
        </ul>

        <h3>8.3 Tracking Delays</h3>
        <p>Tracking systems can take up to <strong>24 hours</strong> to show initial scan data after dispatch. If tracking is not updating after 48 hours, contact us and we will investigate with the courier directly.</p>

        {/* ─── 9 ─────────────────────────────────────────────────────────── */}
        <h2>9. Packaging Standards</h2>

        <h3>9.1 Primary Packaging (Product Bags)</h3>
        <ul>
          <li>All rice is packed in food-grade woven polypropylene or laminated BOPP bags</li>
          <li>Standard sizes: 5 kg, 10 kg, 25 kg, and 50 kg</li>
          <li>Each bag is heat-sealed to prevent moisture ingress</li>
          <li>Printed on every bag: brand name, product variety, quality grade, net weight, lot number, pack date, and storage instructions</li>
          <li>Premium products (Basmati 1121, Super Kernel) are packed in laminated bags with enhanced moisture barrier properties</li>
        </ul>

        <h3>9.2 Secondary Packaging (Outer Carton / Transit Packaging)</h3>
        <ul>
          <li>Domestic orders: typically shipped in their primary bag with a label affixed, or in a courier-provided outer bag for smaller quantities</li>
          <li>International orders: all bags are placed in reinforced double-wall corrugated cardboard cartons with appropriate void fill to prevent movement in transit</li>
          <li>Cartons are sealed with high-strength tape and clearly marked with destination address, our return address, and appropriate handling instructions</li>
          <li>Fragile bags or valuable orders may receive additional protection with stretch wrap or strapping</li>
        </ul>

        <h3>9.3 Sustainability</h3>
        <p>We are gradually transitioning to more sustainable packaging materials. Our woven bags are recyclable. We minimise void fill and avoid single-use plastic where alternatives are available. We welcome feedback on our packaging practices.</p>

        {/* ─── 10 ─────────────────────────────────────────────────────────── */}
        <h2>10. Delivery Attempts and Failed Deliveries</h2>

        <h3>10.1 Delivery Attempt Procedure</h3>
        <p>For domestic orders, couriers typically make up to <strong>3 delivery attempts</strong>. A notification (SMS, courier app, or physical card) is left after each failed attempt. After 3 failed attempts, the parcel may be held at the courier's depot for up to 5 days before being returned to us.</p>

        <h3>10.2 Picking Up from Depot</h3>
        <p>If a delivery attempt fails, you may arrange to collect the parcel from the courier's nearest depot by contacting the courier directly with your tracking number. We encourage this option to avoid return and redelivery delays.</p>

        <h3>10.3 Returned Parcels</h3>
        <p>If a parcel is returned to us due to:</p>
        <ul>
          <li><strong>Courier error or failed delivery without notification:</strong> We will redeliver at no additional charge. Please contact us promptly when you become aware the delivery failed.</li>
          <li><strong>Incorrect address provided at checkout:</strong> Redelivery to a correct address will be charged the standard shipping fee. We cannot deliver to a different address without your confirmation and payment.</li>
          <li><strong>Customer refusal at delivery:</strong> Return shipping costs are deducted from any applicable refund. A restocking fee of PKR 200 per bag may apply.</li>
        </ul>

        <h3>10.4 Perishability Consideration</h3>
        <p>While rice has a long shelf life (12–24 months in appropriate storage conditions), repeated transit and handling increase the risk of packaging damage. We recommend resolving delivery issues promptly to avoid product quality degradation from prolonged transit.</p>

        {/* ─── 11 ─────────────────────────────────────────────────────────── */}
        <h2>11. Risk, Insurance, and Claims</h2>

        <h3>11.1 Transfer of Risk</h3>
        <p>Risk of loss or damage to your order transfers from Al-Noor Rice Mills to you (or your authorised recipient) at the moment the courier scans the parcel as delivered. Prior to that point, we retain responsibility for the goods.</p>

        <h3>11.2 Transit Insurance</h3>
        <p>All domestic orders include basic courier liability coverage. International orders shipped via DHL or FedEx include their standard declared value liability cover. We can arrange additional transit insurance for high-value international orders on request (fees apply — contact us before ordering).</p>

        <h3>11.3 Damage in Transit</h3>
        <p>If your parcel arrives visibly damaged:</p>
        <ul>
          <li>Note the damage on the courier's delivery receipt / POD (proof of delivery) before signing, if possible</li>
          <li>Take photographs of the outer packaging, inner packaging, and the product before and after opening</li>
          <li>Report to us within <strong>24 hours</strong> of delivery with your order number and photographs</li>
          <li>Keep the damaged packaging — the courier may need to inspect it to process a claim</li>
        </ul>
        <p>We will file a courier claim on your behalf and, once resolved, arrange a replacement or refund per our Refund &amp; Returns Policy.</p>

        {/* ─── 12 ─────────────────────────────────────────────────────────── */}
        <h2>12. Special Circumstances</h2>

        <h3>12.1 Remote and Hard-to-Reach Areas</h3>
        <p>Some rural, tribal, or geographically remote areas in Pakistan and internationally may have limited courier service. For such destinations:</p>
        <ul>
          <li>We will confirm whether delivery is possible before processing your order</li>
          <li>Additional delivery fees may apply</li>
          <li>Delivery timelines may extend beyond our standard estimates</li>
          <li>We may suggest alternative arrangements (e.g., delivery to a nearby city where you can collect)</li>
        </ul>

        <h3>12.2 Seasonal and Weather Disruptions</h3>
        <p>Monsoon season (July–September) and winter snowfall (November–February) in northern Pakistan can cause significant courier delays. We will proactively inform customers of known disruptions affecting their region. During peak disruption periods, estimated delivery times may increase by 2–5 business days.</p>

        <h3>12.3 Ramadan</h3>
        <p>Demand for rice increases significantly during Ramadan. We advise placing orders at least 1 week ahead of your required date during this period, as processing and dispatch may take an additional 1–3 business days due to higher order volumes. Courier delivery timelines may also extend slightly.</p>

        {/* ─── 13 ─────────────────────────────────────────────────────────── */}
        <h2>13. Contact for Shipping Enquiries</h2>
        <ul>
          <li><strong>WhatsApp (fastest):</strong> +92-300-1234567</li>
          <li><strong>Email:</strong> <a href="mailto:ricemill@sameergul.com">ricemill@sameergul.com</a></li>
          <li><strong>Phone:</strong> +92-946-123456 · Mon–Sat 8 AM–6 PM PKT</li>
          <li><strong>Track an order:</strong> <a href="/track">alnoorice.pk/track</a></li>
        </ul>
        <p>For wholesale, export, sea freight, or custom delivery arrangements, visit our <a href="/wholesale">Wholesale page</a> or email us with your requirements.</p>

      </PolicyLayout>
    </PageTransition>
  );
}
