'use client';
import { useState } from 'react';
import { useTable } from '../lib/hooks';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (s) => { if (!s) return ''; return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };

const inputSt = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 13, fontFamily: F, color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' };

export default function PhotoJournal({ cities }) {
  const { data: photos, insert, remove } = useTable('photos', { orderBy: 'created_at' });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ city_id: cities[0]?.id || '', caption: '', url: '' });
  const [viewCity, setViewCity] = useState('all');

  const handleAdd = async () => {
    if (!form.url.trim() && !form.caption.trim()) return;
    await insert({ id: uid(), ...form });
    setForm({ city_id: cities[0]?.id || '', caption: '', url: '' });
    setAdding(false);
  };

  const filtered = viewCity === 'all' ? photos : photos.filter(p => p.city_id === viewCity);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: F }}>{photos.length} memories</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setViewCity('all')} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: viewCity === 'all' ? 600 : 400, border: viewCity === 'all' ? '1.5px solid #C45B28' : '1.5px solid var(--border)', background: viewCity === 'all' ? '#C45B2812' : 'transparent', color: viewCity === 'all' ? '#C45B28' : 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>All</button>
          {cities.map(c => (
            <button key={c.id} onClick={() => setViewCity(c.id)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: viewCity === c.id ? 600 : 400, border: viewCity === c.id ? `1.5px solid ${c.color}` : '1.5px solid var(--border)', background: viewCity === c.id ? `${c.color}12` : 'transparent', color: viewCity === c.id ? c.color : 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>{c.emoji}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240, 1fr))', gap: 14, marginBottom: 20 }}>
        {filtered.map(photo => {
          const city = cities.find(c => c.id === photo.city_id);
          return (
            <div key={photo.id} style={{ background: 'var(--card-bg)', borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
              {photo.url && (
                <div style={{ width: '100%', height: 180, background: '#E8E0D4', overflow: 'hidden' }}>
                  <img src={photo.url} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  {city && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: `${city.color}10`, color: city.color, fontWeight: 600, fontFamily: F }}>{city.emoji} {city.name}</span>}
                  <button onClick={() => remove(photo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 14 }}>×</button>
                </div>
                {photo.caption && <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: F, marginTop: 4 }}>{photo.caption}</div>}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: F, marginTop: 4 }}>{new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid #C45B2840' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: PF }}>Add a Memory</div>
          <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>City</div>
              <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} style={inputSt}>{cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Image URL</div>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="Paste an image URL..." style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Caption</div>
              <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Sunset over the Colosseum..." style={inputSt} /></div>
          </div>
          {form.url && (
            <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', maxHeight: 200 }}>
              <img src={form.url} alt="Preview" style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={!form.url.trim() && !form.caption.trim()} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: (form.url.trim() || form.caption.trim()) ? 'linear-gradient(135deg,#C45B28,#D4753E)' : '#E8E0D4', color: (form.url.trim() || form.caption.trim()) ? 'white' : '#B0A090', fontSize: 13, fontWeight: 600, cursor: (form.url.trim() || form.caption.trim()) ? 'pointer' : 'default', fontFamily: F }}>Save Memory</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setAdding(true)} style={{ background: 'transparent', borderRadius: 14, padding: '28px 24px', border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#C45B2810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📸</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', fontFamily: F }}>Add a Photo Memory</span>
        </div>
      )}
    </div>
  );
}
