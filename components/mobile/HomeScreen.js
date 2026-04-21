'use client';
import { TOKENS, fmtShort } from './tokens';
import { ITSurface, IconSearch, IconChevron, IconHeart } from './ui';
import { CityIllo, Stamp, PaperTexture } from './illustrations';

export default function HomeScreen({ trip, onOpenCity, onGoto }) {
  const departDate = trip.meta.departDate;
  const today = trip.meta.today;
  const daysOut = departDate
    ? Math.round((new Date(departDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 864e5)
    : null;

  const packTotal = trip.packList.reduce((s, c) => s + c.items.length, 0);
  const packDone = trip.packList.reduce((s, c) => s + c.items.filter(i => i.done).length, 0);
  const packPct = packTotal ? Math.round(packDone / packTotal * 100) : 0;

  const totalNights = trip.cities.reduce((s, c) => s + c.nights, 0);
  const subtitle = `${trip.cities.length} cities · ${totalNights} nights · 2 travellers`;

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TOKENS.hand, fontSize: 22, color: TOKENS.accent, lineHeight: 1 }}>ciao, Alex —</div>
              <div style={{ fontFamily: TOKENS.display, fontSize: 28, lineHeight: 1.1, marginTop: 6, letterSpacing: -0.5, paddingBottom: 4 }}>
                your trip is<br/><em style={{ fontStyle: 'italic', color: TOKENS.accent }}>
                  {daysOut !== null ? `${daysOut} days` : '—'}
                </em> away
              </div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 22, flexShrink: 0, marginTop: 4,
              background: TOKENS.paperDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TOKENS.ink,
            }}><IconSearch/></div>
          </div>
        </div>

        <div style={{ margin: '32px 16px 0', position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(165deg, #fff5e6, #f4ecdf)',
            borderRadius: 24, padding: '22px 22px 24px',
            border: `1px solid ${TOKENS.line}`, position: 'relative', overflow: 'hidden',
          }}>
            <PaperTexture opacity={0.08}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform:'uppercase', color: TOKENS.accent, fontWeight: 600 }}>
                  {departDate && trip.meta.returnDate
                    ? `${fmtShort(departDate)} — ${fmtShort(trip.meta.returnDate)}, ${departDate.slice(0,4)}`
                    : 'Dates TBA'}
                </div>
                <div style={{ fontFamily: TOKENS.display, fontSize: 26, lineHeight: 1.05, marginTop: 4 }}>
                  Italy <em style={{ fontStyle:'italic' }}>&amp;</em> London
                </div>
                <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginTop: 4 }}>{subtitle}</div>

                <div style={{ marginTop: 16, display: 'flex', gap: 4, alignItems:'center' }}>
                  {[0,1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1, height: 6, borderRadius:3, background: i<1 ? TOKENS.accent : TOKENS.accentDim }}/>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: 10, color: TOKENS.inkMuted, marginTop: 6 }}>
                  <span>planning</span><span>booked</span><span>packed</span><span>flying</span><span>ciao!</span>
                </div>
              </div>

              <div style={{ marginTop: -4, marginRight: -8 }}>
                <Stamp c={TOKENS.accent} rotate={-10} w={96} h={96} label="Mi parto">
                  <div style={{ fontFamily: TOKENS.display, fontSize: 28, lineHeight: 1 }}>{daysOut ?? '—'}</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', fontWeight: 700 }}>DAYS</div>
                </Stamp>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 20px 10px', display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 12 }}>
          <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3, whiteSpace: 'nowrap' }}>Your journey</div>
          <span style={{ fontSize: 12, color: TOKENS.inkMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>{trip.cities.length} stops</span>
        </div>

        <div className="it-scroll" style={{ overflowX: 'auto', paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ display: 'flex', gap: 12, paddingBottom: 6 }}>
            {trip.cities.map((c, i) => (
              <div key={c.id} onClick={()=>onOpenCity && onOpenCity(c.id)} style={{
                width: 220, flexShrink: 0, borderRadius: 20, overflow: 'hidden',
                background: '#fff', border: `1px solid ${TOKENS.line}`, cursor: 'pointer',
              }} className="it-press">
                <div style={{
                  height: 150, background: `linear-gradient(165deg, ${c.coverTone}, ${c.coverTone}dd)`,
                  display: 'flex', alignItems:'flex-end', justifyContent:'center', position: 'relative',
                  padding: 10,
                }}>
                  <PaperTexture opacity={0.12}/>
                  <div style={{ color: '#2a1f18', marginBottom: 4 }}>
                    <CityIllo id={c.id} w={170} h={100} c="#2a1f18"/>
                  </div>
                  <div style={{
                    position:'absolute', top: 10, left: 10,
                    width: 28, height: 28, borderRadius: 14, background: '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily: TOKENS.display, fontSize: 14, color: TOKENS.ink,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}>{i+1}</div>
                  <div style={{
                    position:'absolute', top: 10, right: 10, color: '#fff', opacity: 0.95,
                  }}><IconHeart/></div>
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontFamily: TOKENS.display, fontSize: 19, letterSpacing: -0.2, lineHeight: 1.1 }}>{c.name}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 2 }}>
                    <div style={{ fontSize: 12, color: TOKENS.inkSoft, flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.tagline}</div>
                    <div style={{ fontSize: 10.5, color: TOKENS.inkMuted, letterSpacing: '0.1em', textTransform:'uppercase', flexShrink: 0 }}>{c.country}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: 10, fontSize: 11.5, color: TOKENS.inkSoft }}>
                    <span>{c.arrive ? `${fmtShort(c.arrive)} – ${fmtShort(c.depart)}` : 'Dates TBA'}</span>
                    {c.nights > 0 && (
                      <>
                        <span style={{ width:3, height:3, borderRadius:2, background: TOKENS.inkMuted }}/>
                        <span>{c.nights} nights</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ width: 8, flexShrink: 0 }}/>
          </div>
        </div>

        <div style={{ padding: '28px 20px 8px' }}>
          <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3 }}>Up next</div>
        </div>
        <div style={{ margin: '0 16px', padding: 16, borderRadius: 20, background: '#fff', border: `1px solid ${TOKENS.line}` }}>
          <div onClick={()=>onGoto && onGoto('wallet')} className="it-press" style={{ display:'flex', gap: 12, alignItems:'center', cursor: 'pointer' }}>
            <div style={{ width:48, height: 48, borderRadius: 14, background: TOKENS.accentDim, display:'flex', alignItems:'center', justifyContent:'center', color: TOKENS.accent }}>
              ✈
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Flight to Rome</div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>
                {trip.flights.dep_from || 'YYZ'} → {trip.flights.dep_to || 'FCO'}
                {departDate ? ` · ${fmtShort(departDate)}` : ''}
                {trip.flights.depart_time ? `, ${trip.flights.depart_time}` : ''}
              </div>
            </div>
            <div style={{ color: TOKENS.inkMuted }}><IconChevron/></div>
          </div>
          <div style={{ height: 1, background: TOKENS.line, margin: '14px -16px' }}/>
          <div onClick={()=>onGoto && onGoto('pack')} className="it-press" style={{ display:'flex', gap: 12, alignItems:'center', cursor: 'pointer' }}>
            <div style={{ width:48, height: 48, borderRadius: 14, background: '#e6dcc9', display:'flex', alignItems:'center', justifyContent:'center' }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Finish packing list</div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>
                {packDone} of {packTotal} items — {packPct}% done
              </div>
            </div>
            <div style={{ color: TOKENS.inkMuted }}><IconChevron/></div>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop: 28, padding: '0 40px' }}>
          <div style={{ fontFamily: TOKENS.hand, fontSize: 18, color: TOKENS.inkSoft }}>
            &ldquo;all you really need is a plane ticket &amp; a reason&rdquo;
          </div>
        </div>
      </div>
    </ITSurface>
  );
}
