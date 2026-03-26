'use client';
import { useState } from 'react';
import { useTable } from '../lib/hooks';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const PRICE_RANGES = ['€', '€€', '€€€', '€€€€'];
const CUISINE_OPTIONS = ['Italian', 'Seafood', 'Pizza', 'Gelato/Dessert', 'Wine Bar', 'Cafe', 'Street Food', 'Fine Dining', 'British', 'Pub', 'Other'];

const inputSt = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 13, fontFamily: F, color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' };

const StarRating = ({ rating, onRate, size = 16 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => onRate && onRate(i)} style={{ cursor: onRate ? 'pointer' : 'default', fontSize: size, opacity: i <= rating ? 1 : 0.25 }}>★</span>
    ))}
  </div>
);

export default function RestaurantBookmarks({ cities }) {
  const { data: restaurants, insert, update, remove } = useTable('restaurants', { orderBy: 'created_at' });
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ city_id: cities[0]?.id || '', name: '', cuisine: '', price_range: '€€', maps_url: '', address: '', notes: '' });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await insert({ id: uid(), ...form, visited: false, rating: 0 });
    setForm({ city_id: cities[0]?.id || '', name: '', cuisine: '', price_range: '€€', maps_url: '', address: '', notes: '' });
    setAdding(false);
  };

  const filtered = filter === 'all' ? restaurants
    : filter === 'visited' ? restaurants.filter(r => r.visited)
    : filter === 'saved' ? restaurants.filter(r => !r.visited)
    : restaurants.filter(r => r.city_id === filter);

  const totalVisited = restaurants.filter(r => r.visited).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: F }}>{restaurants.length} places · {totalVisited} visited</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ id: 'all', label: 'All' }, { id: 'saved', label: 'Saved' }, { id: 'visited', label: 'Visited' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: filter === f.id ? 600 : 400, border: filter === f.id ? '1.5px solid #C45B28' : '1.5px solid var(--border)', background: filter === f.id ? '#C45B2812' : 'transparent', color: filter === f.id ? '#C45B28' : 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {cities.map(city => {
          const cityRests = filtered.filter(r => r.city_id === city.id);
          if (!cityRests.length) return null;
          return (
            <div key={city.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span>{city.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: city.color, fontFamily: F }}>{city.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F }}>({cityRests.length})</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {cityRests.map(r => (
                  <div key={r.id} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${r.visited ? city.color + '30' : 'var(--border)'}`, opacity: r.visited ? 0.8 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div onClick={() => update(r.id, { visited: !r.visited })} style={{ width: 22, height: 22, borderRadius: 6, cursor: 'pointer', flexShrink: 0, border: r.visited ? 'none' : '1.5px solid #C4B8A8', background: r.visited ? `linear-gradient(135deg,${city.color},${city.accent})` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{r.visited && '✓'}</div>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: PF, textDecoration: r.visited ? 'line-through' : 'none' }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: city.color, fontWeight: 600, fontFamily: F }}>{r.price_range}</span>
                      <button onClick={() => remove(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 16, padding: 0 }}>×</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 32 }}>
                      {r.cuisine && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: `${city.color}10`, color: city.color, fontWeight: 500, fontFamily: F }}>{r.cuisine}</span>}
                      {r.address && <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: F }}>{r.address}</span>}
                      <StarRating rating={r.rating || 0} onRate={(n) => update(r.id, { rating: n })} size={13} />
                      {r.maps_url && <a href={r.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#1A5276', fontWeight: 600, textDecoration: 'none', fontFamily: F }}>Map →</a>}
                    </div>
                    {r.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, marginLeft: 32, fontFamily: F }}>{r.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid #C45B2840' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: PF }}>Add a Place</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>City</div>
              <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} style={inputSt}>{cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Name</div>
              <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Trattoria da Mario" style={inputSt} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Cuisine</div>
              <select value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} style={inputSt}><option value="">Select...</option>{CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Price Range</div>
              <div style={{ display: 'flex', gap: 4 }}>{PRICE_RANGES.map(p => (
                <div key={p} onClick={() => setForm(f => ({ ...f, price_range: p }))} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: F, border: form.price_range === p ? '1.5px solid #C45B28' : '1.5px solid var(--border)', background: form.price_range === p ? '#C45B2812' : 'transparent', color: form.price_range === p ? '#C45B28' : 'var(--text-muted)' }}>{p}</div>
              ))}</div></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Address</div>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Near the Duomo" style={inputSt} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Google Maps URL</div>
              <input value={form.maps_url} onChange={e => setForm(f => ({ ...f, maps_url: e.target.value }))} placeholder="https://maps.google.com/..." style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Notes</div>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Recommended by..." style={inputSt} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={!form.name.trim()} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: form.name.trim() ? 'linear-gradient(135deg,#C45B28,#D4753E)' : '#E8E0D4', color: form.name.trim() ? 'white' : '#B0A090', fontSize: 13, fontWeight: 600, cursor: form.name.trim() ? 'pointer' : 'default', fontFamily: F }}>Save Place</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setAdding(true)} style={{ background: 'transparent', borderRadius: 14, padding: '28px 24px', border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#C45B2810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽️</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', fontFamily: F }}>Add a Restaurant or Cafe</span>
        </div>
      )}
    </div>
  );
}
