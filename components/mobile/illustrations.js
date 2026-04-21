'use client';

const Ink = ({ c = 'currentColor', children, w = 120, h = 80 }) => (
  <svg width={w} height={h} viewBox="0 0 120 80" fill="none" stroke={c}
       strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export function RomeIllo({ c = '#2a1f18', w = 140, h = 90 }) {
  return (
    <Ink c={c} w={w} h={h}>
      <ellipse cx="60" cy="58" rx="44" ry="10" />
      <path d="M16 58c0-18 20-30 44-30s44 12 44 30" />
      <path d="M16 58v-18M28 42v-20M40 34v-20M52 30v-20M68 30v-20M80 34v-20M92 42v-20M104 58v-18" />
      {[22,34,46,58,70,82,94].map((x,i)=>(
        <path key={i} d={`M${x-4} 58v-8a4 4 0 018 0v8`} />
      ))}
      <path d="M16 40c0-14 20-24 44-24s44 10 44 24" />
    </Ink>
  );
}

export function AmalfiIllo({ c = '#2a1f18', w = 140, h = 90 }) {
  return (
    <Ink c={c} w={w} h={h}>
      <path d="M4 64c8 2 14 -2 22 0s14 4 22 2 14-4 22-2 14 4 22 2 14-2 22 0" />
      <path d="M4 70c8 2 14 -2 22 0s14 4 22 2 14-4 22-2 14 4 22 2 14-2 22 0" />
      <path d="M20 58l6-16h10l4 10h8l6-14h10l4 12h8l6-10" />
      <rect x="28" y="46" width="4" height="6" />
      <rect x="42" y="42" width="4" height="8" />
      <rect x="58" y="40" width="4" height="8" />
      <ellipse cx="96" cy="32" rx="12" ry="9" />
      <path d="M84 32c2-4 6-8 12-8s10 4 12 8" />
      <path d="M95 23l2-4M102 24l3-3" />
      <path d="M87 30h18M87 34h18" strokeDasharray="1 2" />
    </Ink>
  );
}

export function FlorenceIllo({ c = '#2a1f18', w = 140, h = 90 }) {
  return (
    <Ink c={c} w={w} h={h}>
      <path d="M44 44c0-12 7-22 16-22s16 10 16 22" />
      <path d="M60 22v-10" />
      <circle cx="60" cy="10" r="2" />
      <path d="M42 44h36" />
      <path d="M42 44v14h36v-14" />
      <path d="M46 58v-10M52 58v-10M60 58v-10M68 58v-10M74 58v-10" />
      <rect x="22" y="28" width="10" height="34" />
      <path d="M22 28l5-6 5 6" />
      <path d="M24 36h6M24 42h6M24 48h6M24 54h6" />
      <path d="M8 66h104" />
      <path d="M14 66v6M100 66v6" />
    </Ink>
  );
}

export function VeniceIllo({ c = '#2a1f18', w = 140, h = 90 }) {
  return (
    <Ink c={c} w={w} h={h}>
      <path d="M4 62c8 2 14-2 22 0s14 4 22 2 14-4 22-2 14 4 22 2 14-2 22 0" />
      <path d="M4 70c8 2 14-2 22 0s14 4 22 2 14-4 22-2 14 4 22 2 14-2 22 0" />
      <path d="M30 56c10 4 50 4 60 0" />
      <path d="M30 56c2-4 6-6 10-6h40c4 0 8 2 10 6" />
      <path d="M88 50l6-14" />
      <path d="M94 36l-3-2M94 36l3-2" />
      <circle cx="76" cy="42" r="3" />
      <path d="M76 45v8M74 48l-6 4M76 50l6 2" />
      <path d="M10 40c10-10 26-10 36 0" />
      <path d="M10 40v6M46 40v6" />
    </Ink>
  );
}

export function LondonIllo({ c = '#2a1f18', w = 140, h = 90 }) {
  return (
    <Ink c={c} w={w} h={h}>
      <rect x="52" y="18" width="12" height="44" />
      <path d="M52 18l6-8 6 8" />
      <path d="M58 10v-4" />
      <circle cx="58" cy="5" r="1.4" />
      <circle cx="58" cy="36" r="3" />
      <path d="M58 33v3l2 2" />
      <path d="M52 28h12" />
      <path d="M52 50h12" />
      <path d="M4 62h22v-12h10v-8h12v20" />
      <path d="M74 62v-18h8v-6h10v24" />
      <path d="M96 62v-14h8v-4h8v18" />
      <path d="M2 64h120" />
      <path d="M10 64v6M110 64v6" />
      <path d="M14 20c0-3 3-5 6-5s4 1 5 3c4-1 7 2 7 5" />
    </Ink>
  );
}

export function CityIllo({ id, ...p }) {
  switch (id) {
    case 'rome':     return <RomeIllo {...p}/>;
    case 'amalfi':
    case 'sorrento': return <AmalfiIllo {...p}/>;
    case 'florence': return <FlorenceIllo {...p}/>;
    case 'venice':   return <VeniceIllo {...p}/>;
    case 'london':   return <LondonIllo {...p}/>;
    default:         return <RomeIllo {...p}/>;
  }
}

export function Stamp({ children, c = '#7a3b2a', rotate = -6, w = 130, h = 130, label }) {
  return (
    <div style={{
      position: 'relative', width: w, height: h,
      transform: `rotate(${rotate}deg)`, color: c,
      fontFamily: "'Courier Prime', 'Courier New', monospace",
      filter: 'contrast(1.05)',
    }}>
      <svg width={w} height={h} viewBox="0 0 130 130" fill="none" stroke={c} strokeWidth="1.6">
        <rect x="8" y="8" width="114" height="114" rx="4" strokeDasharray="2 4" opacity="0.7"/>
        <rect x="14" y="14" width="102" height="102" rx="2" opacity="0.5"/>
      </svg>
      <div style={{ position: 'absolute', inset: 14, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4, mixBlendMode:'multiply' }}>
        {children}
      </div>
      {label && <div style={{
        position:'absolute', bottom: 18, left:0, right:0, textAlign:'center',
        fontSize: 9, letterSpacing: '0.18em', fontWeight: 700, textTransform:'uppercase',
      }}>{label}</div>}
    </div>
  );
}

export function PaperTexture({ opacity = 0.06 }) {
  return (
    <svg width="100%" height="100%" style={{
      position:'absolute', inset:0, opacity, pointerEvents:'none', mixBlendMode:'multiply',
    }}>
      <filter id="paper-n">
        <feTurbulence baseFrequency="0.9" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 1 0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-n)"/>
    </svg>
  );
}

export function DashedRoute({ w = 4, h = 200, c = '#2a1f18', opacity = 0.4 }) {
  return (
    <svg width={w} height={h} style={{ display:'block' }}>
      <line x1={w/2} y1={0} x2={w/2} y2={h}
            stroke={c} strokeWidth="1.4" strokeDasharray="2 5" opacity={opacity}/>
    </svg>
  );
}
