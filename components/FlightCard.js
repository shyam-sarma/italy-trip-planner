'use client';
import { useState } from 'react';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const fmtDate = (s) => { if (!s) return ''; return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const fmtTime12 = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };
const getDayCount = (a, d) => { if (!a || !d) return 0; const x = new Date(a), y = new Date(d); return isNaN(x) || isNaN(y) ? 0 : Math.max(0, Math.round((y - x) / 864e5)); };

function calcLayover(prevLeg, nextLeg) {
  if (!prevLeg?.arrive_date || !prevLeg?.arrive_time || !nextLeg?.depart_date || !nextLeg?.depart_time) return null;
  const arrive = new Date(`${prevLeg.arrive_date}T${prevLeg.arrive_time}:00`);
  const depart = new Date(`${nextLeg.depart_date}T${nextLeg.depart_time}:00`);
  const diffMin = Math.round((depart - arrive) / 60000);
  if (diffMin <= 0 || isNaN(diffMin)) return null;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return { minutes: diffMin, label: hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}`.trim() : `${mins}m` };
}

function RouteTimeline({ legs, color }) {
  if (!legs.length) return null;
  const airports = [legs[0].origin_code, ...legs.map(l => l.dest_code)];
  const cities = [legs[0].origin_city, ...legs.map(l => l.dest_city)];
  const times = [legs[0].depart_time, ...legs.map(l => l.arrive_time)];
  const dates = [legs[0].depart_date, ...legs.map(l => l.arrive_date)];
  const nextDay = dates[dates.length - 1] !== dates[0];

  return (
    <div>
      {/* Route dots and lines */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 6px', padding: '0 4px' }}>
        {airports.map((code, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < airports.length - 1 ? 1 : 0 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: PF, letterSpacing: '0.02em' }}>{code || '???'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: F, marginTop: 1 }}>{cities[i]}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: color, fontFamily: F, marginTop: 2 }}>{fmtTime12(times[i])}</div>
              {i === airports.length - 1 && nextDay && <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: F }}>+1 day</div>}
            </div>
            {i < airports.length - 1 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', position: 'relative' }}>
                <div style={{ flex: 1, height: 2, background: `${color}30`, borderRadius: 1 }} />
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: color }}>✈</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leg details */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '10px 0' }}>
        {legs.map((leg, i) => (
          <div key={leg.id || i} style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: F }}>
              {leg.flight_number && <span style={{ color: color }}>{leg.flight_number}</span>}
              {leg.airline && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {leg.airline}</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F, marginTop: 2 }}>
              {[leg.aircraft, leg.class, leg.duration].filter(Boolean).join(' · ')}
            </div>
            {/* Layover badge */}
            {i < legs.length - 1 && (() => {
              const layover = calcLayover(leg, legs[i + 1]);
              return layover ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '3px 8px', borderRadius: 6, background: `${color}10`, border: `1px solid ${color}20`, fontSize: 10, fontWeight: 600, color: color, fontFamily: F }}>
                  ⏱ {layover.label} layover at {leg.dest_code}
                </div>
              ) : null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneySection({ title, legs, color, confirmNum }) {
  if (!legs.length) return null;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: color, fontFamily: F }}>
          {title} · {fmtDate(firstLeg.depart_date)}
        </div>
        {confirmNum && (
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 4, background: `${color}10`, color: color, letterSpacing: '0.05em' }}>
            {confirmNum}
          </span>
        )}
      </div>
      <RouteTimeline legs={legs} color={color} />
    </div>
  );
}

// ─── Fallback: simple date/time inputs (current FlightBar behavior) ───
function SimpleFlightBar({ flights, onUpdate, tripDays, totalNights }) {
  if (!flights) return null;
  const inputSt = { padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 12.5, fontFamily: F, color: 'var(--text)', outline: 'none' };
  const debounceUpdate = (field, val) => onUpdate({ [field]: val });
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>✈️</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: F }}>Flight Bookends</span>
        {tripDays !== null && tripDays > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#C45B28', padding: '3px 10px', borderRadius: 8, background: '#C45B2812', fontFamily: F }}>
            {tripDays} day trip{totalNights > 0 ? ` · ${totalNights} night${totalNights > 1 ? 's' : ''} planned` : ''}
          </span>
        )}
      </div>
      <div className="flight-sections" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, padding: '12px 14px', background: 'var(--subtle-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C45B28', marginBottom: 8, fontFamily: F }}>🇨🇦 Toronto Departure</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="date" defaultValue={flights.depart_date} onBlur={e => debounceUpdate('depart_date', e.target.value)} style={{ ...inputSt, flex: 1 }} />
            <input type="time" defaultValue={flights.depart_time} onBlur={e => debounceUpdate('depart_time', e.target.value)} style={{ ...inputSt, flex: 1 }} />
          </div>
        </div>
        <div className="flight-arrow" style={{ display: 'flex', alignItems: 'center', color: 'var(--border)', fontSize: 18 }}>→</div>
        <div style={{ flex: 1, minWidth: 240, padding: '12px 14px', background: 'var(--subtle-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2C3E50', marginBottom: 8, fontFamily: F }}>🇬🇧 Return Flight</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="date" defaultValue={flights.return_date} onBlur={e => debounceUpdate('return_date', e.target.value)} style={{ ...inputSt, flex: 1 }} />
            <input type="time" defaultValue={flights.return_time} onBlur={e => debounceUpdate('return_time', e.target.value)} style={{ ...inputSt, flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main FlightCard ───
export default function FlightCard({ flights, onUpdate, flightLegs, flightLegsActions, tripDays, totalNights, onEditOpen }) {
  const [expanded, setExpanded] = useState(false);

  const outbound = (flightLegs || []).filter(l => l.direction === 'outbound').sort((a, b) => a.leg_order - b.leg_order);
  const returnLegs = (flightLegs || []).filter(l => l.direction === 'return').sort((a, b) => a.leg_order - b.leg_order);
  const hasLegs = outbound.length > 0 || returnLegs.length > 0;

  // Fallback to simple mode if no legs
  if (!hasLegs) {
    return <SimpleFlightBar flights={flights} onUpdate={onUpdate} tripDays={tripDays} totalNights={totalNights} />;
  }

  // Build route strings
  const outRoute = outbound.length > 0 ? [outbound[0].origin_code, ...outbound.map(l => l.dest_code)].filter(Boolean).join(' → ') : '';
  const retRoute = returnLegs.length > 0 ? [returnLegs[0].origin_code, ...returnLegs.map(l => l.dest_code)].filter(Boolean).join(' → ') : '';
  const outConfirm = outbound.find(l => l.confirm_num)?.confirm_num || '';
  const retConfirm = returnLegs.find(l => l.confirm_num)?.confirm_num || '';
  const outAirline = outbound[0]?.airline || '';
  const retAirline = returnLegs[0]?.airline || '';

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1.5px solid var(--border)', marginBottom: 20, overflow: 'hidden' }}>
      {/* Collapsed / Header */}
      <div onClick={() => setExpanded(!expanded)} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: expanded ? 0 : 8 }}>
          <span style={{ fontSize: 16 }}>✈️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>Flight Details</span>
          {tripDays !== null && tripDays > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#C45B28', padding: '3px 10px', borderRadius: 8, background: '#C45B2812', fontFamily: F }}>
              {tripDays} days{totalNights > 0 ? ` · ${totalNights}N` : ''}
            </span>
          )}
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)', fontSize: 14, marginLeft: tripDays ? 0 : 'auto' }}>▾</span>
        </div>

        {!expanded && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
            {/* Outbound summary */}
            {outbound.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C45B28', fontFamily: F }}>{outRoute}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: F, marginTop: 2 }}>
                  {fmtDate(outbound[0].depart_date)}, {fmtTime12(outbound[0].depart_time)}
                  {outAirline && ` · ${outAirline}`}
                  {outConfirm && <span style={{ fontFamily: 'monospace', marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#C45B2810' }}>{outConfirm}</span>}
                </div>
              </div>
            )}
            {/* Dotted separator */}
            <span style={{ color: 'var(--border)', letterSpacing: 2, fontSize: 12 }}>·····</span>
            {/* Return summary */}
            {returnLegs.length > 0 && (
              <div style={{ flex: 1, minWidth: 200, textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50', fontFamily: F }}>{retRoute}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: F, marginTop: 2 }}>
                  {fmtDate(returnLegs[0].depart_date)}, {fmtTime12(returnLegs[0].depart_time)}
                  {retAirline && ` · ${retAirline}`}
                  {returnLegs.length > 1 && ` · ${returnLegs.length - 1} stop`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '0 20px 18px', animation: 'fadeSlide 0.2s ease' }}>
          {outbound.length > 0 && <JourneySection title="Outbound" legs={outbound} color="#C45B28" confirmNum={outConfirm} />}

          {outbound.length > 0 && returnLegs.length > 0 && (
            <div style={{ borderTop: '2px dashed var(--border)', margin: '14px 0' }} />
          )}

          {returnLegs.length > 0 && <JourneySection title="Return" legs={returnLegs} color="#2C3E50" confirmNum={retConfirm} />}

          {onEditOpen && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={e => { e.stopPropagation(); onEditOpen(); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 6 }}>
                ✏️ Edit Flights
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
