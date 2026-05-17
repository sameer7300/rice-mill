/* global React, RiceBag3D, FallingGrains, Counter, Reveal, HeroCenter, HeroMagazine, HeroCatalogue, HeroEditorial */
// Home v3 — refined professional e-commerce, 2026 polish

const { useState: useStateH, useRef: useRefH, useEffect: useEffectH } = React;

const PRODUCTS = [
  { id: 'super-kernel', name: 'Super Kernel', italic: 'Basmati', variety: 'Basmati', grade: 'A', price: 480, badge: 'Signature', desc: 'Long-grain basmati, aged twelve months in jute. Cooks fluffy.', stock: 2400, label: 'BASMATI · 5KG' },
  { id: 'kainat-1121', name: 'Kainat', italic: '1121', variety: 'Basmati', grade: 'A', price: 520, badge: 'New Harvest', desc: 'Extra-long grain, doubles in length when cooked. Built for biryani.', stock: 1800, label: 'KAINAT · 5KG' },
  { id: 'sella-gold', name: 'Sella', italic: 'Gold', variety: 'Parboiled', grade: 'A', price: 380, badge: '', desc: 'Steam-parboiled, golden hue. Robust grain that holds shape.', stock: 3200, label: 'SELLA · 10KG' },
  { id: 'brown-heritage', name: 'Brown', italic: 'Heritage', variety: 'Whole Grain', grade: 'A', price: 420, badge: 'Organic', desc: 'Unpolished, nutrient-dense, nutty. Pairs with strong dals.', stock: 420, label: 'BROWN · 2KG' },
  { id: 'malakand-local', name: 'Malakand', italic: 'Local', variety: 'Local KPK', grade: 'B', price: 280, badge: '', desc: 'Heritage variety from foothill paddies. Soft and fragrant.', stock: 5400, label: 'LOCAL · 10KG' },
  { id: 'pearl-broken', name: 'Pearl', italic: 'Broken', variety: 'Broken Rice', grade: 'B', price: 220, badge: 'Best Value', desc: 'Sorted broken grain. For kheer, khichdi, and rice flour.', stock: 6800, label: 'BROKEN · 25KG' },
];

