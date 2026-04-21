'use client';
import { useState, useEffect, useMemo } from 'react';
import { TOKENS, fmtShort } from './tokens';
import { ITSurface, IconChevron, IconCheck, IconHeart, KindDot } from './ui';
import { CityIllo, PaperTexture } from './illustrations';

function Fact({ label, value }) {
  return (
    <div style={{ flex:1, padding: '10px 10px', borderRadius: 14, background: '#fff', border: `1px solid ${TOKENS.line}`, textAlign: 'center' }}>
      <div style={{ fontSize: 9.5, color: TOKENS.inkMuted, letterSpacing: '0.15em', textTransform:'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: TOKENS.display, fontSize: 17, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function CityScreen({ trip, cityId, onBack }) {
  const c = trip.cities.find(x => x.id === cityId) || trip.cities[0];
  const stopIdx = trip.cities.findIndex(x => x.id === c?.id);

  const realDays = trip.days[c?.id] || [];
  const hasDays = realDays.length > 0;

  const [dayIdx, setDayIdx] = useState(0);
  useEffect(() => { setDayIdx(0); }, [c?.id]);

  const syntheticDays = useMemo(() => {
    if (hasDays || !c) return null;
    const out = [];
    const nights = Math.max(c.nights, 1);
    const start = c.arrive ? new Date(c.arrive + 'T12:00:00') : null;
    for (let i = 0; i < nights; i++) {
      const label = start
        ? new Date(start.getTime() + i * 864e5)
            .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : `Day ${i + 1}`;
      out.push({
        dayIndex: i,
        d: label,
        items: [
          { id: `syn-${c.id}-${i}-0`, t: '09:00', label: c.highlights[i % (c.highlights.length || 1)] || 'Explore', kind: 'sight', done: false, synthetic: true },
          { id: `syn-${c.id}-${i}-1`, t: '13:00', label: 'Lunch · local trattoria', kind: 'food', done: false, synthetic: true },
          { id: `syn-${c.id}-${i}-2`, t: '17:00', label: `Walk · ${c.highlights[(i + 1) % (c.highlights.length || 1)] || 'the city'}`, kind: 'sight', done: false, synthetic: true },
        ],
      });
    }
    return out;
  }, [c?.id, hasDays, c?.arrive, c?.nights, c?.highlights]);

  if (!c) return null;

  const effectiveDays = hasDays ? realDays : (syntheticDays || []);
  const effectiveDay = effectiveDays[dayIdx] || effectiveDays[0];

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{
          height: 280, position: 'relative', overflow: 'hidden',
          background: `linear-gradient(165deg, ${c.coverTone} 0%, ${c.coverTone}ee 80%)`,
        }}>
          <PaperTexture opacity={0.15}/>
          <div style={{ position:'absolute', top: 58, left: 16, right: 16, display:'flex', justifyContent:'space-between', zIndex: 2 }}>
            <button onClick={onBack} className="it-btn it-press" style={{
              width: 40, height: 40, borderRadius: 20, background: 'rgba(255,252,246,0.9)',
              backdropFilter: 'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center',
              color: TOKENS.ink, border: 'none',
            }}><IconChevron dir="left"/></button>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="it-press" style={{
                width: 40, height: 40, borderRadius: 20, background: 'rgba(255,252,246,0.9)',
                backdropFilter: 'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center',
                color: TOKENS.ink, cursor: 'pointer',
              }}><IconHeart/></div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#1c140c' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', fontWeight: 700, textTransform:'uppercase', opacity: 0.7 }}>
              Stop {stopIdx+1} of {trip.cities.length} · {c.country === 'Italy' ? 'Italia' : c.country}
            </div>
            <div style={{ fontFamily: TOKENS.display, fontSize: 48, lineHeight: 0.95, letterSpacing: -0.8, marginTop: 4 }}>{c.name}</div>
            <div style={{ fontFamily: TOKENS.hand, fontSize: 20, marginTop: 2 }}>{(c.tagline || '').toLowerCase()}</div>
          </div>
          <div style={{ position: 'absolute', right: -20, top: 72, opacity: 0.85 }}>
            <CityIllo id={c.id} w={220} h={140} c="#2a1f18"/>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0', display:'flex', gap: 8 }}>
          <Fact label="Arrive" value={c.arrive ? fmtShort(c.arrive) : '—'}/>
          <Fact label="Depart" value={c.depart ? fmtShort(c.depart) : '—'}/>
          <Fact label="Nights" value={c.nights}/>
          <Fact label="Budget" value={c.stay ? `$${Math.round((c.stay.cost || 0)/100)/10}k` : '—'}/>
        </div>

        {c.stay && (
          <div style={{ padding: '16px 16px 0' }}>
            <div className="it-press" style={{
              borderRadius: 20, background: '#fff', border: `1px solid ${TOKENS.line}`,
              padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
            }}>
              <div style={{
                width: 58, height: 58, borderRadius: 14, background: TOKENS.paperDeep,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize: 26,
              }}>🏨</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: TOKENS.accent, letterSpacing: '0.18em', textTransform:'uppercase', fontWeight: 700 }}>Tu casa qui</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{c.stay.name}</div>
                <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>
                  {c.stay.area}{c.stay.confirm ? ` · ref ${c.stay.confirm}` : ''}
                </div>
              </div>
              <div style={{ fontFamily: TOKENS.display, fontSize: 16, color: TOKENS.inkMuted }}>›</div>
            </div>
          </div>
        )}

        {effectiveDays.length > 0 && effectiveDay && (
          <>
            <div style={{ padding: '20px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'baseline', gap: 10 }}>
              <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3, whiteSpace:'nowrap' }}>Day by day</div>
              <span style={{ fontSize: 12, color: TOKENS.inkMuted, whiteSpace:'nowrap', flexShrink: 0 }}>{dayIdx+1}/{effectiveDays.length}</span>
            </div>
            <div className="it-scroll" style={{ overflowX: 'auto', padding: '0 16px' }}>
              <div style={{ display:'flex', gap: 8 }}>
                {effectiveDays.map((d, i) => {
                  const on = i === dayIdx;
                  const parts = d.d.split(' ');
                  return (
                    <button key={i} onClick={()=>setDayIdx(i)} className="it-btn it-press" style={{
                      padding: '10px 14px', borderRadius: 14,
                      background: on ? TOKENS.ink : '#fff',
                      color: on ? TOKENS.paper : TOKENS.ink,
                      border: `1px solid ${on ? TOKENS.ink : TOKENS.line}`,
                      display:'flex', flexDirection:'column', alignItems:'center', gap: 2, flexShrink: 0, minWidth: 64,
                    }}>
                      <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {parts[0]}
                      </div>
                      <div style={{ fontFamily: TOKENS.display, fontSize: 18, lineHeight: 1 }}>
                        {parts[2] || parts[1] || ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '14px 16px 0' }}>
              {effectiveDay.items.map(it => (
                <div key={it.id} onClick={()=>{
                  if (!it.synthetic) trip.mutators.togglePlanDone(it.id, it.done);
                }} className="it-press" style={{
                  display:'flex', gap: 12, padding: '12px 14px', marginBottom: 8,
                  borderRadius: 16, background: it.done ? TOKENS.paperDeep : '#fff', border: `1px solid ${TOKENS.line}`,
                  cursor: it.synthetic ? 'default' : 'pointer', alignItems: 'center',
                  opacity: it.synthetic ? 0.75 : 1,
                }}>
                  <div style={{ fontFamily: TOKENS.mono, fontSize: 11, color: TOKENS.inkSoft, width: 40, flexShrink: 0 }}>{it.t}</div>
                  <KindDot kind={it.kind}/>
                  <div style={{
                    flex: 1, fontSize: 14, minWidth: 0,
                    textDecoration: it.done ? 'line-through' : 'none',
                    color: it.done ? TOKENS.inkMuted : TOKENS.ink,
                  }}>{it.label}</div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                    border: `1.5px solid ${it.done ? TOKENS.accent : TOKENS.line}`,
                    background: it.done ? TOKENS.accent : 'transparent',
                    color: '#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{it.done && <IconCheck/>}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {c.tips.length > 0 && (
          <div style={{ padding: '14px 16px 0' }}>
            <div style={{ fontFamily: TOKENS.display, fontSize: 20, letterSpacing: -0.3, marginBottom: 8 }}>Insider notes</div>
            {c.tips.map((t, i)=>(
              <div key={i} style={{
                display:'flex', gap: 10, alignItems:'flex-start',
                background: TOKENS.paperDeep, borderRadius: 14, padding: '10px 14px', marginBottom: 6,
              }}>
                <div style={{ fontFamily: TOKENS.hand, fontSize: 22, color: TOKENS.accent, lineHeight: 1 }}>{i+1}.</div>
                <div style={{ flex: 1, fontSize: 13, color: TOKENS.ink, lineHeight: 1.4 }}>{t}</div>
              </div>
            ))}
          </div>
        )}

        {c.highlights.length > 0 && (
          <div style={{ padding: '14px 16px 0' }}>
            <div style={{ fontFamily: TOKENS.display, fontSize: 20, letterSpacing: -0.3, marginBottom: 10 }}>Highlights</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {c.highlights.map((h,i)=>(
                <span key={i} style={{
                  padding: '7px 12px', borderRadius: 999, fontSize: 12,
                  background: '#fff', border: `1px solid ${TOKENS.line}`, color: TOKENS.ink,
                }}>{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ITSurface>
  );
}
