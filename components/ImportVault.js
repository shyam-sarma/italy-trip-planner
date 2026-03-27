'use client';
import { useState, useRef } from 'react';
import { useTable } from '../lib/hooks';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const inputSt = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 13, fontFamily: F, color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' };

const CATEGORIES = [
  { id: 'booking', label: 'Booking', emoji: '🎫' },
  { id: 'ticket', label: 'Ticket', emoji: '🎟️' },
  { id: 'passport', label: 'Passport', emoji: '🛂' },
  { id: 'insurance', label: 'Insurance', emoji: '🛡️' },
  { id: 'receipt', label: 'Receipt', emoji: '🧾' },
  { id: 'other', label: 'Other', emoji: '📄' },
];

const TYPE_BADGES = {
  flight: { emoji: '✈️', label: 'Flight', color: '#2C3E50' },
  hotel: { emoji: '🏨', label: 'Hotel', color: '#2E7D6F' },
  transport: { emoji: '🚆', label: 'Transport', color: '#1A5276' },
};

function matchCity(name, cities) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  return cities.find(c =>
    c.id === lower ||
    c.name.toLowerCase() === lower ||
    c.name.toLowerCase().includes(lower) ||
    lower.includes(c.name.toLowerCase())
  ) || null;
}

// ─── AI Parser Section ───
function BookingParser({ cities, stayActions, flights, updateFlights }) {
  const transportTable = useTable('transports', { orderBy: 'sort_order' });
  const flightLegsTable = useTable('flight_legs', { orderBy: 'leg_order' });
  const docTable = useTable('documents', { orderBy: 'created_at' });

  const [text, setText] = useState('');
  const [imageData, setImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [cityOverrides, setCityOverrides] = useState({});
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }
    setFileName(file.name);

    // Text files: read as text and populate the text area
    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => { setText(prev => prev ? prev + '\n\n' + reader.result : reader.result); };
      reader.readAsText(file);
      return;
    }

    // PDFs: read as base64 and send via Files API
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          setPdfData(match[2]);
          setImagePreview(null);
          setImageData(null);
          setMediaType(null);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Images: existing base64 flow
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      setPdfData(null);
      setFileName(null);
      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        setMediaType(match[1]);
        setImageData(match[2]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!text.trim() && !imageData && !pdfData) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSaved(false);

    try {
      const res = await fetch('/api/parse-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || undefined,
          image: imageData || undefined,
          mediaType: mediaType || undefined,
          pdf: pdfData || undefined,
          fileName: fileName || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Parsing failed.');
      } else {
        setResults(json.results);
        // Auto-match cities
        const overrides = {};
        json.results.forEach((r, i) => {
          if (r.type === 'hotel' && r.data?.city_name) {
            const match = matchCity(r.data.city_name, cities);
            if (match) overrides[`${i}-city`] = match.id;
          }
          if (r.type === 'transport') {
            const from = matchCity(r.data?.from_city, cities);
            const to = matchCity(r.data?.to_city, cities);
            if (from) overrides[`${i}-from`] = from.id;
            if (to) overrides[`${i}-to`] = to.id;
          }
        });
        setCityOverrides(overrides);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const d = r.data || {};

      if (r.type === 'flight') {
        // Update singleton for backward compat
        const updates = {};
        if (d.depart_date) updates.depart_date = d.depart_date;
        if (d.depart_time) updates.depart_time = d.depart_time;
        if (d.return_date) updates.return_date = d.return_date;
        if (d.return_time) updates.return_time = d.return_time;
        if (Object.keys(updates).length > 0) await updateFlights(updates);

        // Insert flight legs if parsed
        if (d.legs && Array.isArray(d.legs)) {
          for (const leg of d.legs) {
            await flightLegsTable.insert({ id: uid(), ...leg });
          }
        }
      }

      if (r.type === 'hotel') {
        const cityId = cityOverrides[`${i}-city`] || '';
        await stayActions.insert({
          id: uid(),
          city_id: cityId,
          name: d.name || 'Unnamed Stay',
          address: d.address || '',
          checkin: d.checkin || '',
          checkin_time: d.checkin_time || '15:00',
          checkout: d.checkout || '',
          checkout_time: d.checkout_time || '11:00',
          confirm_num: d.confirm_num || '',
          cost: d.cost || 0,
          notes: d.notes || '',
          add_to_budget: true,
        });
      }

      if (r.type === 'transport') {
        await transportTable.insert({
          id: uid(),
          from_city_id: cityOverrides[`${i}-from`] || '',
          to_city_id: cityOverrides[`${i}-to`] || '',
          type: d.transport_type || 'train',
          departure_date: d.departure_date || '',
          departure_time: d.departure_time || '',
          arrival_time: d.arrival_time || '',
          booking_ref: d.booking_ref || '',
          platform: d.platform || '',
          cost: d.cost || 0,
          notes: d.notes || '',
          sort_order: transportTable.data.length,
        });
      }
    }

    // Save to document vault
    await docTable.insert({
      id: uid(),
      city_id: cityOverrides['0-city'] || cityOverrides['0-from'] || '',
      title: results.map(r => TYPE_BADGES[r.type]?.label || 'Booking').join(' + ') + ' — ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      category: 'booking',
      content: text,
      image_url: imagePreview || '',
      parsed_type: results.map(r => r.type).join(','),
      parsed_data: results,
    });

    setSaved(true);
  };

  const handleReset = () => {
    setText('');
    setImageData(null);
    setImagePreview(null);
    setMediaType(null);
    setPdfData(null);
    setFileName(null);
    setResults(null);
    setError(null);
    setCityOverrides({});
    setSaved(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>Smart Import</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>Paste a booking confirmation or drop a screenshot — AI extracts the details</div>
        </div>
      </div>

      {saved ? (
        <div style={{ background: '#2E7D6F15', borderRadius: 14, padding: 24, border: '1.5px solid #2E7D6F30', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2E7D6F', fontFamily: PF, marginBottom: 4 }}>Saved Successfully!</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: F, marginBottom: 16 }}>
            {results?.map(r => TYPE_BADGES[r.type]?.label).join(' + ')} added to your trip planner.
          </div>
          <button onClick={handleReset} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C45B28,#D4753E)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Import Another</button>
        </div>
      ) : results ? (
        <div>
          {results.map((r, i) => {
            const badge = TYPE_BADGES[r.type] || { emoji: '📄', label: 'Unknown', color: '#8B7355' };
            return (
              <div key={i} style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: `1.5px solid ${badge.color}30`, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{badge.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: badge.color, padding: '3px 10px', borderRadius: 6, background: `${badge.color}12`, fontFamily: F }}>{badge.label} Detected</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {r.type === 'flight' && <>
                    <Field label="Departure Date" value={r.data?.depart_date} />
                    <Field label="Departure Time" value={r.data?.depart_time} />
                    <Field label="Return Date" value={r.data?.return_date} />
                    <Field label="Return Time" value={r.data?.return_time} />
                  </>}

                  {r.type === 'hotel' && <>
                    <Field label="Hotel Name" value={r.data?.name} span={2} />
                    <Field label="Address" value={r.data?.address} span={2} />
                    <Field label="Check-in" value={r.data?.checkin} />
                    <Field label="Check-in Time" value={r.data?.checkin_time} />
                    <Field label="Check-out" value={r.data?.checkout} />
                    <Field label="Check-out Time" value={r.data?.checkout_time} />
                    <Field label="Confirmation #" value={r.data?.confirm_num} />
                    <Field label="Cost" value={r.data?.cost ? `${r.data.cost} ${r.data.currency || ''}` : null} />
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>City</div>
                      <select value={cityOverrides[`${i}-city`] || ''} onChange={e => setCityOverrides(p => ({ ...p, [`${i}-city`]: e.target.value }))} style={inputSt}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                      </select>
                    </div>
                  </>}

                  {r.type === 'transport' && <>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>From</div>
                      <select value={cityOverrides[`${i}-from`] || ''} onChange={e => setCityOverrides(p => ({ ...p, [`${i}-from`]: e.target.value }))} style={inputSt}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>To</div>
                      <select value={cityOverrides[`${i}-to`] || ''} onChange={e => setCityOverrides(p => ({ ...p, [`${i}-to`]: e.target.value }))} style={inputSt}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                      </select>
                    </div>
                    <Field label="Type" value={r.data?.transport_type} />
                    <Field label="Date" value={r.data?.departure_date} />
                    <Field label="Depart Time" value={r.data?.departure_time} />
                    <Field label="Arrive Time" value={r.data?.arrival_time} />
                    <Field label="Booking Ref" value={r.data?.booking_ref} />
                    <Field label="Platform" value={r.data?.platform} />
                    <Field label="Cost" value={r.data?.cost ? `${r.data.cost} ${r.data.currency || ''}` : null} />
                  </>}
                </div>

                {r.data?.notes && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8, fontFamily: F }}>{r.data.notes}</div>}
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D6F,#A8D5BA)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>✓ Confirm & Save</button>
            <button onClick={handleReset} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Start Over</button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid var(--border)' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"Paste your booking confirmation here...\n\nExamples:\n• Flight confirmation email\n• Hotel reservation details\n• Train/bus ticket\n• Airbnb booking\n\nOr upload a PDF, screenshot, or text file using the button below."}
            style={{ ...inputSt, minHeight: 140, resize: 'vertical', fontFamily: F, lineHeight: 1.6 }}
          />

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 6 }}>
              📎 Upload File
            </button>
            {imagePreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={imagePreview} alt="Preview" style={{ height: 40, borderRadius: 6, border: '1px solid var(--border)' }} />
                <button onClick={() => { setImageData(null); setImagePreview(null); setMediaType(null); if (fileRef.current) fileRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 16 }}>×</button>
              </div>
            )}
            {pdfData && fileName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: F, fontWeight: 500 }}>{fileName}</span>
                <button onClick={() => { setPdfData(null); setFileName(null); if (fileRef.current) fileRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 16 }}>×</button>
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#FDEDEC', border: '1px solid #E74C3C30', fontSize: 13, color: '#C0392B', fontFamily: F }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleParse} disabled={loading || (!text.trim() && !imageData && !pdfData)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: (text.trim() || imageData || pdfData) && !loading ? 'linear-gradient(135deg,#C45B28,#D4753E)' : '#E8E0D4', color: (text.trim() || imageData || pdfData) && !loading ? 'white' : '#B0A090', fontSize: 14, fontWeight: 600, cursor: (text.trim() || imageData || pdfData) && !loading ? 'pointer' : 'default', fontFamily: F }}>
              {loading ? '⏳ Parsing...' : '🤖 Parse & Import'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, span = 1 }) {
  if (!value && value !== 0) return <div style={{ gridColumn: span > 1 ? `span ${span}` : undefined }} />;
  return (
    <div style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2, fontFamily: F }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text)', fontFamily: F, fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}

// ─── Document Vault Section ───
function DocumentVault({ cities }) {
  const { data: docs, insert, remove } = useTable('documents', { orderBy: 'created_at' });
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'other', city_id: '', content: '', image_url: '' });
  const [expanded, setExpanded] = useState(null);
  const fileRef = useRef(null);

  const filtered = filter === 'all' ? docs : docs.filter(d => d.category === filter);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await insert({ id: uid(), ...form });
    setForm({ title: '', category: 'other', city_id: '', content: '', image_url: '' });
    setAdding(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>📁</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>Document Vault</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>{docs.length} document{docs.length !== 1 ? 's' : ''} stored</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: filter === 'all' ? 600 : 400, border: filter === 'all' ? '1.5px solid #C45B28' : '1.5px solid var(--border)', background: filter === 'all' ? '#C45B2812' : 'transparent', color: filter === 'all' ? '#C45B28' : 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: filter === c.id ? 600 : 400, border: filter === c.id ? '1.5px solid #C45B28' : '1.5px solid var(--border)', background: filter === c.id ? '#C45B2812' : 'transparent', color: filter === c.id ? '#C45B28' : 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>{c.emoji} {c.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {filtered.map(doc => {
          const city = cities.find(c => c.id === doc.city_id);
          const cat = CATEGORIES.find(c => c.id === doc.category) || CATEGORIES[5];
          const isOpen = expanded === doc.id;
          return (
            <div key={doc.id} style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : doc.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', fontFamily: F }}>{doc.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    {city && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `${city.color}10`, color: city.color, fontWeight: 500, fontFamily: F }}>{city.emoji} {city.name}</span>}
                    {doc.parsed_type && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#C45B2810', color: '#C45B28', fontWeight: 500, fontFamily: F }}>AI parsed</span>}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: F }}>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); remove(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4B8A8', fontSize: 16, padding: '0 4px' }}>×</button>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)', fontSize: 14 }}>▾</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 16px 14px', animation: 'fadeSlide 0.2s ease' }}>
                  {doc.image_url && (
                    <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', maxHeight: 300 }}>
                      <img src={doc.image_url} alt={doc.title} style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain' }} />
                    </div>
                  )}
                  {doc.content && (
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: F, lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '10px 12px', background: 'var(--subtle-bg)', borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
                      {doc.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13, fontFamily: F }}>No documents yet. Import a booking above or add one manually.</div>
        )}
      </div>

      {adding ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid #C45B2840' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: PF }}>Add Document</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Title</div>
              <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Vatican Tickets" style={inputSt} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Category</div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputSt}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>City (optional)</div>
            <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} style={inputSt}>
              <option value="">None</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontFamily: F }}>Notes / Content</div>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste confirmation text, notes, etc." style={{ ...inputSt, minHeight: 80, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: F }}>📎 Attach File</button>
            {form.image_url && <img src={form.image_url} alt="Preview" style={{ height: 50, borderRadius: 6, marginLeft: 10, border: '1px solid var(--border)' }} />}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={!form.title.trim()} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: form.title.trim() ? 'linear-gradient(135deg,#C45B28,#D4753E)' : '#E8E0D4', color: form.title.trim() ? 'white' : '#B0A090', fontSize: 13, fontWeight: 600, cursor: form.title.trim() ? 'pointer' : 'default', fontFamily: F }}>Save Document</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setAdding(true)} style={{ background: 'transparent', borderRadius: 14, padding: '20px 24px', border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C45B2810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: F }}>Add Document Manually</span>
        </div>
      )}
    </div>
  );
}

// ─── Combined Export ───
export default function ImportVault({ cities, stayActions, flights, updateFlights }) {
  return (
    <div>
      <BookingParser cities={cities} stayActions={stayActions} flights={flights} updateFlights={updateFlights} />
      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 28px', opacity: 0.5 }} />
      <DocumentVault cities={cities} />
    </div>
  );
}
