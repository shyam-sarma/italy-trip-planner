'use client';
import { TOKENS } from './tokens';
import { ITSurface, IconSun, IconCheck, KindDot } from './ui';
import { CityIllo, PaperTexture } from './illustrations';

function StatChip({ label, value, tone }) {
  return (
    <div style={{
      flex: 1, borderRadius: 16, background: '#fff', border: `1px solid ${TOKENS.line}`,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 10, color: TOKENS.inkMuted, letterSpacing: '0.12em', textTransform:'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: TOKENS.display, fontSize: 22, color: tone, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function TodayScreen({ trip, onOpenCity }) {
  const city = trip.todayCity;
  if (!city) {
    return (
      <ITSurface>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: TOKENS.inkSoft }}>
          <div style={{ fontFamily: TOKENS.display, fontSize: 28 }}>No trip planned yet</div>
          <div style={{ marginTop: 12, fontSize: 14 }}>Add a city to get started.</div>
        </div>
      </ITSurface>
    );
  }

  const dayList = trip.days[city.id] || [];
  const day = dayList.find(d => d.dayIndex === trip.todayDayIndex) || dayList[0];
  const items = day ? day.items : [];

  const today = new Date(trip.meta.today + 'T12:00:00');
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayNum = (trip.todayDayIndex || 0) + 1;

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{
          paddingTop: 58, paddingBottom: 24, paddingLeft: 20, paddingRight: 20,
          background: `linear-gradient(165deg, ${city.coverTone} 0%, ${city.coverTone}ee 60%, ${TOKENS.paper} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <PaperTexture opacity={0.12}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TOKENS.hand, fontSize: 22, color: '#2a1f18', opacity: 0.75 }}>
                Giorno {dayNum} · {city.name}
              </div>
              <div style={{ fontFamily: TOKENS.display, fontSize: 34, lineHeight: 1.02, letterSpacing: -0.6, color: '#1c140c' }}>
                {weekday}
              </div>
              <div style={{ fontSize: 13, color: '#2a1f18', opacity: 0.7, marginTop: 2 }}>{dateLabel}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#2a1f18', flexShrink: 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 6, justifyContent:'flex-end' }}>
                <IconSun/>
                <span style={{ fontFamily: TOKENS.display, fontSize: 26 }}>23°</span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, whiteSpace:'nowrap' }}>sunny · 8% rain</div>
            </div>
          </div>

          <div style={{ marginTop: 16, opacity: 0.92 }}>
            <CityIllo id={city.id} w={280} h={90} c="#2a1f18"/>
          </div>
        </div>

        <div style={{ padding: '18px 16px 0', display: 'flex', gap: 10 }}>
          <StatChip label="Nights left" value={`${Math.max(0, trip.cities.reduce((s,c)=>s+c.nights,0))}`} tone={TOKENS.accent}/>
          <StatChip label="Stops" value={`${trip.cities.length}`} tone={TOKENS.lagoon}/>
          <StatChip label="Day" value={`${dayNum}`} tone={TOKENS.olive}/>
        </div>

        <div style={{ padding: '20px 20px 8px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3 }}>Today&rsquo;s plan</div>
          <span style={{ fontSize: 12, color: TOKENS.inkMuted }}>{items.length} things</span>
        </div>

        <div style={{ padding: '0 16px' }}>
          {items.length === 0 && (
            <div style={{ padding: 20, borderRadius: 16, background: '#fff', border: `1px solid ${TOKENS.line}`, color: TOKENS.inkMuted, fontSize: 13, textAlign: 'center' }}>
              Nothing scheduled for today.
            </div>
          )}
          {items.map((it, i) => (
            <div key={it.id} style={{ display:'flex', gap: 12, position: 'relative' }}>
              <div style={{ width: 52, flexShrink: 0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ fontFamily: TOKENS.mono, fontSize: 11, color: TOKENS.inkSoft, paddingTop: 14 }}>{it.t}</div>
                {i < items.length-1 && (
                  <div style={{ flex: 1, width: 1.5, background: 'transparent', borderLeft: `1.5px dashed ${TOKENS.line}`, marginTop: 6 }}/>
                )}
              </div>
              <div
                onClick={()=>trip.mutators.togglePlanDone(it.id, it.done)}
                className="it-press"
                style={{
                  flex: 1, marginBottom: 10, borderRadius: 18,
                  background: it.done ? TOKENS.paperDeep : '#fff',
                  border: `1px solid ${TOKENS.line}`, padding: '12px 14px',
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                  <KindDot kind={it.kind}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      textDecoration: it.done ? 'line-through' : 'none',
                      color: it.done ? TOKENS.inkMuted : TOKENS.ink,
                    }}>{it.label}</div>
                    {it.ticket && (
                      <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 3, fontFamily: TOKENS.mono, fontSize: 10.5, color: TOKENS.inkSoft }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: TOKENS.paperDeep, letterSpacing: '0.1em' }}>
                          🎫 {it.ticket}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    border: `1.5px solid ${it.done ? TOKENS.accent : TOKENS.line}`,
                    background: it.done ? TOKENS.accent : 'transparent',
                    color: '#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{it.done && <IconCheck/>}</div>
                </div>
                {it.done && (
                  <div className="it-stamp" style={{
                    position:'absolute', right: -4, bottom: -4,
                    color: TOKENS.accent, opacity: 0.4,
                    fontFamily: TOKENS.mono, fontSize: 8, fontWeight: 700, letterSpacing: '0.2em',
                    border: `1.5px solid ${TOKENS.accent}`, padding: '3px 7px', borderRadius: 4,
                    transform: 'rotate(-8deg)',
                  }}>DONE</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {city.stay && (
          <div style={{ padding: '8px 16px 0' }}>
            <div onClick={()=>onOpenCity && onOpenCity(city.id)} className="it-press" style={{
              borderRadius: 18, background: TOKENS.paperDeep,
              padding: 14, display:'flex', gap: 12, alignItems:'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 24 }}>🏨</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: TOKENS.inkSoft }}>Tonight</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{city.stay.name}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>
                  {city.stay.area}{city.stay.confirm ? ` · ref ${city.stay.confirm}` : ''}
                </div>
              </div>
              <div style={{ fontFamily: TOKENS.display, fontSize: 18 }}>🔑</div>
            </div>
          </div>
        )}

        <div style={{ textAlign:'center', marginTop: 22, fontFamily: TOKENS.hand, fontSize: 18, color: TOKENS.inkSoft }}>
          — buona giornata —
        </div>
      </div>
    </ITSurface>
  );
}
