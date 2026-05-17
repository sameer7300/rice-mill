/* global React, ReactDOM, Nav, Footer, HomePage, ProductPage, AuthPage, AboutPage, BlogPage, ContactPage, TweaksPanel, useTweaks, TweakSection, TweakColor, TweakSelect, TweakSlider, TweakToggle, TweakRadio */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#5a7d4f", "#d99250", "#fbf6ec", "#2a2a26"],
  "displayFont": "Newsreader",
  "sansFont": "Geist",
  "density": "comfortable",
  "darkMode": false,
  "animations": "full",
  "showGrains": true,
  "heroVariant": "editorial"
}/*EDITMODE-END*/;

function applyTheme(t) {
  const root = document.documentElement;
  if (t.darkMode) root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');

  // Palette: [paddy, saffron, cream, ink]
  if (Array.isArray(t.palette) && t.palette.length >= 4) {
    root.style.setProperty('--paddy', t.palette[0]);
    root.style.setProperty('--saffron', t.palette[1]);
    if (!t.darkMode) {
      root.style.setProperty('--cream', t.palette[2]);
      root.style.setProperty('--bg', t.palette[2]);
      root.style.setProperty('--paper', t.palette[2]);
      root.style.setProperty('--card', t.palette[2]);
      root.style.setProperty('--ink', t.palette[3]);
      root.style.setProperty('--fg', t.palette[3]);
    }
  }
  root.style.setProperty('--font-display', `"${t.displayFont}", Georgia, serif`);
  root.style.setProperty('--font-sans', `"${t.sansFont}", -apple-system, BlinkMacSystemFont, sans-serif`);

  const densityMap = { compact: 0.7, comfortable: 1, spacious: 1.25 };
  root.style.setProperty('--density', String(densityMap[t.density] || 1));
}

