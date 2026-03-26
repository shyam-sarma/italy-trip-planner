'use client';
import { useMemo } from 'react';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";

// Approximate coordinates for known cities (normalized to SVG viewBox)
const CITY_COORDS = {
  rome: { x: 285, y: 340, lat: 41.9, lng: 12.5 },
  sorrento: { x: 305, y: 380, lat: 40.6, lng: 14.4 },
  florence: { x: 260, y: 270, lat: 43.8, lng: 11.3 },
  venice: { x: 285, y: 210, lat: 45.4, lng: 12.3 },
  london: { x: 130, y: 55, lat: 51.5, lng: -0.1 },
  milan: { x: 225, y: 205, lat: 45.5, lng: 9.2 },
  naples: { x: 305, y: 370, lat: 40.8, lng: 14.3 },
  amalfi: { x: 310, y: 378, lat: 40.6, lng: 14.6 },
  positano: { x: 308, y: 376, lat: 40.6, lng: 14.5 },
  pisa: { x: 245, y: 270, lat: 43.7, lng: 10.4 },
  cinque_terre: { x: 230, y: 255, lat: 44.1, lng: 9.7 },
  bologna: { x: 265, y: 255, lat: 44.5, lng: 11.3 },
  barcelona: { x: 105, y: 270, lat: 41.4, lng: 2.2 },
  paris: { x: 145, y: 115, lat: 48.9, lng: 2.3 },
  amsterdam: { x: 175, y: 70, lat: 52.4, lng: 4.9 },
};

function getCityPos(city) {
  const key = city.id.toLowerCase().replace(/[^a-z]/g, '');
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Check if name matches any known city
  const nameKey = city.name.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (nameKey.includes(k) || k.includes(nameKey)) return v;
  }
  return null;
}

export default function MapView({ cities, flights }) {
  const positions = useMemo(() => {
    return cities.map(city => ({ city, pos: getCityPos(city) })).filter(c => c.pos);
  }, [cities]);

  const hasLondon = positions.some(p => p.city.id === 'london' || p.city.name.toLowerCase().includes('london'));
  const viewBox = hasLondon ? "40 20 380 420" : "160 160 220 280";

  return (
    <div>
      <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
        <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', maxHeight: 520 }}>
          {/* Water background */}
          <rect x="40" y="20" width="380" height="420" fill="var(--map-water, #E8F4FD)" rx="8" />

          {/* Simplified Europe landmass */}
          <path d="M100,40 L110,35 L140,38 L160,32 L180,40 L200,35 L210,42 L195,55 L210,58 L215,50 L230,55 L240,48 L260,55 L270,50 L280,58 L270,65 L260,62 L250,68 L265,80 L260,95 L270,100 L265,115 L255,120 L260,130 L250,140 L240,135 L230,145 L220,140 L210,150 L200,148 L190,155 L180,150 L175,155 L165,145 L155,150 L145,142 L140,155 L130,160 L125,148 L115,155 L105,145 L100,150 L95,140 L100,130 L95,125 L100,115 L90,110 L85,100 L95,90 L90,80 L95,70 L90,55 Z" fill="var(--map-land, #E8E0D4)" stroke="var(--map-border, #D4C8B8)" strokeWidth="0.8" />

          {/* UK */}
          <path d="M108,38 L115,30 L122,28 L130,32 L140,30 L148,35 L145,42 L140,48 L135,52 L128,55 L120,52 L112,48 L108,42 Z" fill="var(--map-land, #E8E0D4)" stroke="var(--map-border, #D4C8B8)" strokeWidth="0.8" />
          <path d="M100,38 L106,30 L110,35 L108,42 L102,44 Z" fill="var(--map-land, #E8E0D4)" stroke="var(--map-border, #D4C8B8)" strokeWidth="0.8" />

          {/* Italy boot */}
          <path d="M250,230 L260,225 L268,230 L275,225 L285,228 L290,238 L285,248 L290,255 L295,265 L298,275 L295,285 L300,295 L305,310 L300,325 L305,335 L310,345 L315,355 L310,365 L315,375 L320,382 L315,388 L305,385 L298,390 L290,386 L285,380 L290,375 L285,365 L280,358 L275,365 L268,358 L272,348 L268,340 L270,332 L265,322 L260,315 L255,305 L250,295 L248,285 L245,270 L248,255 L245,240 Z" fill="var(--map-italy, #F5EDE3)" stroke="#C45B28" strokeWidth="1.2" />

          {/* Sicily */}
          <path d="M280,395 L295,392 L305,395 L310,400 L305,408 L295,410 L285,405 Z" fill="var(--map-italy, #F5EDE3)" stroke="#C45B28" strokeWidth="0.8" />

          {/* Sardinia */}
          <path d="M240,340 L248,335 L252,342 L250,355 L245,360 L238,355 L236,345 Z" fill="var(--map-italy, #F5EDE3)" stroke="#C45B28" strokeWidth="0.8" />

          {/* Route lines between cities */}
          {positions.map((p, i) => {
            if (i === 0) return null;
            const prev = positions[i - 1];
            return (
              <line key={`route-${i}`} x1={prev.pos.x} y1={prev.pos.y} x2={p.pos.x} y2={p.pos.y}
                stroke="#C45B28" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            );
          })}

          {/* Route arrows */}
          {positions.map((p, i) => {
            if (i === 0) return null;
            const prev = positions[i - 1];
            const mx = (prev.pos.x + p.pos.x) / 2;
            const my = (prev.pos.y + p.pos.y) / 2;
            const angle = Math.atan2(p.pos.y - prev.pos.y, p.pos.x - prev.pos.x) * 180 / Math.PI;
            return (
              <g key={`arrow-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
                <polygon points="0,-3 6,0 0,3" fill="#C45B28" opacity="0.7" />
              </g>
            );
          })}

          {/* City markers */}
          {positions.map((p, i) => (
            <g key={p.city.id}>
              {/* Pulse ring */}
              <circle cx={p.pos.x} cy={p.pos.y} r="10" fill={p.city.color} opacity="0.12">
                <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.15" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Main dot */}
              <circle cx={p.pos.x} cy={p.pos.y} r="6" fill={p.city.color} stroke="white" strokeWidth="2" />
              {/* Number label */}
              <circle cx={p.pos.x + 10} cy={p.pos.y - 10} r="7" fill={p.city.color} />
              <text x={p.pos.x + 10} y={p.pos.y - 7} textAnchor="middle" fontSize="8" fill="white" fontWeight="700" fontFamily={F}>{i + 1}</text>
              {/* City name */}
              <text x={p.pos.x + 20} y={p.pos.y - 6} fontSize="10" fill={p.city.color} fontWeight="700" fontFamily={F}>{p.city.emoji} {p.city.name}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* City legend */}
      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        {positions.map((p, i) => {
          const days = p.city.arrive && p.city.depart ? Math.max(0, Math.round((new Date(p.city.depart + 'T12:00:00') - new Date(p.city.arrive + 'T12:00:00')) / 86400000)) : 0;
          const fmtDate = (s) => { if (!s) return ''; return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
          return (
            <div key={p.city.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 12, border: `1.5px solid ${p.city.color}20` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${p.city.color},${p.city.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: F, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 16 }}>{p.city.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>{p.city.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>
                  {p.city.arrive ? `${fmtDate(p.city.arrive)}${p.city.depart ? ` — ${fmtDate(p.city.depart)}` : ''}` : 'Dates TBD'}
                  {days > 0 && ` · ${days} night${days > 1 ? 's' : ''}`}
                </div>
              </div>
              {i < positions.length - 1 && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
