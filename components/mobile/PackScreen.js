'use client';
import { useState, useRef, useEffect } from 'react';
import { TOKENS } from './tokens';
import { ITSurface, IconCheck, IconPlus } from './ui';

function AddInput({ placeholder, value, onChange, onSubmit, onCancel, autoFocus, compact }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);

  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 8,
      padding: compact ? '8px 10px' : '12px 14px',
      borderRadius: compact ? 12 : 16,
      border: compact ? 'none' : `1.5px solid ${TOKENS.accent}`,
      background: compact ? '#fff' : TOKENS.paper,
    }}>
      <input
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={(e)=>onChange(e.target.value)}
        onKeyDown={(e)=>{
          if (e.key === 'Enter') { e.preventDefault(); if ((value||'').trim()) onSubmit(); else onCancel && onCancel(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel && onCancel(); }
        }}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.ink,
          padding: '4px 0',
        }}
      />
      <button onClick={()=>{ if ((value||'').trim()) onSubmit(); else onCancel && onCancel(); }} className="it-btn it-press" style={{
        padding: '6px 12px', borderRadius: 999, background: TOKENS.accent, color: '#fff',
        fontSize: 12, fontWeight: 600, border: 'none', flexShrink: 0,
      }}>Add</button>
      <button onClick={onCancel} className="it-btn it-press" style={{
        padding: '6px 10px', borderRadius: 999, background: 'transparent', color: TOKENS.inkMuted,
        fontSize: 12, border: 'none', flexShrink: 0,
      }}>Cancel</button>
    </div>
  );
}

