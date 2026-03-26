'use client';
import { useState, useEffect } from 'react';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";

export default function CountdownTimer({ departDate }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!departDate) return null;

  const target = new Date(departDate + 'T00:00:00');
  const diff = target - now;

  if (diff <= 0) {
    return (
      <div style={{ textAlign: 'center', margin: '0 auto 8px', padding: '12px 24px', background: 'linear-gradient(135deg,#C45B28,#E8A87C)', borderRadius: 14, maxWidth: 420, color: 'white' }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: PF }}>Buon viaggio! Your trip is here!</div>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const blocks = [
    { val: days, label: 'Days' },
    { val: hours, label: 'Hours' },
    { val: minutes, label: 'Min' },
  ];

  return (
    <div style={{ textAlign: 'center', margin: '0 auto 8px', maxWidth: 420 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10, fontFamily: F }} className="cd-label">Countdown to Departure</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {blocks.map(b => (
          <div key={b.label} style={{ minWidth: 72, padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--card-bg)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: PF, lineHeight: 1 }} className="cd-num">{b.val}</div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontFamily: F, opacity: 0.6 }}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