function ProductCard({ p, onOpen, onFav, isFav, onAdd, animDelay = 0 }) {
  return (
    <Reveal delay={animDelay}>
      <article
        className="product-card-pro"
        onClick={() => onOpen(p.id)}
      >
        <div className="pc-img">
          {p.badge && <span className="pc-badge">{p.badge}</span>}
          <button
            className={`pc-fav ${isFav ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onFav(p.id); }}
            aria-label="favourite"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0L12 7.9 8.7 4.6c-1.5-1.5-4-1.5-5.5 0s-1.5 4 0 5.5L12 19l8.8-8.9c1.5-1.5 1.5-4 0-5.5z"/>
            </svg>
          </button>
          <div className="pc-img-placeholder">
            <span>{p.label}</span>
          </div>
          <div className="pc-quick" onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
            <span>Add to basket</span>
            <span>→</span>
          </div>
        </div>
        <div className="pc-info">
          <div className="pc-meta">
            <span>{p.variety} · GRADE {p.grade}</span>
            <span className="pc-stock">{p.stock > 1000 ? 'IN STOCK' : p.stock > 0 ? 'LOW STOCK' : 'SOLD OUT'}</span>
          </div>
          <h3 className="pc-name">
            {p.name} <em className="italic">{p.italic}</em>
          </h3>
          <p className="pc-desc">{p.desc}</p>
          <div className="pc-foot">
            <div className="pc-price">
              ₨{p.price}<small>/kg</small>
            </div>
            <div className="pc-cta">View →</div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function HomePage({ setPage, setProductId, addToCart, favs, toggleFav, heroVariant = 'editorial' }) {
  const [filter, setFilter] = useStateH('all');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.variety.toLowerCase().includes(filter));
  const [openFaq, setOpenFaq] = useStateH(0);

  const onShop = () => document.getElementById('shop')?.scrollIntoView({behavior:'smooth'});
  const onAbout = () => setPage('about');
  const onSelect = (id) => { setProductId(id); setPage('product'); };

  let hero;
  if (heroVariant === 'magazine') hero = <HeroMagazine onShop={onShop} onAbout={onAbout} />;
  else if (heroVariant === 'catalogue') hero = <HeroCatalogue onShop={onShop} onAbout={onAbout} onSelect={onSelect} />;
  else if (heroVariant === 'center') hero = <HeroCenter onShop={onShop} onAbout={onAbout} />;
  else hero = <HeroEditorial onShop={onShop} onAbout={onAbout} />;

  return (
    <div className="page">
      {/* ============== HERO (variant) ============== */}
      {hero}

      {/* ============== TRUST / CERT BAR ============== */}
      <section className="cert-strip">
        <div className="cert-strip-inner">
          <span className="cert-label">CERTIFIED BY · 2026</span>
          {['PCSIR', 'ISO 22000', 'HALAL · IFANCA', 'HACCP', 'PSQCA', 'GLOBAL G.A.P'].map(c => (
            <span key={c} className="cert-item">{c}</span>
          ))}
        </div>
      </section>

      {/* ============== SHOP ============== */}
      <section className="section" id="shop">
        <div className="sec-head">
          <div className="sec-head-left">
            <Reveal><span className="eyebrow">II · THE CATALOGUE</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-title">
                Six varieties.<br/><em className="italic">One standard.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="sec-head-right">
              <p>Every grain is sun-dried in the open courtyard, husked on stone, and rest-aged before milling. Pricing in PKR per kilogram, valid for the 2026 harvest.</p>
            </div>
          </Reveal>
        </div>

        <div className="filter-row">
          <div className="filter-chips">
            {[
              {id:'all', label:'All varieties'},
              {id:'basmati', label:'Basmati'},
              {id:'parboiled', label:'Sella'},
              {id:'whole', label:'Brown'},
              {id:'local', label:'Local'},
              {id:'broken', label:'Broken'},
            ].map(f => (
              <span key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </span>
            ))}
          </div>
          <div className="filter-meta">
            <span>{filtered.length} VARIETIES</span>
            <span>SORT · HARVEST DATE ↓</span>
          </div>
        </div>

        <div className="product-grid-pro">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              p={p}
              animDelay={i * 50}
              onOpen={(id) => { setProductId(id); setPage('product'); }}
              onAdd={addToCart}
              onFav={toggleFav}
              isFav={favs.includes(p.id)}
            />
          ))}
        </div>
      </section>

      {/* ============== SPOTLIGHT ============== */}
      <section className="spotlight">
        <div className="spotlight-inner">
          <Reveal>
            <div className="spotlight-visual">
              <RiceBag3D name="Basmati" variety="SUPER KERNEL" weight={5} mouseFollow={false} />
            </div>
          </Reveal>
          <div className="spotlight-info">
            <Reveal><span className="eyebrow">III · THE EDITOR'S PICK</span></Reveal>
            <Reveal delay={100}>
              <h2 className="spotlight-title">
                Super Kernel<br/><em className="italic">Basmati.</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="spotlight-lead">
                Our signature. Long-grain basmati from the river-fed fields of the Swat Valley, sun-dried for three days and rested in jute sacks for twelve months before it ever sees a husker.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="spotlight-specs">
                {[
                  ['ORIGIN','Swat Valley · KPK'],
                  ['GRAIN','7.8 – 8.4 mm'],
                  ['MOISTURE','12.4%'],
                  ['BROKEN','< 4%'],
                  ['SHELF LIFE','12 months'],
                  ['MIN ORDER','1 kg'],
                ].map(([k, v]) => (
                  <div className="spotlight-spec" key={k}>
                    <span className="spotlight-spec-k">{k}</span>
                    <span className="spotlight-spec-v">{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="spotlight-price-row">
                <div>
                  <div className="spotlight-price">₨480<small>/ KILO</small></div>
                  <div className="spotlight-price-meta">FROM ₨420/KG AT 50KG+ · ₨380/KG AT 500KG+</div>
                </div>
                <div className="spotlight-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => { setProductId('super-kernel'); setPage('product'); }}>
                    View product
                  </button>
                  <button className="btn btn-lg" onClick={() => addToCart(PRODUCTS[0])}>
                    Quick add
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== WHOLESALE ============== */}
      <section className="section wholesale-section">
        <div className="wholesale-grid">
          <div className="wholesale-info">
            <Reveal><span className="eyebrow">IV · WHOLESALE & EXPORT</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-title">
                Built for<br/><em className="italic">restaurants, retailers,</em><br/>and exporters.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="wholesale-lead">
                Volume pricing starts at 50kg with three tier breaks. Container-scale orders ship FOB Karachi with full export documentation. Dedicated account manager assigned at the 500kg tier.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="wholesale-tiers">
                {[
                  {tier:'RETAIL', range:'1 – 49 kg', price:'Standard pricing', cta:'Shop catalogue'},
                  {tier:'TRADE', range:'50 – 499 kg', price:'−12% across the catalogue', cta:'Request quote'},
                  {tier:'WHOLESALE', range:'500 – 4,999 kg', price:'−18% · dedicated account manager', cta:'Request quote'},
                  {tier:'CONTAINER', range:'5,000 kg +', price:'Bespoke pricing · FOB Karachi · export docs', cta:'Speak to founders'},
                ].map((t, i) => (
                  <div className="wt-row" key={t.tier}>
                    <div className="wt-tier">{t.tier}</div>
                    <div className="wt-range">{t.range}</div>
                    <div className="wt-price">{t.price}</div>
                    <div className="wt-cta">{t.cta} →</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="wholesale-visual">
              <div className="wv-img wv-img-1">
                <div className="story-img-placeholder">
                  <span style={{background:'var(--bg)', color:'var(--mute)'}}>WAREHOUSE · 25KG SACKS · STACKED</span>
                </div>
              </div>
              <div className="wv-img wv-img-2">
                <div className="story-img-placeholder">
                  <span style={{background:'var(--bg)', color:'var(--mute)'}}>LOADING · TCS FREIGHT · KARACHI</span>
                </div>
              </div>
              <div className="wv-quote">
                <div className="wv-quote-text">
                  "We've shipped twelve containers to UAE this year without a single rejection on grain length."
                </div>
                <div className="wv-quote-sig">
                  <strong>Bilal Khan</strong>
                  <span>Export Director, Al-Noor</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== PROCESS ============== */}
      <section className="section process-section">
        <div className="sec-head">
          <div>
            <Reveal><span className="eyebrow">V · THE PROCESS</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-title">
                Four steps.<br/><em className="italic">Twelve months.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className="sec-head-right">Slow milling is not a marketing position. It is the only way to produce rice that holds its grain, separates cleanly, and smells like the kitchen you remember.</p>
          </Reveal>
        </div>
        <div className="process-pro">
          {[
            {n:'01', name:'Procurement', desc:'Paddy sourced direct from 60+ farmer families across the Swat Valley. Weighed, graded, and paid for the same day.'},
            {n:'02', name:'Sun-drying', desc:'Three days on woven mats in the courtyard. Moisture brought down to 12.4%, verified every two hours.'},
            {n:'03', name:'Resting', desc:'Twelve months in stacked jute sacks, rotated quarterly. Grain lengthens, starch settles, aroma deepens.'},
            {n:'04', name:'Milling', desc:'Stone-husked, polished, sorted by length and broken-grain ratio. Bagged within six hours of milling.'},
          ].map(s => (
            <Reveal key={s.n}>
              <div className="process-pro-step">
                <div className="pps-num">{s.n}</div>
                <div className="pps-name">{s.name}</div>
                <div className="pps-desc">{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="section testimonials">
        <Reveal><span className="eyebrow" style={{textAlign:'center', display:'block', textAlignLast:'center'}}>VI · WHAT BUYERS SAY</span></Reveal>
        <Reveal delay={100}>
          <h2 className="section-title" style={{textAlign:'center', maxWidth:900, margin:'14px auto 0'}}>
            Trusted from<br/><em className="italic">Karachi to Calgary.</em>
          </h2>
        </Reveal>
        <div className="testimonial-grid">
          {[
            {t:'Best basmati I have bought in years. Aroma fills the kitchen the moment the lid lifts. We have switched our entire household to Al-Noor.', n:'Tariq Mehmood', r:'RETAIL · LAHORE', stars:5},
            {t:'Twelve container loads to Sharjah this year, zero rejections on grain length. Their lab paperwork has saved us more time than I can measure.', n:'Aisha Rahman', r:'EXPORT · DUBAI', stars:5},
            {t:'My biryani has never looked this good. Grains stay separate every time, even with the long-simmer mutton. Switched all three of my restaurants over in March.', n:'Chef Imran Shah', r:'TRADE · ISLAMABAD', stars:5},
            {t:'Reliable, well-priced, and the WhatsApp ordering is genuinely useful for a wholesale buyer. We get the same grade every quarter without renegotiating.', n:'Saima Akhtar', r:'WHOLESALE · KARACHI', stars:5},
          ].map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <article className="testimonial-card">
                <span className="stars">{'★'.repeat(t.stars)}</span>
                <p className="testimonial-text">"{t.t}"</p>
                <div className="testimonial-sig">
                  <strong>{t.n}</strong>
                  <span>{t.r}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== STORY TEASER ============== */}
      <section className="story-section">
        <div className="section">
          <div className="story-grid">
            <Reveal>
              <div className="story-img">
                <div className="story-img-placeholder">
                  <span>MILL · COURTYARD · DAWN</span>
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal><span className="eyebrow" style={{color:'rgba(255,255,255,0.7)'}}>VII · HERITAGE · SINCE MMX</span></Reveal>
              <Reveal delay={100}>
                <h2 className="story-title">
                  A family mill on the<br/><em className="italic">GT Road.</em>
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="story-body">
                  In 2010, Haji Noor Khan parked a single husking machine on a strip of land beside the old Batkhela bus stand. Today, three generations of the family run twelve lines through the night, milling rice for households from Mingora to Karachi.
                </p>
                <p className="story-body">
                  We have grown — but only ever in one direction. Better rice, better priced, milled the way our grandfather taught us.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <button className="btn btn-lg" style={{marginTop:36}} onClick={() => setPage('about')}>
                  Read the full story →
                </button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="section faq-section">
        <div className="sec-head">
          <div>
            <Reveal><span className="eyebrow">VIII · QUESTIONS</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-title">
                Frequently<br/><em className="italic">asked.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className="sec-head-right">Can't find your answer? Message us on WhatsApp at +92 300 123 4567 — usually the fastest line.</p>
          </Reveal>
        </div>

        <div className="faq-list">
          {[
            {q:'How quickly do you ship?', a:'Same-day dispatch within Malakand and KPK for orders placed before 2 PM. Nationwide delivery via TCS takes 24–48 hours. International shipping is quoted on request — typically 7–14 days FOB Karachi.'},
            {q:'What is the difference between aged and unaged basmati?', a:'Aged basmati rests in jute sacks for 6–24 months before milling. The wait does three things: grains lengthen further, starch settles so cooked rice separates cleanly, and the natural aroma deepens. All Al-Noor basmati is aged a minimum of twelve months.'},
            {q:'Do you offer wholesale pricing?', a:'Yes — three tiers. Trade pricing (−12%) kicks in at 50kg per order. Wholesale (−18%) at 500kg with a dedicated account manager. Container-scale pricing is bespoke, FOB Karachi, with full export documentation included.'},
            {q:'How do I know the rice is fresh?', a:'Every bag is stamped with mill date and batch number. The aroma of fresh basmati is unmistakable when the bag is opened. If anything seems off, message us within 30 days and we will replace the bag at no charge.'},
            {q:'Do you ship internationally?', a:'We ship FOB Karachi to UAE, Saudi Arabia, the UK, Canada, and Australia regularly. Container minimums start at 5,000 kg. Request a quote with your destination port and we will return a CIF estimate within 24 hours.'},
            {q:'Is the rice halal and certified?', a:'Yes. PCSIR-tested, ISO 22000 certified, HALAL certified by IFANCA. HACCP audit completed annually. Certificates are available on request and included automatically with export orders.'},
          ].map((f, i) => (
            <Reveal key={i}>
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <div className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </div>
                <div className="faq-a">{f.a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== NEWSLETTER ============== */}
      <section className="section newsletter-section">
        <Reveal>
          <div className="newsletter-card">
            <div>
              <span className="eyebrow">SUBSCRIBE · ONE EMAIL PER MONTH</span>
              <h2 className="newsletter-title">
                Field notes,<br/><em className="italic">first Saturday</em><br/>of the month.
              </h2>
            </div>
            <div>
              <p className="newsletter-copy">
                Harvest reports, recipes, occasional discounts on bulk orders. No spam, no daily sends — one email, first Saturday, ever since 2019.
              </p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input className="newsletter-input" placeholder="your@email.pk" />
                <button className="btn btn-primary btn-lg">Subscribe →</button>
              </form>
              <p className="newsletter-fine">UNSUBSCRIBE WITH ONE CLICK · 2,840 READERS</p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

window.HomePage = HomePage;
