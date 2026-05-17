/* global React, RiceBag3D, FallingGrains, Counter, Reveal */
// Hero variants — switch live via Tweaks

const { useState: useStateHero, useRef: useRefHero, useEffect: useEffectHero } = React;

const HERO_VARIETIES = [
  { id: 'super-kernel', name: 'Super Kernel', italic: 'Basmati', tag: 'SIGNATURE', price: 480, label: 'BASMATI', age: 'AGED 12 MONTHS', origin: 'SWAT VALLEY', length: '7.8–8.4 mm', moisture: '12.4%' },
  { id: 'kainat-1121', name: 'Kainat', italic: '1121', tag: 'NEW HARVEST', price: 520, label: 'KAINAT', age: 'AGED 9 MONTHS', origin: 'PESHAWAR', length: '8.4–8.9 mm', moisture: '12.0%' },
  { id: 'sella-gold', name: 'Sella', italic: 'Gold', tag: 'BIRYANI GRADE', price: 380, label: 'SELLA', age: 'PARBOILED', origin: 'NOWSHERA', length: '7.0–7.4 mm', moisture: '11.8%' },
  { id: 'brown-heritage', name: 'Brown', italic: 'Heritage', tag: 'ORGANIC', price: 420, label: 'BROWN', age: 'UNPOLISHED', origin: 'CHITRAL', length: '6.6–6.8 mm', moisture: '12.2%' },
];

