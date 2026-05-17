import { useMemo } from 'react';

interface FallingGrainsProps {
  count?: number;
}

export default function FallingGrains({ count = 24 }: FallingGrainsProps) {
  const grains = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 7 + Math.random() * 8,
      size: 0.6 + Math.random() * 0.8,
      hue: 68 + Math.random() * 22,
      sat: 0.05 + Math.random() * 0.04,
    })), [count]
  );

  return (
    <div className="grain-canvas" aria-hidden="true">
      {grains.map(g => (
        <div
          key={g.id}
          className="grain"
          style={{
            left: `${g.left}%`,
            top: '-20px',
            transform: `scale(${g.size})`,
            background: `linear-gradient(180deg,
              oklch(0.91 ${g.sat} ${g.hue}),
              oklch(0.79 ${g.sat + 0.01} ${g.hue - 10}))`,
            animationDelay: `-${g.delay}s`,
            animationDuration: `${g.duration}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
