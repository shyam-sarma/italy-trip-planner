'use client';
import { useState } from 'react';
import { TOKENS, fmtShort } from './tokens';
import { ITSurface } from './ui';
import { PaperTexture } from './illustrations';

function WalletPass({ pass, expanded = true }) {
  const icon = pass.kind === 'flight' ? '✈' : '🏨';
  return (
    <div style={{
      borderRadius: 20, padding: 16,
      background: pass.tone, color: '#fff',
      position: 'relative', overflow: 'hidden',
      boxShadow: TOKENS.shadow,
    }}>
      <PaperTexture opacity={0.2}/>
      <div style={{
        position:'absolute', left: 0, right: 0, top: expanded ? '50%' : 'auto', bottom: expanded ? 'auto' : 40,
        height: 1, borderTop: `1px dashed rgba(255,255,255,0.35)`,
      }}/>
      <div style={{ position:'absolute', left: -8, top: expanded ? 'calc(50% - 8px)' : 'calc(100% - 48px)', width: 16, height: 16, borderRadius: 8, background: TOKENS.paper }}/>
      <div style={{ position:'absolute', right: -8, top: expanded ? 'calc(50% - 8px)' : 'calc(100% - 48px)', width: 16, height: 16, borderRadius: 8, background: TOKENS.paper }}/>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.75, fontWeight: 700, textTransform:'uppercase' }}>
            {pass.kind === 'flight' ? 'Boarding pass' : 'Hotel reservation'}
          </div>
          <div style={{ fontFamily: TOKENS.display, fontSize: 24, marginTop: 4, lineHeight: 1.05 }}>{pass.title}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{pass.sub}</div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.85 }}>{icon}</div>
      </div>

      {expanded && (
        <>
          <div style={{ height: 24 }}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginTop: 4 }}>
            {pass.lines.map((l,i)=>(
              <div key={i}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', opacity: 0.65, textTransform:'uppercase', fontWeight: 700 }}>{l[0]}</div>
                <div style={{ fontSize: 15, fontWeight: 500, fontFamily: TOKENS.mono }}>{l[1]}</div>
              </div>
            ))}
          </div>
          {pass.ref && (
            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontFamily: TOKENS.mono, fontSize: 11, letterSpacing: '0.15em' }}>REF · {pass.ref}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Apple Wallet ›</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function buildPasses(trip) {
  const out = [];
  const f = trip.flights || {};

  if (f.depart_date || f.dep_from) {
    const lines = [
      ['Gate',     f.dep_gate || 'TBA'],
      ['Seat',     f.dep_seat || '—'],
      ['Class',    f.dep_class || 'Economy'],
      ['Duration', f.dep_duration || '—'],
    ];
    out.push({
      kind: 'flight',
      title: `${f.dep_from || 'YYZ'} → ${f.dep_to || 'FCO'}`,
      sub: `${f.depart_date ? fmtShort(f.depart_date) : '—'}${f.depart_time ? ` · ${f.depart_time}` : ''}`,
      ref: f.dep_confirm || '',
      tone: TOKENS.accent,
      lines,
    });
  }

  trip.cities.forEach(c => {
    if (!c.stay) return;
    const lines = [
      ['Check-in',  c.stay.checkin ? fmtShort(c.stay.checkin) : '—'],
      ['Check-out', c.stay.checkout ? fmtShort(c.stay.checkout) : '—'],
      ['Nights',    String(c.nights || '—')],
      ['Total',     c.stay.cost ? `$${Number(c.stay.cost).toLocaleString()}` : '—'],
    ];
    out.push({
      kind: 'stay',
      title: c.stay.name,
      sub: `${c.name}${c.stay.checkin && c.stay.checkout ? ` · ${fmtShort(c.stay.checkin)}–${fmtShort(c.stay.checkout)}` : ''}`,
      ref: c.stay.confirm || '',
      tone: c.coverTone || TOKENS.ochre,
      lines,
    });
  });

  if (f.return_date || f.ret_from) {
    const lines = [
      ['Gate',     f.ret_gate || 'TBA'],
      ['Seat',     f.ret_seat || '—'],
      ['Class',    f.ret_class || 'Economy'],
      ['Duration', f.ret_duration || '—'],
    ];
    out.push({
      kind: 'flight',
      title: `${f.ret_from || 'LHR'} → ${f.ret_to || 'YYZ'}`,
      sub: `${f.return_date ? fmtShort(f.return_date) : '—'}${f.return_time ? ` · ${f.return_time}` : ''}`,
      ref: f.ret_confirm || '',
      tone: TOKENS.ink,
      lines,
    });
  }

  return out;
}

export default function WalletScreen({ trip, expanded, setExpanded }) {
  const [internal, setInternal] = useState(null);
  const exp = expanded !== undefined ? expanded : internal;
  const setExp = setExpanded || setInternal;

  const passes = buildPasses(trip);

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform:'uppercase', color: TOKENS.accent, fontWeight: 700 }}>Your bookings</div>
          <div style={{ fontFamily: TOKENS.display, fontSize: 38, lineHeight: 1, letterSpacing: -0.6, marginTop: 6 }}>
            The Wallet
          </div>
          <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginTop: 6 }}>
            {passes.length} passes · tap any to expand
          </div>
        </div>

        <div style={{ padding: '16px 16px 0', display:'flex', gap: 8 }}>
          {['All','Flights','Stays','Trains'].map((f,i)=>(
            <div key={f} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: i===0 ? TOKENS.ink : '#fff', color: i===0 ? TOKENS.paper : TOKENS.ink,
              border: `1px solid ${i===0 ? TOKENS.ink : TOKENS.line}`,
            }}>{f}</div>
          ))}
        </div>

        <div style={{ padding: '20px 16px 0', position: 'relative' }}>
          {passes.length === 0 && (
            <div style={{ padding: 20, borderRadius: 18, background: '#fff', border: `1px solid ${TOKENS.line}`, color: TOKENS.inkMuted, fontSize: 13, textAlign: 'center' }}>
              No bookings yet.
            </div>
          )}
          {passes.map((p, i) => {
            const isOpen = exp === i;
            return (
              <div key={i} onClick={()=>setExp(isOpen ? null : i)}
                className="it-press" style={{
                marginTop: i === 0 ? 0 : (isOpen || exp === null ? -120 : -150),
                transition: 'margin-top 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <WalletPass pass={p} expanded={isOpen || exp === null}/>
              </div>
            );
          })}
        </div>

        <div style={{ margin: '24px 16px 0', padding: '14px 16px', borderRadius: 18, background: TOKENS.paperDeep, display:'flex', gap: 12, alignItems:'center' }}>
          <div style={{ fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: '0.1em', color: TOKENS.inkSoft }}>
            P&lt;CAN&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>
            HR8827&lt;20260508ITA&lt;&lt;VC5501&lt;2026
          </div>
        </div>
      </div>
    </ITSurface>
  );
}