function PackCategory({ cat, editMode, trip }) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');

  const catItems = cat.items;
  const catDone = catItems.filter(x => x.done).length;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', padding: '0 4px 10px', gap: 8 }}>
        <div style={{ fontFamily: TOKENS.display, fontSize: 22, letterSpacing: -0.3, display:'flex', alignItems:'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
          {editMode && (
            <button onClick={()=>trip.mutators.removePackCategory(cat.id)} className="it-btn it-press" style={{
              width: 22, height: 22, borderRadius: 11, background: 'transparent',
              border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0,
            }} title="Delete category">×</button>
          )}
        </div>
        <div style={{ fontSize: 11, color: TOKENS.inkMuted, fontFamily: TOKENS.mono, flexShrink: 0 }}>{catDone}/{catItems.length}</div>
      </div>
      <div style={{
        borderRadius: 20, background: '#fff', border: `1px solid ${TOKENS.line}`, overflow: 'hidden',
      }}>
        {catItems.length === 0 && !adding && (
          <div style={{ padding: '16px', fontSize: 12.5, color: TOKENS.inkMuted, textAlign: 'center', fontStyle: 'italic' }}>
            Nothing here yet
          </div>
        )}
        {catItems.map((it, i) => {
          const last = i === catItems.length - 1 && !adding;
          return (
            <div key={it.id} className="it-press" style={{
              display:'flex', alignItems:'center', gap: 12, padding: '14px 16px',
              borderBottom: !last ? `1px solid ${TOKENS.line}` : 'none',
            }}>
              <div onClick={()=>!editMode && trip.mutators.togglePackItem(it.id, it.done)} style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0, cursor: editMode ? 'default' : 'pointer',
                border: `1.5px solid ${it.done ? TOKENS.accent : TOKENS.line}`,
                background: it.done ? TOKENS.accent : 'transparent',
                color: '#fff', display:'flex', alignItems:'center', justifyContent:'center',
                opacity: editMode ? 0.4 : 1,
              }}>{it.done && <IconCheck/>}</div>
              <div onClick={()=>!editMode && trip.mutators.togglePackItem(it.id, it.done)} style={{
                flex: 1, fontSize: 14, cursor: editMode ? 'default' : 'pointer',
                textDecoration: it.done ? 'line-through' : 'none',
                color: it.done ? TOKENS.inkMuted : TOKENS.ink, minWidth: 0,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{it.name}</div>
              {editMode && (
                <button onClick={()=>trip.mutators.removePackItem(it.id)} className="it-btn it-press" style={{
                  width: 28, height: 28, borderRadius: 14, background: TOKENS.accentDim,
                  border: 'none', color: TOKENS.accent, flexShrink: 0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 16, lineHeight: 1, padding: 0,
                }} title="Remove">×</button>
              )}
            </div>
          );
        })}

        {adding && (
          <div style={{ padding: '10px 12px', borderTop: catItems.length ? `1px solid ${TOKENS.line}` : 'none', background: TOKENS.paperDeep }}>
            <AddInput
              placeholder="What else?"
              value={input}
              onChange={setInput}
              onSubmit={() => {
                trip.mutators.addPackItem(cat.id, input);
                setInput('');
              }}
              onCancel={() => { setInput(''); setAdding(false); }}
              autoFocus
              compact
            />
          </div>
        )}

        {!adding && (
          <button onClick={()=>setAdding(true)} className="it-btn it-press" style={{
            width: '100%', display:'flex', alignItems:'center', gap: 10,
            padding: '12px 16px', background: 'transparent',
            borderTop: catItems.length ? `1px solid ${TOKENS.line}` : 'none', border: 'none',
            color: TOKENS.inkMuted, fontSize: 13, textAlign: 'left',
          }}>
            <div style={{ width: 18, height: 18, display:'flex', alignItems:'center', justifyContent:'center', color: TOKENS.inkMuted }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span>Add item</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function PackScreen({ trip }) {
  const [editMode, setEditMode] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const all = trip.packList.flatMap(c => c.items);
  const doneCount = all.filter(x => x.done).length;
  const pct = all.length ? Math.round(doneCount / all.length * 100) : 0;

  return (
    <ITSurface>
      <div className="it-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform:'uppercase', color: TOKENS.accent, fontWeight: 700 }}>
                Before you fly
              </div>
              <div style={{ fontFamily: TOKENS.display, fontSize: 38, lineHeight: 1, letterSpacing: -0.6, marginTop: 6 }}>
                The Packing List
              </div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginTop: 6 }}>
                {doneCount} of {all.length} packed · {pct}% ready
              </div>
            </div>
            <button onClick={()=>setEditMode(v=>!v)} className="it-btn it-press" style={{
              padding: '8px 14px', borderRadius: 999, flexShrink: 0, marginTop: 4,
              background: editMode ? TOKENS.ink : 'transparent',
              color: editMode ? TOKENS.paper : TOKENS.ink,
              border: `1px solid ${editMode ? TOKENS.ink : TOKENS.line}`,
              fontSize: 12, fontWeight: 500,
            }}>{editMode ? 'Done' : 'Edit'}</button>
          </div>

          <div style={{ marginTop: 18, height: 10, borderRadius: 5, background: TOKENS.paperDeep, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${pct}%`, height: '100%', background: TOKENS.accent,
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}/>
          </div>
        </div>

        <div style={{ padding: '20px 16px 0' }}>
          {trip.packList.map(cat => (
            <PackCategory key={cat.id} cat={cat} editMode={editMode} trip={trip}/>
          ))}

          {editMode && (
            showNewCat ? (
              <AddInput
                placeholder="Category name…"
                value={newCatInput}
                onChange={setNewCatInput}
                onSubmit={() => {
                  trip.mutators.addPackCategory(newCatInput);
                  setNewCatInput('');
                  setShowNewCat(false);
                }}
                onCancel={() => { setNewCatInput(''); setShowNewCat(false); }}
                autoFocus
              />
            ) : (
              <button onClick={()=>setShowNewCat(true)} className="it-btn it-press" style={{
                display:'flex', alignItems:'center', gap: 10, width: '100%',
                padding: '14px 16px', borderRadius: 16,
                border: `1.5px dashed ${TOKENS.line}`, background: 'transparent',
                color: TOKENS.inkSoft, fontSize: 13, marginBottom: 8,
              }}>
                <IconPlus/>
                <div>Add a category</div>
              </button>
            )
          )}
        </div>

        <div style={{ textAlign:'center', marginTop: 14, fontFamily: TOKENS.hand, fontSize: 18, color: TOKENS.inkSoft }}>
          — passport? check. —
        </div>
      </div>
    </ITSurface>
  );
}
