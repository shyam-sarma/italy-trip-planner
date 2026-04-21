'use client';
import { TOKENS, fmtShort } from './tokens';
import { ITSurface } from './ui';
import { CityIllo, PaperTexture, Stamp } from './illustrations';

const TRANSIT_HINTS = [
  '🚂 Frecciarossa · 1h10',
  '🚗 Drive + ferry · 4h',
  '🚂 Regionale · 1h30',
  '🚂 Frecciarossa · 2h20',
  '✈ Eurostar · 5h',
];

export default function TimelineScreen({ trip, onOpenCity }) {
  const cities = trip.cities;
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);
  const departTime = trip.flights.depart_time || '';
  const departDate = trip.meta.departDate;
  const returnDate = trip.meta.returnDate;

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.25em', textTransform:'uppercase', color: TOKENS.accent, fontWeight: 700 }}>
            The Itinerary
          </div>
          <div style={{ fontFamily: TOKENS.display, fontSize: 40, lineHeight: 1, letterSpacing: -0.8, marginTop: 6 }}>
            Roma <em style={{ fontStyle:'italic', color: TOKENS.inkMuted }}>to</em> London
          </div>
          <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginTop: 6 }}>
            {totalNights} nights · {cities.length} stops · ≈ 1,850km of Italian soil + a Eurostar to the UK
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'center', padding: '28px 0 4px' }}>
          <Stamp c={TOKENS.accent} rotate={-6} w={110} h={110} label="Partenza">
            <div style={{ fontFamily: TOKENS.display, fontSize: 13, lineHeight: 1 }}>
              {trip.flights.dep_from || 'YYZ'}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 700 }}>
              {departDate ? fmtShort(departDate).toUpperCase() : 'MAY 8'}{departTime ? ` · ${departTime}` : ''}
            </div>
          </Stamp>
        </div>

        <div style={{ padding: '8px 20px 0' }}>
          {cities.map((c, i) => (
            <div key={c.id} style={{ position: 'relative', paddingLeft: 40, paddingBottom: 28 }}>
              <div style={{
                position: 'absolute', left: 13, top: 14, bottom: 0,
                width: 0, borderLeft: `1.5px dashed ${TOKENS.inkMuted}`, opacity: 0.5,
                display: i < cities.length - 1 ? 'block' : 'none',
              }}/>
              <div style={{
                position: 'absolute', left: 0, top: 8,
                width: 28, height: 28, borderRadius: 14, background: c.coverTone,
                border: `2px solid ${TOKENS.paper}`, boxShadow: `0 0 0 1.5px ${c.coverTone}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: TOKENS.display, fontSize: 14, color: '#2a1f18', fontWeight: 600,
              }}>{i+1}</div>

              <div onClick={()=>onOpenCity && onOpenCity(c.id)} className="it-press" style={{
                borderRadius: 20, background: '#fff', border: `1px solid ${TOKENS.line}`,
                overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{
                  height: 110, background: `linear-gradient(165deg, ${c.coverTone}, ${c.coverTone}dd)`,
                  display:'flex', alignItems:'flex-end', justifyContent: 'space-between',
                  padding: '10px 14px', position: 'relative',
                }}>
                  <PaperTexture opacity={0.12}/>
                  <div style={{ color: '#2a1f18' }}>
                    <CityIllo id={c.id} w={130} h={80} c="#2a1f18"/>
                  </div>
                  <div style={{ textAlign: 'right', color: '#2a1f18' }}>
                    <div style={{ fontFamily: TOKENS.hand, fontSize: 22, lineHeight: 1, opacity: 0.85 }}>
                      stop {i+1}/{cities.length}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                    <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: TOKENS.inkMuted, fontFamily: TOKENS.mono }}>{c.nights}N</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginTop: 1 }}>{c.tagline}</div>
                  <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 8, fontFamily: TOKENS.mono }}>
                    {c.arrive ? `${fmtShort(c.arrive)} → ${fmtShort(c.depart)}` : 'Dates TBA'}
                  </div>
                  {c.stay && (
                    <>
                      <div style={{ height: 1, background: TOKENS.line, margin: '10px 0' }}/>
                      <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12, color: TOKENS.ink }}>
                        <span style={{ fontSize: 12 }}>🏨</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.stay.name}</span>
                        {c.stay.cost > 0 && (
                          <span style={{ fontFamily: TOKENS.mono, color: TOKENS.inkSoft, fontSize: 11 }}>${c.stay.cost}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {i < cities.length - 1 && (
                <div style={{
                  fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: TOKENS.inkMuted, marginTop: 14, marginLeft: 4, fontWeight: 600,
                }}>
                  {TRANSIT_HINTS[i] || '→'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'center', padding: '4px 0 20px' }}>
          <Stamp c={TOKENS.ink} rotate={4} w={110} h={110} label="Ritorno">
            <div style={{ fontFamily: TOKENS.display, fontSize: 13, lineHeight: 1 }}>
              {trip.flights.ret_from || 'LHR'}→{trip.flights.ret_to || 'YYZ'}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 700 }}>
              {returnDate ? fmtShort(returnDate).toUpperCase() : 'MAY 28'}
            </div>
          </Stamp>
        </div>
      </div>
    </ITSurface>
  );
}
