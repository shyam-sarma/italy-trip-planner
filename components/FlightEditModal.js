'use client';
import { useState } from 'react';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const inputSt = { padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 12.5, fontFamily: F, color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' };

const EMPTY_LEG = { origin_code: '', origin_city: '', dest_code: '', dest_city: '', airline: '', flight_number: '', aircraft: '', depart_date: '', depart_time: '', arrive_date: '', arrive_time: '', duration: '', class: '', confirm_num: '', notes: '' };

function syncFlightsSingleton(allLegs, updateFlights) {
  const outbound = allLegs.filter(l => l.direction === 'outbound').sort((a, b) => a.leg_order - b.leg_order);
  const ret = allLegs.filter(l => l.direction === 'return').sort((a, b) => a.leg_order - b.leg_order);
  const updates = {};
  if (outbound.length > 0) {
    updates.depart_date = outbound[0].depart_date;
    updates.depart_time = outbound[0].depart_time;
  }
  if (ret.length > 0) {
    const last = ret[ret.length - 1];
    updates.return_date = last.arrive_date;
    updates.return_time = last.arrive_time;
  }
  if (Object.keys(updates).length > 0) updateFlights(updates);
}

function LegForm({ leg, onChange, onRemove, index }) {
  const set = (field, val) => onChange({ ...leg, [field]: val });
  return (
    <div style={{ background: 'var(--subtle-bg)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: F }}>Leg {index + 1}</span>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 14 }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Origin Code</div><input value={leg.origin_code} onChange={e => set('origin_code', e.target.value.toUpperCase())} placeholder="YYZ" maxLength={4} style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Origin City</div><input value={leg.origin_city} onChange={e => set('origin_city', e.target.value)} placeholder="Toronto" style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Dest Code</div><input value={leg.dest_code} onChange={e => set('dest_code', e.target.value.toUpperCase())} placeholder="FCO" maxLength={4} style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Dest City</div><input value={leg.dest_city} onChange={e => set('dest_city', e.target.value)} placeholder="Rome" style={inputSt} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Airline</div><input value={leg.airline} onChange={e => set('airline', e.target.value)} placeholder="Air Transat" style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Flight #</div><input value={leg.flight_number} onChange={e => set('flight_number', e.target.value)} placeholder="TS 551" style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Aircraft</div><input value={leg.aircraft} onChange={e => set('aircraft', e.target.value)} placeholder="A321LR" style={inputSt} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Depart Date</div><input type="date" value={leg.depart_date} onChange={e => set('depart_date', e.target.value)} style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Depart Time</div><input type="time" value={leg.depart_time} onChange={e => set('depart_time', e.target.value)} style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Arrive Date</div><input type="date" value={leg.arrive_date} onChange={e => set('arrive_date', e.target.value)} style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Arrive Time</div><input type="time" value={leg.arrive_time} onChange={e => set('arrive_time', e.target.value)} style={inputSt} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Duration</div><input value={leg.duration} onChange={e => set('duration', e.target.value)} placeholder="1h20m" style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Class</div><input value={leg.class} onChange={e => set('class', e.target.value)} placeholder="Economy" style={inputSt} /></div>
        <div><div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3, fontFamily: F }}>Confirmation</div><input value={leg.confirm_num} onChange={e => set('confirm_num', e.target.value)} placeholder="AL9N93" style={inputSt} /></div>
      </div>
    </div>
  );
}

export default function FlightEditModal({ flightLegs, flightLegsActions, updateFlights, onClose }) {
  const [direction, setDirection] = useState('outbound');

  const existingOutbound = (flightLegs || []).filter(l => l.direction === 'outbound').sort((a, b) => a.leg_order - b.leg_order);
  const existingReturn = (flightLegs || []).filter(l => l.direction === 'return').sort((a, b) => a.leg_order - b.leg_order);

  const [outLegs, setOutLegs] = useState(existingOutbound.length > 0 ? existingOutbound.map(l => ({ ...l })) : [{ ...EMPTY_LEG, id: uid() }]);
  const [retLegs, setRetLegs] = useState(existingReturn.length > 0 ? existingReturn.map(l => ({ ...l })) : [{ ...EMPTY_LEG, id: uid() }]);

  const legs = direction === 'outbound' ? outLegs : retLegs;
  const setLegs = direction === 'outbound' ? setOutLegs : setRetLegs;

  const addLeg = () => setLegs(prev => [...prev, { ...EMPTY_LEG, id: uid() }]);
  const removeLeg = (idx) => setLegs(prev => prev.filter((_, i) => i !== idx));
  const updateLeg = (idx, updated) => setLegs(prev => prev.map((l, i) => i === idx ? updated : l));

  const handleSave = async () => {
    // Delete all existing legs
    for (const leg of flightLegs || []) {
      await flightLegsActions.remove(leg.id);
    }

    // Insert all legs
    const allLegs = [];
    for (let i = 0; i < outLegs.length; i++) {
      const leg = { ...outLegs[i], direction: 'outbound', leg_order: i, id: outLegs[i].id || uid() };
      await flightLegsActions.insert(leg);
      allLegs.push(leg);
    }
    for (let i = 0; i < retLegs.length; i++) {
      const leg = { ...retLegs[i], direction: 'return', leg_order: i, id: retLegs[i].id || uid() };
      await flightLegsActions.insert(leg);
      allLegs.push(leg);
    }

    // Sync singleton
    syncFlightsSingleton(allLegs, updateFlights);
    onClose();
  };

  const dirColor = direction === 'outbound' ? '#C45B28' : '#2C3E50';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, animation: 'fadeIn 0.15s ease' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(90vw, 700px)', maxHeight: '85vh', overflow: 'auto', background: 'var(--card-bg)', borderRadius: 16, border: '1.5px solid var(--border)', padding: 24, zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeSlide 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>✈️ Edit Flights</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>

        {/* Direction tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['outbound', 'return'].map(dir => (
            <button key={dir} onClick={() => setDirection(dir)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: direction === dir ? `1.5px solid ${dir === 'outbound' ? '#C45B28' : '#2C3E50'}` : '1.5px solid var(--border)', background: direction === dir ? `${dir === 'outbound' ? '#C45B28' : '#2C3E50'}12` : 'transparent', color: direction === dir ? (dir === 'outbound' ? '#C45B28' : '#2C3E50') : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F, textTransform: 'capitalize' }}>
              {dir === 'outbound' ? '🛫 Outbound' : '🛬 Return'} ({(dir === 'outbound' ? outLegs : retLegs).length} leg{(dir === 'outbound' ? outLegs : retLegs).length > 1 ? 's' : ''})
            </button>
          ))}
        </div>

        {/* Leg forms */}
        {legs.map((leg, i) => (
          <LegForm key={leg.id || i} leg={leg} index={i} onChange={updated => updateLeg(i, updated)} onRemove={() => legs.length > 1 && removeLeg(i)} />
        ))}

        <button onClick={addLeg} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, marginBottom: 16 }}>
          + Add Leg
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${dirColor},${dirColor}CC)`, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Save All Flights</button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
        </div>
      </div>
    </>
  );
}

export { syncFlightsSingleton };
