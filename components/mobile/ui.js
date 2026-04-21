'use client';
import { TOKENS } from './tokens';

export function ITSurface({ children, style = {}, ...rest }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: TOKENS.paper, color: TOKENS.ink,
      fontFamily: TOKENS.sans,
      position: 'relative', overflow: 'hidden',
      ...style,
    }} {...rest}>{children}</div>
  );
}

export function Pill({ children, tone = 'ink', style = {}, onClick }) {
  const map = {
    ink:    { bg: TOKENS.ink, fg: TOKENS.paper },
    accent: { bg: TOKENS.accent, fg: '#fff' },
    ghost:  { bg: 'transparent', fg: TOKENS.ink, border: `1px solid ${TOKENS.line}` },
    paper:  { bg: TOKENS.paperDeep, fg: TOKENS.ink },
  };
  const t = map[tone] || map.ink;
  return (
    <button onClick={onClick} className="it-btn it-press" style={{
      padding: '10px 16px', borderRadius: TOKENS.r.pill,
      background: t.bg, color: t.fg, fontSize: 13, border: t.border || 'none',
      display: 'inline-flex', alignItems: 'center', gap: 8, ...style,
    }}>{children}</button>
  );
}

export function TabBar({ active = 'trip', onTab, dark = false }) {
  const tabs = [
    { id: 'trip',    label: 'Trip',    icon: <IconTrip/> },
    { id: 'today',   label: 'Today',   icon: <IconToday/> },
    { id: 'map',     label: 'Map',     icon: <IconMap/> },
    { id: 'pack',    label: 'Pack',    icon: <IconPack/> },
    { id: 'wallet',  label: 'Wallet',  icon: <IconWallet/> },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12,
      bottom: `calc(12px + env(safe-area-inset-bottom, 0px))`,
      height: 66, borderRadius: 22,
      background: dark ? 'rgba(20,14,8,0.82)' : 'rgba(255,252,246,0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(28,20,12,0.08)'}`,
      boxShadow: TOKENS.shadowLg,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 6px', zIndex: 30,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} className="it-btn it-press" onClick={() => onTab && onTab(t.id)} style={{
            background: 'transparent', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, padding: '6px 10px', borderRadius: 14,
            color: on ? (dark ? '#fff' : TOKENS.ink) : (dark ? 'rgba(255,255,255,0.5)' : TOKENS.inkMuted),
          }}>
            <div style={{ width: 22, height: 22, display: 'flex', alignItems:'center', justifyContent:'center' }}>{t.icon}</div>
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const I = ({ children, s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const IconTrip    = () => <I><path d="M4 7h16M4 12h16M4 17h10"/><circle cx="19" cy="17" r="2"/></I>;
export const IconToday   = () => <I><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></I>;
export const IconMap     = () => <I><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></I>;
export const IconPack    = () => <I><path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/></I>;
export const IconWallet  = () => <I><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14" r="1" fill="currentColor"/></I>;
export const IconChevron = ({ dir = 'right' }) => <I><path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}/></I>;
export const IconCheck   = () => <I s={14}><path d="M4 12l5 5 11-12"/></I>;
export const IconPlus    = () => <I><path d="M12 5v14M5 12h14"/></I>;
export const IconSearch  = () => <I><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></I>;
export const IconHeart   = () => <I><path d="M12 21s-8-5-8-11a5 5 0 019-3 5 5 0 019 3c0 6-8 11-8 11H12z"/></I>;
export const IconClock   = () => <I><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></I>;
export const IconSun     = () => <I><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></I>;
export const IconPin     = () => <I><path d="M12 22s7-7 7-12a7 7 0 00-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></I>;

export function KindDot({ kind }) {
  const map = {
    travel: { c: TOKENS.accent,   g: '✈' },
    stay:   { c: TOKENS.ochre,    g: '🏨' },
    food:   { c: TOKENS.olive,    g: '🍝' },
    sight:  { c: TOKENS.lagoon,   g: '◎' },
    free:   { c: TOKENS.inkMuted, g: '~' },
  };
  const m = map[kind] || map.free;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 10, background: `${m.c}22`, color: m.c,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize: 13, flexShrink: 0,
    }}>{m.g}</div>
  );
}
