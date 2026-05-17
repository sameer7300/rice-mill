/* global React */
// Shared atoms — Logo, Nav, Footer, Grain particles, Rice Bag 3D

const { useState, useEffect, useRef } = React;

function Logo({ onClick }) {
  return (
    <div className="nav-logo" onClick={onClick}>
      <div className="nav-logo-mark"></div>
      <span>Al-Noor <em style={{fontStyle:'italic', color:'var(--paddy)'}}>Mills</em></span>
    </div>
  );
}

function Nav({ page, setPage, cartCount, onCartOpen }) {
  const links = [
    { id: 'home', label: 'Shop' },
    { id: 'product', label: 'Basmati Reserve' },
    { id: 'about', label: 'Heritage' },
    { id: 'blog', label: 'Journal' },
    { id: 'contact', label: 'Contact' },
  ];
  return (
    <nav className="nav">
      <Logo onClick={() => setPage('home')} />
      <div className="nav-links">
        {links.map(l => (
          <span
            key={l.id}
            className={`nav-link ${page === l.id ? 'active' : ''}`}
            onClick={() => setPage(l.id)}
          >{l.label}</span>
        ))}
      </div>
      <div className="nav-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setPage('login')}>
          Sign in
        </button>
        <div className="cart-bubble" onClick={onCartOpen} title="Cart">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3h2l2.4 12.3a2 2 0 0 0 2 1.7h9.7a2 2 0 0 0 2-1.6L23 8H6"/>
            <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
          </svg>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
      </div>
    </nav>
  );
}

function Footer({ setPage }) {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand">Al-Noor <em>Rice Mills</em></div>
          <p style={{maxWidth:300, lineHeight:1.55, opacity:0.78, fontSize:14}}>
            Premium rice milled with patience, in the foothills of Malakand. Since 2010.
          </p>
          <div style={{display:'flex', gap:10, marginTop:24}}>
            {['IG','FB','WA','YT'].map(s => (
              <div key={s} style={{width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.25)', display:'grid', placeItems:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', cursor:'pointer'}}>{s}</div>
            ))}
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="footer-links">
            <a onClick={() => setPage('home')}>All Rice</a>
            <a>Basmati</a><a>Sella</a><a>Brown Rice</a><a>Wholesale</a>
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <div className="footer-links">
            <a onClick={() => setPage('about')}>Heritage</a>
            <a onClick={() => setPage('blog')}>Journal</a>
            <a>Sustainability</a><a>Careers</a>
            <a onClick={() => setPage('contact')}>Contact</a>
          </div>
        </div>
        <div>
          <h4>Visit</h4>
          <p style={{fontSize:13, lineHeight:1.6, opacity:0.78}}>
            Main GT Road<br/>
            Near Batkhela Bus Stand<br/>
            Malakand, KPK 23200<br/>
            Pakistan
          </p>
          <p style={{fontSize:13, marginTop:14, opacity:0.78, fontFamily:'var(--font-mono)', letterSpacing:'0.08em'}}>
            Mon–Sat, 8 AM – 6 PM
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 AL-NOOR RICE MILLS · ESTD MMX</span>
        <span>BATKHELA — MALAKAND — KPK — PK</span>
      </div>
    </footer>
  );
}

// ============= FALLING GRAINS (CSS-based) =============
function FallingGrains({ count = 36, area = 'hero' }) {
  const grains = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 0.6 + Math.random() * 0.8,
      hue: 70 + Math.random() * 25,
    }));
  }, [count]);
  return (
    <div className="grain-canvas" aria-hidden>
      {grains.map(g => (
        <div
          key={g.id}
          className="grain"
          style={{
            left: g.left + '%',
            top: '-20px',
            transform: `scale(${g.size})`,
            background: `linear-gradient(180deg, oklch(0.92 0.06 ${g.hue}), oklch(0.78 0.07 ${g.hue - 10}))`,
            animationDelay: `-${g.delay}s`,
            animationDuration: `${g.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============= 3D RICE BAG =============
function RiceBag3D({ name = "Basmati", variety = "SUPER KERNEL", weight = 5, mouseFollow = true }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mouseFollow) return;
    const handle = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setTilt({ x: dy * 6, y: -22 + dx * 12 });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseFollow]);

  const baseTransform = mouseFollow
    ? `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`
    : undefined;

  return (
    <div className="bag-stage">
      <div
        className="bag"
        ref={ref}
        style={baseTransform ? { transform: baseTransform, animation: 'bagFloat 8s ease-in-out infinite' } : {}}
      >
        <div className="bag-side"></div>
        <div className="bag-side right"></div>
        <div className="bag-face">
          <div className="bag-label">
            <div className="bag-brand">AL-NOOR · BATKHELA</div>
            <div className="bag-name">{name}</div>
            <div className="bag-variety">{variety}</div>
          </div>
          <div className="bag-seal">
            <div>
              <div style={{fontStyle:'italic', fontSize:18, lineHeight:1}}>Reserve</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.2em', marginTop:4, opacity:0.9}}>EST · MMX</div>
            </div>
          </div>
          <div className="bag-weight">
            {weight}<small>KG NET</small>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= Counter animation =============
function Counter({ to, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const start = performance.now();
        const animate = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(to * eased));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// FadeIn wrapper
function Reveal({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`fade-in ${visible ? 'visible' : ''}`}>
      {children}
    </div>
  );
}

Object.assign(window, { Logo, Nav, Footer, FallingGrains, RiceBag3D, Counter, Reveal });