function CartDrawer({ open, onClose, items, removeItem }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <>
      <div className={`drawer-bg ${open ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color:'var(--mute)', textTransform:'uppercase'}}>Your basket</div>
            <h3 style={{fontSize:24, marginTop:4}}>{items.length} item{items.length !== 1 ? 's' : ''}</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div style={{textAlign:'center', padding:'80px 20px', color:'var(--mute)'}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:32, fontStyle:'italic', marginBottom:8}}>Empty.</div>
              <p style={{fontSize:14}}>Browse the catalogue and add a bag or two.</p>
            </div>
          ) : items.map(i => (
            <div key={i.id} className="cart-item">
              <div className="cart-thumb"></div>
              <div>
                <div className="cart-name">{i.name}</div>
                <div className="cart-meta">{i.label || i.variety + ' · ' + i.qty + ' BAG'} · QTY {i.qty}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                <div className="cart-price">₨{(i.price * i.qty).toLocaleString()}</div>
                <button onClick={() => removeItem(i.id)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--mute)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em'}}>REMOVE</button>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:14, fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.1em', color:'var(--mute)', textTransform:'uppercase'}}>
            <span>Subtotal</span>
            <span style={{fontFamily:'var(--font-display)', fontSize:28, color:'var(--ink)', letterSpacing:'normal'}}>₨{total.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}} disabled={items.length === 0}>
            Checkout →
          </button>
          <p style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--mute)', letterSpacing:'0.1em', marginTop:14, textAlign:'center'}}>
            FREE DELIVERY ABOVE ₨5,000 · COD AVAILABLE
          </p>
        </div>
      </div>
    </>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [productId, setProductId] = useState('super-kernel');
  const [cart, setCart] = useState([]);
  const [favs, setFavs] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTheme(t); }, [t]);

  // Reset scroll on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id && (p.label === product.label || !product.label));
      if (existing) return prev.map(p => p === existing ? { ...p, qty: p.qty + qty } : p);
      return [...prev, { ...product, qty }];
    });
    setCartOpen(true);
  };
  const removeItem = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const toggleFav = (id) => setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Pages that hide nav
  const hideNav = page === 'login';

  return (
    <div data-screen-label={`Al-Noor — ${page}`}>
      {!hideNav && <Nav page={page} setPage={setPage} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />}

      {page === 'home' && <HomePage setPage={setPage} setProductId={setProductId} addToCart={addToCart} favs={favs} toggleFav={toggleFav} heroVariant={t.heroVariant} />}
      {page === 'product' && <ProductPage setPage={setPage} addToCart={addToCart} />}
      {page === 'login' && <AuthPage setPage={setPage} />}
      {page === 'about' && <AboutPage />}
      {page === 'blog' && <BlogPage />}
      {page === 'contact' && <ContactPage />}

      {!hideNav && <Footer setPage={setPage} />}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} removeItem={removeItem} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Hero style">
          <TweakSelect
            label="Layout"
            value={t.heroVariant}
            onChange={(v) => setTweak('heroVariant', v)}
            options={[
              { label: 'Editorial (split)', value: 'editorial' },
              { label: 'Center (Apple-style)', value: 'center' },
              { label: 'Magazine cover', value: 'magazine' },
              { label: 'Catalogue grid', value: 'catalogue' },
            ]}
          />
        </TweakSection>

        <TweakSection title="Palette">
          <TweakColor
            label="Heritage Mill colorway"
            value={t.palette}
            onChange={(v) => setTweak('palette', v)}
            options={[
              ["#5a7d4f", "#d99250", "#fbf6ec", "#2a2a26"],
              ["#1d3b30", "#e8b04a", "#f4ede0", "#1c1c1a"],
              ["#704219", "#d97a4e", "#f7f1e6", "#241b14"],
              ["#2c3e50", "#e74c3c", "#f5f1e8", "#1a1a1a"],
              ["#3e5641", "#c79e6a", "#efe9da", "#272721"],
            ]}
          />
          <TweakToggle label="Dark mode" value={t.darkMode} onChange={(v) => setTweak('darkMode', v)} />
        </TweakSection>

        <TweakSection title="Typography">
          <TweakSelect
            label="Display serif"
            value={t.displayFont}
            onChange={(v) => setTweak('displayFont', v)}
            options={['Newsreader', 'Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'Instrument Serif']}
          />
          <TweakSelect
            label="Body sans"
            value={t.sansFont}
            onChange={(v) => setTweak('sansFont', v)}
            options={['Geist', 'Plus Jakarta Sans', 'DM Sans', 'Manrope', 'Work Sans']}
          />
        </TweakSection>

        <TweakSection title="Density & Motion">
          <TweakRadio
            label="Density"
            value={t.density}
            onChange={(v) => setTweak('density', v)}
            options={['compact', 'comfortable', 'spacious']}
          />
          <TweakRadio
            label="Animation"
            value={t.animations}
            onChange={(v) => setTweak('animations', v)}
            options={['minimal', 'subtle', 'full']}
          />
          <TweakToggle label="Falling grain particles" value={t.showGrains} onChange={(v) => setTweak('showGrains', v)} />
        </TweakSection>

        <TweakSection title="Navigate">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
            {[
              {id:'home', l:'Home'},
              {id:'product', l:'Product'},
              {id:'login', l:'Sign in'},
              {id:'about', l:'About'},
              {id:'blog', l:'Journal'},
              {id:'contact', l:'Contact'},
            ].map(p => (
              <button
                key={p.id}
                className="btn btn-sm"
                style={{justifyContent:'center', background: page === p.id ? 'var(--ink)' : 'transparent', color: page === p.id ? 'var(--bg)' : 'var(--ink)', borderColor: page === p.id ? 'var(--ink)' : 'var(--hairline)'}}
                onClick={() => setPage(p.id)}
              >{p.l}</button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>

      {!t.showGrains && (
        <style>{`.grain-canvas { display: none !important; }`}</style>
      )}
      {t.animations === 'minimal' && (
        <style>{`
          .bag { animation: none !important; }
          .grain-canvas { display: none !important; }
          .marquee-track { animation: none !important; }
          .fade-in { opacity: 1 !important; transform: none !important; transition: none !important; }
        `}</style>
      )}
      {t.animations === 'subtle' && (
        <style>{`
          .grain-canvas { opacity: 0.4; }
        `}</style>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
