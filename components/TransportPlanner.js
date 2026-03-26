'use client';
import { useState } from 'react';
import { useTable } from '../lib/hooks';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (s) => { if (!s) return ''; return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }); };

const TRANSPORT_TYPES = [
  { id: 'train', emoji: '🚆', label: 'Train' },
  { id: 'bus', emoji: '🚌', label: 'Bus' },
  { id: 'ferry', emoji: '⛴️', label: 'Ferry' },
  { id: 'flight', emoji: '✈️', label: 'Flight' },
  { id: 'car', emoji: '🚗', label: 'Car/Taxi' },
];

const inputSt = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 13, fontFamily: F, color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' };

export default function TransportPlanner({ cities }) {
  const { data: transports, insert, remove } = useTable('transports', { orderBy: 'sort_order' });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ from_city_id: '', to_city_id: '', type: 'train', departure_date: '', departure_time: '', arrival_time: '', booking_ref: '', platform: '', cost: '', notes: '' });

  const totalCost = transports.reduce((s, t) => s + Number(t.cost || 0), 0);

  const handleAdd = async () => {
    if (!form.from_city_id || !form.to_city_id) return;
    await insert({ id: uid(), ...form, cost: form.cost ? Number(form.cost) : 0, sort_order: transports.length });
    setForm({ from_city_id: '', to_city_id: '', type: 'train', departure_date: '', departure_time: '', arrival_time: '', booking_ref: '', platform: '', cost: '', notes: '' });
    setAdding(false);
  };

  return (
    <div>
      {totalCost > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ background: 'linear-gradient(135deg,#1A5276,#85C1E9)', borderRadius: 14, padding: '18px 24px', color: 'white', minWidth: 180 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontFamily: F }}>Transport Total</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: PF, marginTop: 4 }}>${totalCost.toLocaleString()}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2, fontFamily: F }}>CAD estimated</div>
          </div>
          <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '18px 20px', border: '1.5px solid var(--border)', minWidth: 130 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A5276', fontWeight: 600, fontFamily: F }}>Segments</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: PF, marginTop: 4 }}>{transports.length}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {transports.map(t => {
          const fromCity = cities.find(c => c.id === t.from_city_id);
          const toCity = cities.find(c => c.id === t.to_city_id);
          const tt = TRANSPORT_TYPES.find(x => x.id === t.type) || TRANSPORT_TYPES[0];
          return (
            <div key={t.id} style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{tt.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>
                    {fromCity?.emoji} {fromCity?.name || 'Unknown'} → {toCity?.emoji} {toCity?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F, marginTop: 2 }}>
                    {tt.label}{t.departure_date ? ` · ${fmtDate(t.departure_date)}` : ''}
                  </div>
                </div>
                {t.cost > 0 && <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontFamily: F }}>${Number(t.cost).toLocaleString()}</span>}
                <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 16, padding: '0 4px' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>
                {t.departure_time && <span>Depart: {t.departure_time}</span>}
                {t.arrival_time && <span>Arrive: {t.arrival_time}</span>}
                {t.platform && <span>Platform: {t.platform}</span>}
                {t.booking_ref && <span style={{ color: '#1A5276', fontWeight: 600 }}>Ref: {t.booking_ref}</span>}
              </div>
              {t.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, padding: '6px 10px', background: 'var(--subtle-bg)', borderRadius: 8, fontFamily: F }}>{t.notes}</div>}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid #1A527640' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: PF }}>Add Transport</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>From</div>
              <select value={form.from_city_id} onChange={e => setForm(f => ({ ...f, from_city_id: e.target.value }))} style={inputSt}>
                <option value="">Select city...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>To</div>
              <select value={form.to_city_id} onChange={e => setForm(f => ({ ...f, to_city_id: e.target.value }))} style={inputSt}>
                <option value="">Select city...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontFamily: F }}>Type</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TRANSPORT_TYPES.map(tt => (
                <div key={tt.id} onClick={() => setForm(f => ({ ...f, type: tt.id }))} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: F, border: form.type === tt.id ? '1.5px solid #1A5276' : '1.5px solid var(--border)', background: form.type === tt.id ? '#1A527612' : 'transparent', color: form.type === tt.id ? '#1A5276' : 'var(--text-muted)', fontWeight: form.type === tt.id ? 600 : 400 }}>
                  {tt.emoji} {tt.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Date</div><input type="date" value={form.departure_date} onChange={e => setForm(f => ({ ...f, departure_date: e.target.value }))} style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Depart Time</div><input type="time" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Arrive Time</div><input type="time" value={form.arrival_time} onChange={e => setForm(f => ({ ...f, arrival_time: e.target.value }))} style={inputSt} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Booking Ref</div><input value={form.booking_ref} onChange={e => setForm(f => ({ ...f, booking_ref: e.target.value }))} placeholder="e.g. AB12345" style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Platform/Gate</div><input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="e.g. Platform 3" style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Cost (CAD)</div><input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} style={inputSt} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Notes</div><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Seat preference, luggage info..." style={inputSt} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={!form.from_city_id || !form.to_city_id} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: form.from_city_id && form.to_city_id ? 'linear-gradient(135deg,#1A5276,#85C1E9)' : '#E8E0D4', color: form.from_city_id && form.to_city_id ? 'white' : '#B0A090', fontSize: 13, fontWeight: 600, cursor: form.from_city_id && form.to_city_id ? 'pointer' : 'default', fontFamily: F }}>Add Transport</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setAdding(true)} style={{ background: 'transparent', borderRadius: 14, padding: '28px 24px', border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1A527610', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚆</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', fontFamily: F }}>Add Transport Segment</span>
        </div>
      )}
    </div>
  );
}
