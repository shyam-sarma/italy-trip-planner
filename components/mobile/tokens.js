'use client';

export const TOKENS = {
  paper:     '#fbf7f0',
  paperDeep: '#f4ecdf',
  ink:       '#1c140c',
  inkSoft:   '#6b5a48',
  inkMuted:  '#a69680',
  line:      '#e6dcc9',

  accent:    '#d14d4d',
  accentDim: '#f4d5c8',

  olive:     '#6b7a3c',
  lagoon:    '#3e6b7a',
  ochre:     '#b88040',

  display:   "'Instrument Serif', 'Playfair Display', Georgia, serif",
  sans:      "'Geist', 'Inter', -apple-system, system-ui, sans-serif",
  hand:      "'Caveat', 'Bradley Hand', cursive",
  mono:      "'JetBrains Mono', 'Courier Prime', monospace",

  r:   { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 },
  shadow:   '0 1px 2px rgba(28,20,12,0.05), 0 8px 24px rgba(28,20,12,0.06)',
  shadowLg: '0 2px 4px rgba(28,20,12,0.06), 0 20px 48px rgba(28,20,12,0.08)',
};

// Injects global base CSS (scroll hide, press, fade, stamp, screen-switch keyframes)
export function injectBaseStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('italy-base')) return;

  const s = document.createElement('style');
  s.id = 'italy-base';
  s.textContent = `
    .it-scroll { scrollbar-width: none; }
    .it-scroll::-webkit-scrollbar { display: none; }
    .it-btn { font-family: ${TOKENS.sans}; font-weight: 500; border:none; cursor:pointer; }
    .it-press:active { transform: scale(0.97); }
    .it-fade-in { animation: itfade 0.3s ease; }
    @keyframes itfade { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: translateY(0); } }
    @keyframes itstamp { 0% { transform: scale(1.2) rotate(-8deg); opacity: 0; } 60% { transform: scale(0.95) rotate(-8deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); } }
    .it-stamp { animation: itstamp 0.5s cubic-bezier(.34,1.56,.64,1); }
    @keyframes itscr-in-right  { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes itscr-in-left   { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes itscr-out-left  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-40px); opacity: 0; } }
    @keyframes itscr-out-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(40px); opacity: 0; } }
  `;
  document.head.appendChild(s);
}

export function fmtShort(s) {
  if (!s) return '';
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