// ============== HERO A — Editorial Center (Apple-style product) ==============
function HeroCenter({ onShop, onAbout }) {
  const [active, setActive] = useStateHero(0);
  const v = HERO_VARIETIES[active];

  useEffectHero(() => {
    const id = setInterval(() => {
      setActive(a => (a + 1) % HERO_VARIETIES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero-center">
      <FallingGrains count={14} />

      <div className="hero-center-top">
        <span className="eyebrow">EST · MMX · BATKHELA, MALAKAND</span>
        <div className="hero-center-pills">
          {HERO_VARIETIES.map((p, i) => (
            <button
              key={p.id}
              className={`hcp ${active === i ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="hcp-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="hcp-name">{p.name} {p.italic}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hero-center-stage">
        {/* Floating annotations */}
        <div className="anno anno-tl">
          <div className="anno-line"></div>
          <div className="anno-text">
            <span className="anno-label">VARIETY</span>
            <span className="anno-value">{v.tag}</span>
          </div>
        </div>
        <div className="anno anno-tr">
          <div className="anno-line"></div>
          <div className="anno-text">
            <span className="anno-label">ORIGIN</span>
            <span className="anno-value">{v.origin}</span>
          </div>
        </div>
        <div className="anno anno-bl">
          <div className="anno-line"></div>
          <div className="anno-text">
            <span className="anno-label">GRAIN LENGTH</span>
            <span className="anno-value">{v.length}</span>
          </div>
        </div>
        <div className="anno anno-br">
          <div className="anno-line"></div>
          <div className="anno-text">
            <span className="anno-label">MOISTURE</span>
            <span className="anno-value">{v.moisture}</span>
          </div>
        </div>

        <div className="hero-center-bag" key={v.id}>
          <RiceBag3D name={v.name} variety={`${v.label} · 5KG`} weight={5} mouseFollow={true} />
        </div>

        <h1 className="hero-center-title">
          <span className="hct-1">{v.name}</span>
          <span className="hct-2"><em className="italic">{v.italic}</em></span>
        </h1>
      </div>

      <div className="hero-center-foot">
        <div className="hcf-left">
          <span className="eyebrow">PRICED PER KILO</span>
          <div className="hcf-price">
            <span className="hcf-price-num">₨{v.price}</span>
            <span className="hcf-price-sub">FROM ₨{Math.round(v.price * 0.78)}/KG AT 500KG+</span>
          </div>
        </div>
        <div className="hcf-mid">
          <p>
            Premium rice, milled with the patience of foothills. Sun-dried in the open courtyard, aged twelve months in jute, milled to order.
          </p>
        </div>
        <div className="hcf-right">
          <button className="btn btn-primary btn-lg" onClick={onShop}>
            Shop the harvest
          </button>
          <button className="btn btn-lg" onClick={onAbout}>
            Our story
          </button>
        </div>
      </div>
    </section>
  );
}

// ============== HERO B — Magazine Cover (Bold full bleed) ==============
function HeroMagazine({ onShop, onAbout }) {
  return (
    <section className="hero-mag">
      <FallingGrains count={20} />

      <div className="hero-mag-left">
        <div className="hero-mag-issue">
          <span>VOL · XV</span>
          <span>2026</span>
          <span>HARVEST · 04</span>
        </div>
        <h1 className="hero-mag-title">
          Rice,<br/>
          milled with<br/>
          the <em className="italic">patience</em><br/>
          of foothills.
        </h1>
        <div className="hero-mag-foot">
          <p>
            Premium basmati and heritage grains from the Swat Valley, milled in Batkhela since 2010. Sold by the kilo, the sack, the container.
          </p>
          <div className="hero-mag-actions">
            <button className="btn btn-primary btn-lg" onClick={onShop}>Shop the harvest</button>
            <button className="btn btn-lg" onClick={onAbout}>Our story</button>
          </div>
        </div>
        <div className="hero-mag-meta">
          <div><span className="hmm-k">EST</span><span className="hmm-v">2010</span></div>
          <div><span className="hmm-k">VARIETIES</span><span className="hmm-v">15</span></div>
          <div><span className="hmm-k">CAPACITY</span><span className="hmm-v">3,200t</span></div>
          <div><span className="hmm-k">PARTNERS</span><span className="hmm-v">420+</span></div>
        </div>
      </div>

      <div className="hero-mag-right">
        <div className="hero-mag-stamp">
          <span>RICE · MILL</span>
          <span className="hms-mid">AL · NOOR</span>
          <span>EST · MMX</span>
        </div>
        <div className="hero-mag-bag">
          <RiceBag3D name="Basmati" variety="SUPER KERNEL" weight={5} mouseFollow={true} />
        </div>
        <div className="hero-mag-cap">
          <span className="hmc-num">01</span>
          <div>
            <strong>Super Kernel Basmati</strong>
            <span>5 kg · ₨480/kg · Aged 12 months</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============== HERO C — Catalogue Grid (products as hero) ==============
function HeroCatalogue({ onShop, onAbout, onSelect }) {
  return (
    <section className="hero-cat">
      <FallingGrains count={10} />

      <div className="hero-cat-head">
        <Reveal>
          <span className="eyebrow">EST · MMX · BATKHELA · MALAKAND, KPK</span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="hero-cat-title">
            Rice, milled with the<br/><em className="italic">patience</em> of foothills.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <div className="hero-cat-sub">
            <p>Premium basmati and heritage grains, milled in Batkhela since 2010 — sold by the kilo, the sack, the container.</p>
            <div className="hero-cat-actions">
              <button className="btn btn-primary btn-lg" onClick={onShop}>Shop the harvest</button>
              <button className="btn btn-lg" onClick={onAbout}>Our story</button>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="hero-cat-grid">
        {HERO_VARIETIES.map((p, i) => (
          <Reveal key={p.id} delay={300 + i * 80}>
            <article className="hero-cat-card" onClick={() => onSelect && onSelect(p.id)}>
              <div className="hcc-img">
                <span className="hcc-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="hcc-bag">
                  <RiceBag3D name={p.name} variety={`${p.label} · 5KG`} weight={5} mouseFollow={false} />
                </div>
                <span className="hcc-tag">{p.tag}</span>
              </div>
              <div className="hcc-info">
                <div className="hcc-name">{p.name} <em className="italic">{p.italic}</em></div>
                <div className="hcc-meta">
                  <span>{p.origin}</span>
                  <span className="hcc-price">₨{p.price}/kg</span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ============== HERO D — Editorial Split (v3 — restored) ==============
function HeroEditorial({ onShop, onAbout }) {
  return (
    <section className="hero hero-pro">
      <div className="hero-bg"></div>
      <FallingGrains count={18} />

      <div className="hero-pro-content">
        <Reveal>
          <span className="eyebrow">ESTABLISHED MMX · BATKHELA, MALAKAND</span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="hero-pro-title">
            Rice, milled with the<br/>
            <span className="italic">patience</span> of foothills.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="hero-pro-sub">
            Premium basmati and heritage grains from the Swat Valley — sun-dried in the open courtyard, aged twelve months in jute, milled to order. Sold by the kilo, by the sack, and by the container.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="hero-pro-cta">
            <button className="btn btn-primary btn-lg" onClick={onShop}>
              Shop the harvest
            </button>
            <button className="btn btn-lg" onClick={onAbout}>
              Our story
            </button>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div className="hero-pro-meta">
            <div>
              <div className="hpm-num"><Counter to={15} />+</div>
              <div className="hpm-label">Years milling</div>
            </div>
            <div>
              <div className="hpm-num"><Counter to={3200} suffix="t" /></div>
              <div className="hpm-label">Annual capacity</div>
            </div>
            <div>
              <div className="hpm-num"><Counter to={420} suffix="+" /></div>
              <div className="hpm-label">Wholesale partners</div>
            </div>
            <div>
              <div className="hpm-num"><Counter to={99} suffix=".4%" /></div>
              <div className="hpm-label">Lab grade A</div>
            </div>
          </div>
        </Reveal>
      </div>

      <RiceBag3D name="Basmati" variety="SUPER KERNEL" weight={5} mouseFollow={true} />
    </section>
  );
}

Object.assign(window, { HeroCenter, HeroMagazine, HeroCatalogue, HeroEditorial });
