/* global React, Reveal, FallingGrains, Counter, RiceBag3D */
// Login, About, Blog, Contact pages

const { useState: useStateO, useEffect: useEffectO, useRef: useRefO } = React;

// =================== LOGIN / REGISTER ===================
function AuthPage({ setPage }) {
  const [mode, setMode] = useStateO('login');
  return (
    <div className="page auth">
      <div className="auth-art">
        <FallingGrains count={18} />
        <div className="auth-art-content">
          <span className="eyebrow" style={{color:'rgba(255,255,255,0.7)'}}>
            <span style={{background:'rgba(255,255,255,0.7)'}}></span> AL-NOOR · MEMBERS
          </span>
          <h2 className="auth-art-quote">
            "Rice does not <em style={{fontStyle:'italic', color:'var(--saffron)'}}>hurry.</em> Neither do we."
          </h2>
          <div className="auth-art-sig">— HAJI NOOR KHAN · FOUNDER · 2010</div>

          <div style={{marginTop:60, display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:400}}>
            {[
              {n:'01', t:'Track every order from mill to door'},
              {n:'02', t:'Save favourites for one-tap reordering'},
              {n:'03', t:'Wholesale pricing tiers unlocked at sign-up'},
              {n:'04', t:'Early access to new harvests'},
            ].map(b => (
              <div key={b.n}>
                <div style={{fontFamily:'var(--font-display)', fontSize:32, fontStyle:'italic', color:'var(--saffron)', lineHeight:1}}>{b.n}</div>
                <p style={{fontSize:13, lineHeight:1.5, marginTop:8, opacity:0.85}}>{b.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-tabs">
            <span className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign in</span>
            <span className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Create account</span>
          </div>

          {mode === 'login' && (
            <div className="page" key="login">
              <h2 className="auth-title">Welcome <em style={{fontStyle:'italic', color:'var(--paddy)'}}>back.</em></h2>
              <p className="auth-sub">Sign in to track orders, manage favourites, and unlock wholesale rates.</p>
              <div className="field">
                <span className="field-label">Email address</span>
                <input className="field-input" placeholder="you@household.pk" defaultValue="buyer@example.pk" />
              </div>
              <div className="field">
                <span className="field-label">Password</span>
                <input className="field-input" type="password" placeholder="••••••••" defaultValue="password123" />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, marginBottom:28, fontSize:13}}>
                <label style={{display:'flex', gap:8, alignItems:'center', cursor:'pointer'}}>
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <a style={{color:'var(--paddy)', cursor:'pointer'}}>Forgot password?</a>
              </div>
              <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}} onClick={() => setPage('home')}>
                Sign in →
              </button>
              <div className="auth-foot">
                New to Al-Noor? <a onClick={() => setMode('register')}>Create an account</a>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="page" key="reg">
              <h2 className="auth-title">Join the <em style={{fontStyle:'italic', color:'var(--paddy)'}}>mill.</em></h2>
              <p className="auth-sub">A free account unlocks order history, faster checkout, and tiered wholesale pricing.</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
                <div className="field">
                  <span className="field-label">Full name</span>
                  <input className="field-input" placeholder="Tariq Mehmood" />
                </div>
                <div className="field">
                  <span className="field-label">Phone (WhatsApp)</span>
                  <input className="field-input" placeholder="+92 300 1234567" />
                </div>
              </div>
              <div className="field">
                <span className="field-label">Email</span>
                <input className="field-input" placeholder="you@household.pk" />
              </div>
              <div className="field">
                <span className="field-label">City</span>
                <input className="field-input" placeholder="Peshawar" />
              </div>
              <div className="field">
                <span className="field-label">Password</span>
                <input className="field-input" type="password" placeholder="Choose a strong password" />
              </div>
              <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center', marginTop:12}} onClick={() => setPage('home')}>
                Create account →
              </button>
              <div className="auth-foot">
                Already a member? <a onClick={() => setMode('login')}>Sign in</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== ABOUT (parallax storytelling) ===================
function AboutPage() {
  const heroRef = useRefO(null);
  const [scroll, setScroll] = useStateO(0);

  useEffectO(() => {
    const h = () => setScroll(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section className="about-hero" ref={heroRef}>
        <FallingGrains count={28} />
        <div style={{position:'relative', zIndex:2, maxWidth:1100}}>
          <Reveal>
            <span className="eyebrow">CHAPTER ZERO · MMX</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="about-hero-title">
              From one machine<br/>
              to <span className="italic">twelve lines.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="about-hero-sub">
              The Al-Noor story, told the way our grandfather told it — slowly, with detours, and almost always over a plate of pulao.
            </p>
          </Reveal>
        </div>
        <div
          style={{
            position:'absolute', right:'-100px', top:'40%',
            transform: `translateY(${scroll * 0.3}px) rotate(-12deg)`,
            opacity: 0.25,
            fontFamily:'var(--font-display)', fontStyle:'italic',
            fontSize: 220, color:'var(--paddy)', pointerEvents:'none',
            zIndex: 1,
          }}
        >2010</div>
      </section>

      {/* Chapters */}
      {[
        {
          n: 'CHAPTER ONE',
          t: 'A single husking machine.',
          p: [
            'In the winter of 2010, Haji Noor Khan put a deposit on a single Japanese husking machine and rented a strip of concrete beside the Batkhela bus stand. He had no signboard, no business cards, no idea how to read a bank statement.',
            'What he had was a reputation. Every farmer in the valley knew that if Noor said a sack of paddy weighed 80 kilos, it weighed exactly 80 kilos. That reputation moved faster than any signboard would have.',
          ],
          img: 'COURTYARD · 2010 · MONOCHROME',
          dark: false,
        },
        {
          n: 'CHAPTER TWO',
          t: 'The wait does the work.',
          p: [
            'The most important thing we do at the mill is nothing at all. Every winter\'s paddy is sun-dried for three days, then rested in stacked jute sacks for twelve months before milling.',
            'Aging is invisible work. It costs money, takes space, and produces nothing you can photograph. But the grain that comes out of a year-old sack cooks longer, separates cleaner, and smells like the kitchen you remember from your grandmother\'s house.',
          ],
          img: 'JUTE STACKS · WAREHOUSE',
          dark: true,
        },
        {
          n: 'CHAPTER THREE',
          t: 'Twelve lines, three generations.',
          p: [
            'In 2023, my father handed me the day shift. I run the floor; he handles the suppliers; my sister sits in the office and answers the WhatsApp.',
            'We have grown — but always in one direction. Twelve lines milling through the night, four hundred wholesale partners, fifteen named varieties. Same family. Same patience. Same rice.',
          ],
          img: 'MILL FLOOR · NIGHT SHIFT',
          dark: false,
        },
      ].map((ch, i) => (
        <section key={i} className="chapter">
          <Reveal>
            <div>
              <span className="chapter-num">{ch.n}</span>
              <h3>{ch.t.split('.').slice(0,-1).join('.')}<span style={{fontStyle:'italic', color:'var(--paddy)'}}>.</span></h3>
              {ch.p.map((p, j) => <p key={j}>{p}</p>)}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className={`chapter-img ${ch.dark ? 'dark' : ''}`}>
              <div className="story-img-placeholder" style={ch.dark ? {} : {borderColor:'var(--hairline)'}}>
                <span style={ch.dark ? {} : {background:'var(--bg)', color:'var(--mute)'}}>{ch.img}</span>
              </div>
            </div>
          </Reveal>
        </section>
      ))}

      {/* Process */}
      <section className="section">
        <Reveal>
          <span className="eyebrow">THE PROCESS · PADDY TO PLATE</span>
          <h2 className="section-title" style={{marginTop:16, marginBottom:0}}>
            Four steps. <em style={{fontStyle:'italic', color:'var(--paddy)'}}>Twelve months.</em>
          </h2>
        </Reveal>
        <div className="process">
          {[
            {n:'01', name:'Procurement', desc:'Paddy is sourced direct from 60+ farmer families across the Swat Valley. Weighed, graded, and paid for the same day.'},
            {n:'02', name:'Sun-drying', desc:'Three days on woven mats in the open courtyard. Moisture brought down to 12.4% — verified by handheld meter every two hours.'},
            {n:'03', name:'Resting', desc:'Twelve months in stacked jute sacks, rotated quarterly. Grain lengthens, starch settles, aroma deepens.'},
            {n:'04', name:'Milling', desc:'Stone-husked, polished, sorted by length and broken-grain ratio. Bagged within 6 hours of milling — date stamped on every sack.'},
          ].map(s => (
            <Reveal key={s.n}>
              <div className="process-step">
                <div className="process-num">{s.n}</div>
                <div className="process-name">{s.name}</div>
                <div className="process-desc">{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-band">
        <div className="stats-grid">
          {[
            {n:60, s:'+', l:'Farmer families supplying'},
            {n:12, s:'', l:'Active milling lines'},
            {n:3200, s:'t', l:'Annual capacity (tonnes)'},
            {n:0, s:'', l:'Years missed for Eid harvest'},
          ].map(s => (
            <Reveal key={s.l}>
              <div className="stat">
                <div className="stat-num"><Counter to={s.n} suffix={s.s} /></div>
                <div className="stat-label">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

// =================== BLOG ===================
function BlogPage() {
  const posts = [
    { tag:'PROCESS', title:'Why we age our basmati for twelve months', meta:'12 NOV 2025 · 8 MIN READ', feature: true, img:'JUTE STACKS · WAREHOUSE'},
    { tag:'RECIPE', title:'The biryani test: how to know if your rice is fresh', meta:'04 NOV 2025 · 5 MIN' },
    { tag:'FARM NOTE', title:'Winter harvest 2026: what to expect', meta:'28 OCT 2025 · 4 MIN' },
    { tag:'BUSINESS', title:'Going wholesale: a buyer\'s guide to tiered pricing', meta:'21 OCT 2025 · 6 MIN' },
    { tag:'KITCHEN', title:'Storing rice in humid weather without losing aroma', meta:'14 OCT 2025 · 3 MIN' },
    { tag:'HERITAGE', title:'A short history of Malakand rice', meta:'02 OCT 2025 · 9 MIN' },
    { tag:'PROCESS', title:'The moisture meter: our most boring, most important tool', meta:'25 SEP 2025 · 4 MIN' },
  ];

  return (
    <div className="page">
      <section className="section-tight" style={{paddingTop:160}}>
        <Reveal><span className="eyebrow">THE AL-NOOR JOURNAL · ISSUE 14</span></Reveal>
        <Reveal delay={100}>
          <h1 className="section-title" style={{marginTop:16}}>
            Field notes from the<br/><em style={{fontStyle:'italic', color:'var(--paddy)'}}>mill floor.</em>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p style={{maxWidth:540, color:'var(--ink-2)', fontSize:17, lineHeight:1.6, marginTop:24}}>
            Slow writing about rice, agriculture, supply chains, and the people who tie a sack of grain into a knot in under four seconds.
          </p>
        </Reveal>

        <div className="blog-grid">
          {posts.map((p, i) => (
            <Reveal key={i} delay={i * 60}>
              <article className={`blog-card ${p.feature ? 'feature' : ''}`}>
                <div className="blog-img">
                  <div className="story-img-placeholder" style={{borderColor:'var(--hairline)'}}>
                    <span style={{background:'var(--bg)', color:'var(--mute)'}}>{p.img || p.tag + ' · PHOTO'}</span>
                  </div>
                </div>
                <div className="blog-card-info">
                  <div className="blog-tag">{p.tag}</div>
                  <h3 className="blog-title">{p.title}</h3>
                  <div className="blog-meta">{p.meta}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Newsletter */}
        <Reveal>
          <div style={{
            marginTop:80, padding:'60px 48px',
            background:'color-mix(in oklab, var(--paddy) 8%, var(--bg))',
            border:'1px solid var(--hairline)',
            borderRadius:'var(--radius-lg)',
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center',
          }}>
            <div>
              <span className="eyebrow">SUBSCRIBE</span>
              <h2 style={{fontSize:'clamp(28px, 3vw, 44px)', marginTop:14, lineHeight:1, letterSpacing:'-0.02em'}}>
                Notes on rice,<br/><em style={{fontStyle:'italic', color:'var(--paddy)'}}>once a month.</em>
              </h2>
            </div>
            <div>
              <p style={{color:'var(--ink-2)', lineHeight:1.55, marginBottom:20}}>
                Field notes, recipes, harvest reports, and the occasional discount on bulk orders. No spam — one email, first Saturday of every month.
              </p>
              <div style={{display:'flex', gap:8}}>
                <input className="field-input" style={{flex:1, border:'1px solid var(--hairline)', padding:'14px 18px', borderRadius:999, background:'var(--card)'}} placeholder="your@email.pk" />
                <button className="btn btn-primary btn-lg">Subscribe</button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// =================== CONTACT ===================
function ContactPage() {
  return (
    <div className="page">
      <section className="section-tight" style={{paddingTop:160}}>
        <div className="contact-grid">
          <div>
            <Reveal><span className="eyebrow">CONTACT · BATKHELA</span></Reveal>
            <Reveal delay={100}>
              <h1 className="section-title" style={{marginTop:16}}>
                Drop us<br/><em style={{fontStyle:'italic', color:'var(--paddy)'}}>a line.</em>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p style={{maxWidth:480, color:'var(--ink-2)', fontSize:17, lineHeight:1.6, marginTop:24}}>
                Wholesale enquiries, recipe questions, complaints about a late sack — we read every message. The WhatsApp line is usually fastest.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="contact-card" style={{marginTop:40}}>
                <div className="contact-row">
                  <div className="contact-label">ADDRESS</div>
                  <div className="contact-val">Main GT Road, Near Batkhela Bus Stand,<br/>Batkhela, Malakand, KPK 23200, Pakistan</div>
                </div>
                <div className="contact-row">
                  <div className="contact-label">PHONE</div>
                  <div className="contact-val"><a href="#">+92 946 123 456</a></div>
                </div>
                <div className="contact-row">
                  <div className="contact-label">WHATSAPP</div>
                  <div className="contact-val"><a href="#">+92 300 123 4567</a></div>
                </div>
                <div className="contact-row">
                  <div className="contact-label">EMAIL</div>
                  <div className="contact-val"><a href="#">info@alnoorice.pk</a></div>
                </div>
                <div className="contact-row">
                  <div className="contact-label">HOURS</div>
                  <div className="contact-val">Mon–Sat, 8:00 AM – 6:00 PM PKT</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div style={{background:'var(--card)', border:'1px solid var(--hairline)', borderRadius:'var(--radius-lg)', padding:36}}>
              <h3 style={{fontSize:28, marginBottom:8}}>Send a message</h3>
              <p style={{color:'var(--ink-2)', fontSize:14, marginBottom:28}}>We reply within one working day.</p>

              <div className="field">
                <span className="field-label">Name</span>
                <input className="field-input" placeholder="Your name" />
              </div>
              <div className="field">
                <span className="field-label">Email / Phone</span>
                <input className="field-input" placeholder="Best way to reach you" />
              </div>
              <div className="field">
                <span className="field-label">Subject</span>
                <select className="field-input" style={{padding:'10px 0'}}>
                  <option>Wholesale enquiry</option>
                  <option>Order status</option>
                  <option>Recipe question</option>
                  <option>Complaint</option>
                  <option>Press</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <span className="field-label">Message</span>
                <textarea className="field-input" rows={4} style={{resize:'vertical'}} placeholder="Tell us what you need…" />
              </div>
              <button className="btn btn-primary btn-lg" style={{marginTop:14, width:'100%', justifyContent:'center'}}>
                Send message →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="section">
        <Reveal>
          <div style={{
            aspectRatio:'21/9', borderRadius:'var(--radius-lg)',
            background: 'linear-gradient(155deg, var(--paddy-soft), var(--paddy-deep))',
            position:'relative', overflow:'hidden',
          }}>
            <div className="story-img-placeholder" style={{borderColor:'rgba(255,255,255,0.18)'}}>
              <span>SATELLITE MAP · BATKHELA · 34.6175° N · 71.9794° E</span>
            </div>
            {/* Pin */}
            <div style={{position:'absolute', left:'52%', top:'48%', transform:'translate(-50%,-100%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:'white', zIndex:2}}>
              <div style={{width:14, height:14, borderRadius:'50%', background:'var(--saffron)', boxShadow:'0 0 0 8px color-mix(in oklab, var(--saffron) 30%, transparent), 0 0 0 16px color-mix(in oklab, var(--saffron) 15%, transparent)'}}></div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', background:'rgba(0,0,0,0.4)', padding:'4px 10px', borderRadius:4}}>AL-NOOR MILL</div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

Object.assign(window, { AuthPage, AboutPage, BlogPage, ContactPage });
