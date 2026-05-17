import { useEffect, useRef, useState } from 'react';

interface RiceBag3DProps {
  name?: string;
  variety?: string;
  weight?: number;
  mouseFollow?: boolean;
}

export default function RiceBag3D({
  name = 'Basmati',
  variety = 'SUPER KERNEL',
  weight = 5,
  mouseFollow = true,
}: RiceBag3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: -22 });
  const animRef = useRef<number>();

  useEffect(() => {
    if (!mouseFollow) return;
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setTilt({ x: dy * 6, y: -22 + dx * 12 });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseFollow]);

  const bagStyle = mouseFollow
    ? { transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`, animation: 'bagFloat 8s ease-in-out infinite' }
    : {};

  return (
    <div className="bag-stage">
      <div className="bag" style={bagStyle}>
        <div className="bag-side" />
        <div className="bag-side right" />
        <div className="bag-face">
          <div className="bag-label">
            <div className="bag-brand">AL-NOOR · BATKHELA</div>
            <div className="bag-name">{name}</div>
            <div className="bag-variety">{variety}</div>
          </div>
          <div className="bag-seal">
            <div>
              <div style={{ fontStyle: 'italic', fontSize: 18, lineHeight: 1 }}>Reserve</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', marginTop: 4, opacity: 0.9 }}>
                EST · MMX
              </div>
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
