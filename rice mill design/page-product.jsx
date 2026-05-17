/* global React, RiceBag3D, Reveal */
// Product Detail Page

const { useState: useStatePD } = React;

function ProductPage({ setPage, addToCart }) {
  const [tab, setTab] = useStatePD('description');
  const [qty, setQty] = useStatePD(5);
  const [variant, setVariant] = useStatePD(5); // weight kg

  const variants = [1, 5, 10, 25];

  return (
    <div className="page pdp">
      <div className="pdp-visual">
        <div className="pdp-thumbs">
          {['FRONT','SIDE','OPEN','GRAIN'].map((t, i) => (
            <div key={t} className={`pdp-thumb ${i === 0 ? 'active' : ''}`}>{t}</div>
          ))}
        </div>
        <div className="pdp-bag-wrap">
          <RiceBag3D name="Basmati" variety={`SUPER KERNEL · ${variant}KG`} weight={variant} />
        </div>
      </div>

      <div className="pdp-info">
        <Reveal>
          <div className="pdp-crumbs">SHOP / BASMATI / SUPER KERNEL · SKU RM-BSM-A-4821</div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="pdp-title">
            Super Kernel<br/>
            <span className="italic">Basmati</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <div className="pdp-rating">
            <span className="stars">★★★★★</span>
            <span><strong>4.9</strong> · 218 reviews · 92% verified</span>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <p style={{fontSize:17, lineHeight:1.6, color:'var(--ink-2)', marginBottom:32}}>
            Our signature long-grain basmati, aged twelve months in jute and stone. Cooks fluffy, separates cleanly, holds aroma. Milled in batches of 200 kg from the 2026 winter harvest.
          </p>
        </Reveal>

        <Reveal delay={280}>
          <div className="pdp-price-row">
            <div>
              <div className="pdp-price">₨{(480 * variant).toLocaleString()}<small>BAG</small></div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--mute)', letterSpacing:'0.1em', marginTop:4}}>
                ₨480 PER KG · INCL. PKG · EXCL. SHIPPING
              </div>
            </div>
            <div style={{marginLeft:'auto'}} className="pdp-stock">IN STOCK · 2,400 KG</div>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mute)', marginBottom:14}}>SACK SIZE</div>
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              {variants.map(v => (
                <span
                  key={v}
                  className={`chip ${variant === v ? 'active' : ''}`}
                  onClick={() => setVariant(v)}
                  style={{padding:'12px 22px', fontSize:13}}
                >{v} KG</span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={380}>
          <div style={{display:'flex', alignItems:'center', gap:20, flexWrap:'wrap'}}>
            <div className="qty">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-val">{qty}<span className="qty-unit">BAGS</span></span>
              <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--mute)', letterSpacing:'0.1em'}}>
              TOTAL: ₨{(480 * variant * qty).toLocaleString()}
            </div>
          </div>
        </Reveal>

        <Reveal delay={420}>
          <div className="pdp-actions">
            <button
              className="btn btn-primary btn-lg"
              style={{flex:1}}
              onClick={() => addToCart({ id:'super-kernel', name:'Super Kernel', variety:'Basmati', price:480 * variant, label:`BASMATI · ${variant}KG` }, qty)}
            >Add {qty} bag{qty>1?'s':''} to cart</button>
            <button className="btn btn-lg btn-saffron">
              WhatsApp order →
            </button>
          </div>
        </Reveal>

        <Reveal delay={460}>
          <div style={{display:'flex', gap:14, marginBottom:8, marginTop:8, flexWrap:'wrap'}}>
            {[
              {l:'COD AVAILABLE'},
              {l:'48H DELIVERY'},
              {l:'1Y FRESHNESS'},
            ].map(t => (
              <div key={t.l} style={{padding:'10px 14px', border:'1px solid var(--hairline)', borderRadius:8, fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
                {t.l}
              </div>
            ))}
          </div>
        </Reveal>

        {/* TABS */}
        <div className="pdp-tabs">
          <div className="tab-list">
            {[
              {id:'description', l:'Description'},
              {id:'specs', l:'Specifications'},
              {id:'nutrition', l:'Nutrition'},
              {id:'reviews', l:'Reviews (218)'},
            ].map(t => (
              <span key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.l}
              </span>
            ))}
          </div>
          <div className="tab-panel">
            {tab === 'description' && (
              <div>
                <p>
                  Super Kernel is the long-grain basmati that built Al-Noor's reputation. We source paddy from the river-fed fields along the Swat Valley, sun-dry it on woven mats for three days, and rest the grain in jute sacks for twelve months before milling. The wait does the work — grains lengthen further, starch settles, aroma deepens.
                </p>
                <p style={{marginTop:14}}>
                  When you cook it, expect grains that double in length, separate without sticking, and carry the distinct buttery, jasmine-adjacent perfume of well-aged basmati. Equally at home under a biryani as it is plain-boiled with ghee.
                </p>
                <p style={{marginTop:14, fontFamily:'var(--font-mono)', fontSize:12, letterSpacing:'0.08em', color:'var(--mute)'}}>
                  STORAGE — Keep in an airtight container, away from direct sunlight. Best within twelve months of milling. Each bag stamped with mill date and batch number.
                </p>
              </div>
            )}
            {tab === 'specs' && (
              <div className="specs">
                {[
                  ['Variety','Basmati 386'],
                  ['Grade','A · Premium'],
                  ['Origin','Swat Valley · KPK'],
                  ['Processing','Stone-husked · Polished'],
                  ['Grain length','7.8 – 8.4 mm'],
                  ['Moisture','12.4%'],
                  ['Cooking time','11–13 min'],
                  ['Aroma','High · Natural'],
                  ['Broken grain','< 4%'],
                  ['Packaging','Woven PP · Jute liner'],
                  ['Shelf life','12 months'],
                  ['Certifications','PCSIR · Halal · ISO 22000'],
                ].map(([k, v]) => (
                  <div className="spec-row" key={k}><span>{k}</span><span>{v}</span></div>
                ))}
              </div>
            )}
            {tab === 'nutrition' && (
              <div className="specs">
                {[
                  ['Energy','349 kcal'],
                  ['Carbohydrates','77.2 g'],
                  ['Protein','7.4 g'],
                  ['Fat','0.6 g'],
                  ['Fibre','1.3 g'],
                  ['Sodium','5 mg'],
                  ['Iron','0.8 mg'],
                  ['Glycaemic index','58 (medium)'],
                ].map(([k, v]) => (
                  <div className="spec-row" key={k}><span>{k}</span><span>{v}</span></div>
                ))}
                <div style={{gridColumn:'1 / -1', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--mute)', marginTop:14, letterSpacing:'0.06em'}}>
                  PER 100 G UNCOOKED · INDICATIVE VALUES PER LAB ANALYSIS NOV 2025
                </div>
              </div>
            )}
            {tab === 'reviews' && (
              <div>
                <div className="review-summary">
                  <div>
                    <div className="review-big">4.9</div>
                    <div className="stars" style={{fontSize:18}}>★★★★★</div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--mute)', marginTop:8}}>218 REVIEWS</div>
                  </div>
                  <div className="review-bars">
                    {[[5,196],[4,16],[3,4],[2,1],[1,1]].map(([s, n]) => (
                      <div className="review-bar" key={s}>
                        <span>{s}★</span>
                        <div className="review-bar-track">
                          <div className="review-bar-fill" style={{width: (n/218*100) + '%'}}></div>
                        </div>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{marginTop:32, display:'flex', flexDirection:'column', gap:24}}>
                  {[
                    {name:'Tariq M.', date:'14 days ago', stars:5, verified:true, text:'Best basmati I have bought in years. Aroma fills the kitchen the moment the lid lifts. Ordered 25kg, will be ordering 50 next.'},
                    {name:'Saima A.', date:'1 month ago', stars:5, verified:true, text:'Grains stay separate every time. My biryani has never looked this good. Delivery to Lahore took 36 hours, well packed.'},
                    {name:'Rehan K.', date:'2 months ago', stars:4, verified:true, text:'Excellent rice. Took half a star off because the jute bag tore on one corner — they replaced it the same day after a WhatsApp message though.'},
                  ].map((r, i) => (
                    <div key={i} style={{paddingBottom:24, borderBottom: '1px dashed var(--hairline)'}}>
                      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
                        <strong style={{fontFamily:'var(--font-display)', fontSize:18}}>{r.name}</strong>
                        <span className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                        {r.verified && <span style={{fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 8px', borderRadius:999, background:'color-mix(in oklab, var(--paddy) 15%, transparent)', color:'var(--paddy)', letterSpacing:'0.12em'}}>VERIFIED PURCHASE</span>}
                        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--mute)', marginLeft:'auto', letterSpacing:'0.08em'}}>{r.date.toUpperCase()}</span>
                      </div>
                      <p style={{fontSize:15, lineHeight:1.6}}>{r.text}</p>
                      <div style={{display:'flex', gap:12, marginTop:10}}>
                        <button className="btn btn-sm">↑ Helpful</button>
                        <button className="btn btn-sm btn-ghost" style={{color:'var(--mute)'}}>Report</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ProductPage = ProductPage;
