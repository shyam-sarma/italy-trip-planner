'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTable, useSingleton } from '../lib/hooks';
import { supabase } from '../lib/supabase';
import CountdownTimer from './CountdownTimer';
import TransportPlanner from './TransportPlanner';
import CurrencyConverter from './CurrencyConverter';
import RestaurantBookmarks from './RestaurantBookmarks';
import MapView from './MapView';
import PhotoJournal from './PhotoJournal';
import PhraseBook from './PhraseBook';
import ImportVault from './ImportVault';
import FlightCard from './FlightCard';
import FlightEditModal from './FlightEditModal';

// ─── Constants ───
const COLOR_PRESETS = [
  { color:"#C45B28",accent:"#E8A87C" },{ color:"#2E7D6F",accent:"#A8D5BA" },{ color:"#8B4513",accent:"#D4A574" },
  { color:"#1A5276",accent:"#85C1E9" },{ color:"#2C3E50",accent:"#95A5A6" },{ color:"#6C3483",accent:"#C39BD3" },
  { color:"#B9442C",accent:"#F1948A" },{ color:"#1E8449",accent:"#82E0AA" },{ color:"#B7950B",accent:"#F7DC6F" },{ color:"#2874A6",accent:"#7FB3D8" },
];
const EMOJI_OPTIONS = ["🏙️","🏖️","🏔️","🌊","🏛️","🎭","🌴","⛩️","🕌","🗼","🌋","🏰","🎨","🍷","☀️","🚂"];

// ─── Icons ───
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PlusIcon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const WarnIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const HotelIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M14 11h4M6 15h4M14 15h4M10 21V7l2-4 2 4v14"/></svg>;
const PlanIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PackIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const NotesIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const BudgetIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;

// ─── Helpers ───
const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const getDayCount = (a, d) => { if (!a||!d) return 0; const x=new Date(a),y=new Date(d); return isNaN(x)||isNaN(y)?0:Math.max(0,Math.round((y-x)/864e5)); };
const fmtDate = (s) => { if(!s)return""; return new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtWeekday = (s,off) => { if(!s)return""; const d=new Date(s+"T12:00:00"); d.setDate(d.getDate()+off); return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const toD = (s) => s ? new Date(s+"T12:00:00") : null;
const inputSt = { padding:"6px 10px",borderRadius:8,border:"1.5px solid #E8E0D4",background:"#FDFAF6",fontSize:12.5,fontFamily:F,color:"#4A3728",outline:"none" };

// ─── Warnings Engine ───
function computeWarnings(flights, cities, stays) {
  const w = [];
  if (!flights) return w;
  const depDate=toD(flights.depart_date), retDate=toD(flights.return_date);
  const tripDays = depDate&&retDate ? getDayCount(flights.depart_date,flights.return_date) : null;

  cities.forEach(c => {
    const ca=toD(c.arrive),cd=toD(c.depart);
    if(ca&&depDate&&ca<depDate) w.push({type:"error",msg:`${c.emoji} ${c.name} arrival (${fmtDate(c.arrive)}) is before Toronto departure (${fmtDate(flights.depart_date)})`});
    if(cd&&retDate&&cd>retDate) w.push({type:"error",msg:`${c.emoji} ${c.name} departure (${fmtDate(c.depart)}) is after return flight (${fmtDate(flights.return_date)})`});
    if(ca&&cd&&cd<ca) w.push({type:"error",msg:`${c.emoji} ${c.name} departure is before arrival — dates may be swapped`});
  });

  for(let i=0;i<cities.length-1;i++){
    const curr=cities[i],next=cities[i+1];
    const cd=toD(curr.depart),na=toD(next.arrive);
    if(cd&&na){
      if(na<cd) w.push({type:"error",msg:`Overlap: ${curr.emoji} ${curr.name} departs ${fmtDate(curr.depart)} but ${next.emoji} ${next.name} arrives ${fmtDate(next.arrive)}`});
      else if(curr.depart===next.arrive) w.push({type:"warn",msg:`Same-day transition: ${curr.emoji} ${curr.name} → ${next.emoji} ${next.name} on ${fmtDate(curr.depart)} — make sure transit is planned`});
      else { const diff=getDayCount(curr.depart,next.arrive); if(diff>1) w.push({type:"info",msg:`${diff} unplanned day${diff>1?"s":""} between ${curr.emoji} ${curr.name} and ${next.emoji} ${next.name}`}); }
    }
  }

  for(let i=0;i<cities.length-1;i++){
    const ca=toD(cities[i].arrive),na=toD(cities[i+1].arrive);
    if(ca&&na&&na<ca) w.push({type:"warn",msg:`Date order mismatch: ${cities[i+1].emoji} ${cities[i+1].name} dates come before ${cities[i].emoji} ${cities[i].name}`});
  }

  const totalNights=cities.reduce((s,c)=>s+getDayCount(c.arrive,c.depart),0);
  if(tripDays!==null&&totalNights>0&&totalNights>tripDays) w.push({type:"error",msg:`Overplanned: ${totalNights} nights but trip is ${tripDays} days`});

  cities.forEach(c => {
    const cityStays = stays.filter(s=>s.city_id===c.id);
    cityStays.forEach(st => {
      const co=toD(st.checkout),cd=toD(c.depart),ci=toD(st.checkin),ca=toD(c.arrive);
      if(co&&cd&&co>cd) w.push({type:"warn",msg:`${c.emoji} ${c.name}: "${st.name}" checkout after city departure`});
      if(ci&&ca&&ci<ca) w.push({type:"warn",msg:`${c.emoji} ${c.name}: "${st.name}" check-in before city arrival`});
    });
  });

  if(cities.length>0){
    const last=cities[cities.length-1]; const ld=toD(last.depart);
    if(ld&&retDate&&retDate<ld) w.push({type:"error",msg:`Return flight before leaving ${last.emoji} ${last.name}`});
  }
  return w;
}

// FlightBar removed — replaced by FlightCard component

// ─── Warnings ───
function WarningsPanel({ warnings }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  if(!warnings.length) return null;

  const visible = warnings.filter((_,i) => !dismissed.includes(i));
  if(!visible.length) return null;

  const colors = { error:{bg:"#FDEDEC",border:"#E74C3C30",text:"#C0392B",icon:<WarnIcon/>,dot:"#E74C3C"}, warn:{bg:"#FEF9E7",border:"#F1C40F30",text:"#B7950B",icon:<WarnIcon/>,dot:"#F1C40F"}, info:{bg:"#EBF5FB",border:"#3498DB30",text:"#2874A6",icon:<InfoIcon/>,dot:"#3498DB"} };

  const counts = {};
  visible.forEach(w => { counts[w.type] = (counts[w.type] || 0) + 1; });
  const labels = { error:'error', warn:'warning', info:'info' };

  return (
    <div style={{ marginBottom:20 }}>
      <div onClick={() => setOpen(!open)} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"var(--card-bg)",border:"1px solid var(--border)",cursor:"pointer",userSelect:"none" }}>
        {Object.entries(counts).map(([type,count]) => (
          <span key={type} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12.5,fontWeight:600,color:colors[type]?.text||"var(--text-muted)",fontFamily:F }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:colors[type]?.dot||"#999" }}/>
            {count} {labels[type]||type}{count>1?'s':''}
          </span>
        ))}
        <span style={{ marginLeft:"auto",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",color:"var(--text-muted)",fontSize:14 }}>▾</span>
      </div>
      {open && (
        <div style={{ display:"grid",gap:8,marginTop:8,animation:"fadeSlide 0.2s ease" }}>
          {warnings.map((w,i)=>{ if(dismissed.includes(i)) return null; const s=colors[w.type]||colors.info; return (
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderRadius:10,background:s.bg,border:`1px solid ${s.border}` }}>
              <span style={{ color:s.text,marginTop:1,flexShrink:0 }}>{s.icon}</span>
              <span style={{ flex:1,fontSize:12.5,color:s.text,fontFamily:F,lineHeight:1.5 }}>{w.msg}</span>
              <button onClick={e => { e.stopPropagation(); setDismissed(d => [...d, i]); }} style={{ background:"none",border:"none",cursor:"pointer",color:s.text,opacity:0.5,fontSize:14,padding:"0 2px",flexShrink:0 }}>×</button>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

// ─── Timeline ───
function TimelineOverview({ cities }) {
  if(!cities.some(c=>c.arrive||c.depart)) return null;
  return (
    <div style={{ display:"flex",alignItems:"stretch",marginBottom:20,padding:"16px 20px",background:"#FDFAF6",borderRadius:14,border:"1px solid #E8E0D4",overflowX:"auto" }}>
      {cities.map((city,i)=>{
        const days=getDayCount(city.arrive,city.depart), has=city.arrive||city.depart;
        return (
          <div key={city.id} style={{ display:"flex",alignItems:"center",flex:has?1:0,minWidth:has?110:"auto" }}>
            <div style={{ textAlign:"center",flex:1 }}>
              <div style={{ fontSize:16,marginBottom:4 }}>{city.emoji}</div>
              <div style={{ fontSize:11.5,fontWeight:700,color:city.color,fontFamily:F }}>{city.name}</div>
              {city.arrive&&<div style={{ fontSize:10.5,color:"#8B7355",marginTop:3,fontFamily:F }}>{fmtDate(city.arrive)}{city.depart?` — ${fmtDate(city.depart)}`:""}</div>}
              {days>0&&<div style={{ fontSize:10,fontWeight:600,color:city.color,marginTop:4,padding:"2px 8px",borderRadius:6,background:`${city.color}10`,display:"inline-block",fontFamily:F }}>{days}N</div>}
            </div>
            {i<cities.length-1&&<div style={{ display:"flex",alignItems:"center",padding:"0 6px",flexShrink:0 }}><div style={{ width:20,height:1.5,background:"#D4C8B8" }}/><div style={{ width:0,height:0,borderTop:"4px solid transparent",borderBottom:"4px solid transparent",borderLeft:"6px solid #D4C8B8" }}/></div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Stays Section ───
function StaysSection({ city, stays, onAdd, onRemove }) {
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({ name:"",address:"",checkin:"",checkin_time:"15:00",checkout:"",checkout_time:"11:00",confirm_num:"",cost:"",notes:"",add_to_budget:true });
  const cityStays = stays.filter(s=>s.city_id===city.id);

  const handleAdd = async () => {
    if(!form.name.trim()) return;
    await onAdd({ id:uid(), city_id:city.id, ...form, cost:form.cost?Number(form.cost):0 });
    setForm({ name:"",address:"",checkin:city.arrive||"",checkin_time:"15:00",checkout:city.depart||"",checkout_time:"11:00",confirm_num:"",cost:"",notes:"",add_to_budget:true });
    setAdding(false);
  };

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}><HotelIcon/><span style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:city.color,fontFamily:F }}>Accommodation</span></div>
        {!adding&&<button onClick={()=>{setForm(f=>({...f,checkin:city.arrive||"",checkout:city.depart||""}));setAdding(true);}} style={{ fontSize:11,fontWeight:600,color:city.color,background:`${city.color}10`,border:`1px solid ${city.color}20`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:4 }}><PlusIcon size={10}/> Add Stay</button>}
      </div>
      {cityStays.map(st=>(
        <div key={st.id} style={{ background:"#FDFAF6",borderRadius:10,padding:"12px 14px",border:`1px solid ${city.color}15`,marginBottom:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
            <span style={{ fontSize:14,fontWeight:700,color:"#2C1810",fontFamily:PF,flex:1 }}>{st.name}</span>
            {st.cost>0&&<span style={{ fontSize:12,fontWeight:600,color:city.color,fontFamily:F }}>${Number(st.cost).toLocaleString()}</span>}
            <button onClick={()=>onRemove(st.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#C4B8A8",fontSize:14 }}>×</button>
          </div>
          {st.address&&<div style={{ fontSize:12,color:"#8B7355",marginBottom:4,fontFamily:F }}>{st.address}</div>}
          <div style={{ display:"flex",gap:16,flexWrap:"wrap",fontSize:11.5,color:"#8B7355",fontFamily:F }}>
            {st.checkin&&<span>Check-in: {fmtDate(st.checkin)} {st.checkin_time}</span>}
            {st.checkout&&<span>Check-out: {fmtDate(st.checkout)} {st.checkout_time}</span>}
            {st.confirm_num&&<span style={{ color:city.color,fontWeight:600 }}>Ref: {st.confirm_num}</span>}
          </div>
          {st.notes&&<div style={{ fontSize:12,color:"#5D4A3A",marginTop:6,padding:"6px 10px",background:`${city.color}06`,borderRadius:8,fontFamily:F }}>{st.notes}</div>}
        </div>
      ))}
      {adding&&(
        <div style={{ background:"#FDFAF6",borderRadius:12,padding:16,border:`1.5px solid ${city.color}30`,animation:"fadeSlide 0.2s ease" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Name</div><input autoFocus value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Hotel de Russie" style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Address</div><input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Near Piazza del Popolo" style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10 }}>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Check-in</div><input type="date" value={form.checkin} onChange={e=>setForm(f=>({...f,checkin:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Time</div><input type="time" value={form.checkin_time} onChange={e=>setForm(f=>({...f,checkin_time:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Check-out</div><input type="date" value={form.checkout} onChange={e=>setForm(f=>({...f,checkout:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Time</div><input type="time" value={form.checkout_time} onChange={e=>setForm(f=>({...f,checkout_time:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10 }}>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Confirmation #</div><input value={form.confirm_num} onChange={e=>setForm(f=>({...f,confirm_num:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Cost (CAD)</div><input type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} style={{...inputSt,width:"100%",boxSizing:"border-box"}}/></div>
            <div style={{ display:"flex",alignItems:"flex-end",paddingBottom:2 }}><label style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11.5,color:"#8B7355",fontFamily:F }}><input type="checkbox" checked={form.add_to_budget} onChange={e=>setForm(f=>({...f,add_to_budget:e.target.checked}))} style={{ accentColor:city.color }}/>Add to budget</label></div>
          </div>
          <div><div style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:4,fontFamily:F }}>Notes</div><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Breakfast included, ask for balcony" style={{...inputSt,width:"100%",boxSizing:"border-box",marginBottom:12}}/></div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handleAdd} disabled={!form.name.trim()} style={{ flex:1,padding:"8px 0",borderRadius:8,border:"none",background:form.name.trim()?`linear-gradient(135deg,${city.color},${city.accent})`:"#E8E0D4",color:form.name.trim()?"white":"#B0A090",fontSize:12,fontWeight:600,cursor:form.name.trim()?"pointer":"default",fontFamily:F }}>Save Stay</button>
            <button onClick={()=>setAdding(false)} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #E8E0D4",background:"transparent",color:"#8B7355",fontSize:12,cursor:"pointer",fontFamily:F }}>Cancel</button>
          </div>
        </div>
      )}
      {cityStays.length===0&&!adding&&<div style={{ padding:12,textAlign:"center",color:"#B0A090",fontSize:12,fontFamily:F,background:`${city.color}04`,borderRadius:8,border:`1px dashed ${city.color}20` }}>No accommodation added yet</div>}
    </div>
  );
}

// ─── Day Planner ───
function DayPlanner({ city, dayPlans, onAdd, onToggle, onRemove }) {
  const days=getDayCount(city.arrive,city.depart);
  const [newAct,setNewAct]=useState({});
  if(!city.arrive||!city.depart||days<=0) return <div style={{ padding:"16px 18px",background:`${city.color}06`,borderRadius:12,border:`1px dashed ${city.color}30`,textAlign:"center",color:"#8B7355",fontSize:13,fontFamily:F }}>Set arrive & depart dates to unlock the day planner</div>;
  const cityPlans = dayPlans.filter(p=>p.city_id===city.id);
  const add = async (d)=>{ const t=(newAct[d]||"").trim(); if(!t)return; await onAdd({id:uid(),city_id:city.id,day_index:d,text:t,done:false,sort_order:cityPlans.filter(p=>p.day_index===d).length}); setNewAct({...newAct,[d]:""}); };

  return (
    <div style={{ display:"grid",gap:10 }}>
      {Array.from({length:days},(_,i)=>{
        const label=fmtWeekday(city.arrive,i), items=cityPlans.filter(p=>p.day_index===i).sort((a,b)=>a.sort_order-b.sort_order);
        return (
          <div key={i} style={{ background:"#FDFAF6",borderRadius:12,border:`1px solid ${city.color}18`,overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:`${city.color}08`,borderBottom:`1px solid ${city.color}12` }}>
              <span style={{ width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${city.color},${city.accent})`,color:"white",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:13,fontWeight:600,color:"#2C1810",fontFamily:F }}>Day {i+1}</span>
              <span style={{ fontSize:12,color:"#8B7355",fontFamily:F }}>{label}</span>
              <span style={{ marginLeft:"auto",fontSize:11,color:"#B0A090",fontFamily:F }}>{items.length>0?`${items.filter(a=>a.done).length}/${items.length}`:""}</span>
            </div>
            <div style={{ padding:"8px 14px 10px" }}>
              {items.map(act=>(
                <div key={act.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0" }}>
                  <div onClick={()=>onToggle(act.id,!act.done)} style={{ width:18,height:18,borderRadius:5,flexShrink:0,cursor:"pointer",border:act.done?"none":"1.5px solid #C4B8A8",background:act.done?`linear-gradient(135deg,${city.color},${city.accent})`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"white" }}>{act.done&&<CheckIcon/>}</div>
                  <span style={{ flex:1,fontSize:13,fontFamily:F,color:act.done?"#B0A090":"#4A3728",textDecoration:act.done?"line-through":"none" }}>{act.text}</span>
                  <button onClick={()=>onRemove(act.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#C4B8A8",fontSize:14,padding:0 }}>×</button>
                </div>
              ))}
              <div style={{ display:"flex",gap:6,marginTop:items.length>0?6:0 }}>
                <input placeholder="+ Add activity..." value={newAct[i]||""} onChange={e=>setNewAct({...newAct,[i]:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")add(i);}} style={{ flex:1,padding:"7px 10px",borderRadius:8,fontSize:12.5,border:`1px solid ${city.color}18`,background:"transparent",fontFamily:F,color:"#4A3728",outline:"none" }}/>
                <button onClick={()=>add(i)} style={{ width:30,height:30,borderRadius:8,border:"none",background:`${city.color}15`,color:city.color,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><PlusIcon/></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── City Card ───
function CityCard({ city, isExpanded, onToggle, onUpdate, onDelete, stays, stayActions, dayPlans, dayPlanActions }) {
  const days=getDayCount(city.arrive,city.depart);
  const dd=city.arrive&&city.depart?`${fmtDate(city.arrive)} → ${fmtDate(city.depart)}${days>0?` · ${days} night${days>1?"s":""}`:""}`  :null;
  const [confirmDel,setConfirmDel]=useState(false);
  const stayCount=stays.filter(s=>s.city_id===city.id).length;

  return (
    <div style={{ background:isExpanded?`linear-gradient(135deg,${city.color}12,${city.color}08)`:"#FDFAF6",border:`1.5px solid ${isExpanded?city.color+"40":"#E8E0D4"}`,borderRadius:16,overflow:"hidden",transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
      <div style={{ padding:"18px 24px",display:"flex",alignItems:"center",gap:16,cursor:"pointer" }} onClick={onToggle}>
        <div style={{ width:48,height:48,borderRadius:12,background:`linear-gradient(135deg,${city.color},${city.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 4px 12px ${city.color}30` }}>{city.emoji}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap" }}>
            <span style={{ fontFamily:PF,fontSize:20,fontWeight:700,color:"#2C1810" }}>{city.name}</span>
            <span style={{ fontSize:12,color:city.color,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",fontFamily:F }}>{city.tagline}</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginTop:3 }}>
            {dd&&<span style={{ fontSize:12,color:"#8B7355",fontFamily:F }}>{dd}</span>}
            {stayCount>0&&<span style={{ fontSize:10.5,color:city.color,fontFamily:F,background:`${city.color}10`,padding:"2px 7px",borderRadius:6 }}>🏨 {stayCount}</span>}
          </div>
        </div>
        <button onClick={e=>{e.stopPropagation();setConfirmDel(true);}} style={{ width:28,height:28,borderRadius:8,border:"1px solid #E8E0D4",background:"transparent",color:"#C4B8A8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><TrashIcon/></button>
        <div style={{ width:28,height:28,borderRadius:8,border:`1.5px solid ${city.color}30`,display:"flex",alignItems:"center",justifyContent:"center",transform:isExpanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.3s ease",color:city.color,fontSize:14 }}>▾</div>
      </div>
      {confirmDel&&(
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 24px",background:"#C45B2810",borderTop:"1px solid #C45B2820" }} onClick={e=>e.stopPropagation()}>
          <span style={{ fontSize:13,color:"#C45B28",fontWeight:500,fontFamily:F }}>Remove {city.name}?</span>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>onDelete(city.id)} style={{ padding:"6px 14px",borderRadius:8,border:"none",background:"#C45B28",color:"white",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F }}>Remove</button>
            <button onClick={()=>setConfirmDel(false)} style={{ padding:"6px 14px",borderRadius:8,border:"1px solid #E8E0D4",background:"white",color:"#8B7355",fontSize:12,cursor:"pointer",fontFamily:F }}>Cancel</button>
          </div>
        </div>
      )}
      {isExpanded&&(
        <div style={{ padding:"0 24px 24px",animation:"fadeSlide 0.3s ease" }} onClick={e=>e.stopPropagation()}>
          <div style={{ display:"flex",gap:16,marginBottom:20,padding:"14px 16px",background:`${city.color}06`,borderRadius:12,border:`1px solid ${city.color}15`,flexWrap:"wrap",alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:city.color,fontFamily:F }}>Arrive</span>
              <input type="date" defaultValue={city.arrive} onBlur={e=>onUpdate(city.id,{arrive:e.target.value})} style={{...inputSt,borderColor:`${city.color}30`,width:135}}/>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:city.color,fontFamily:F }}>Depart</span>
              <input type="date" defaultValue={city.depart} onBlur={e=>onUpdate(city.id,{depart:e.target.value})} style={{...inputSt,borderColor:`${city.color}30`,width:135}}/>
            </div>
            {days>0&&<span style={{ fontSize:12,fontWeight:600,color:city.color,padding:"4px 10px",borderRadius:8,background:`${city.color}12`,fontFamily:F }}>{days} night{days>1?"s":""}</span>}
          </div>
          <StaysSection city={city} stays={stays} onAdd={stayActions.insert} onRemove={stayActions.remove}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:22 }}>
            <div>
              <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:city.color,marginBottom:10,fontFamily:F }}>Must See</div>
              {(city.must_see||[]).map((item,i)=><div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 0",fontSize:13.5,color:"#4A3728",fontFamily:F }}><span style={{ width:6,height:6,borderRadius:"50%",background:city.color,opacity:0.5,flexShrink:0 }}/>{item}</div>)}
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:city.color,marginBottom:10,fontFamily:F }}>Pro Tips</div>
              {(city.tips||[]).map((tip,i)=><div key={i} style={{ padding:"8px 12px",marginBottom:8,fontSize:13,color:"#5D4A3A",background:`${city.color}08`,borderRadius:10,borderLeft:`3px solid ${city.color}40`,lineHeight:1.5,fontFamily:F }}>{tip}</div>)}
            </div>
          </div>
          <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:city.color,marginBottom:10,fontFamily:F }}>Day-by-Day Plan</div>
          <DayPlanner city={city} dayPlans={dayPlans} onAdd={dayPlanActions.insert} onToggle={(id,done)=>dayPlanActions.update(id,{done})} onRemove={dayPlanActions.remove}/>
        </div>
      )}
    </div>
  );
}

// ─── Add City ───
function AddCityCard({ onAdd }) {
  const [isAdding,setIsAdding]=useState(false);
  const [form,setForm]=useState({name:"",emoji:"🏙️",tagline:"",colorIdx:0});
  const handleAdd=async()=>{if(!form.name.trim())return;const p=COLOR_PRESETS[form.colorIdx%COLOR_PRESETS.length];await onAdd({id:uid(),name:form.name.trim(),emoji:form.emoji,arrive:"",depart:"",color:p.color,accent:p.accent,tagline:form.tagline.trim()||"New destination",must_see:[],tips:[],sort_order:Date.now()});setForm({name:"",emoji:"🏙️",tagline:"",colorIdx:0});setIsAdding(false);};
  if(!isAdding) return <div onClick={()=>setIsAdding(true)} style={{ background:"transparent",borderRadius:16,padding:"28px 24px",border:"1.5px dashed #D4C8B8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:10 }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#C45B28";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#D4C8B8";}}><div style={{ width:44,height:44,borderRadius:12,background:"#C45B2810",display:"flex",alignItems:"center",justifyContent:"center",color:"#C45B28" }}><PlusIcon size={20}/></div><span style={{ fontSize:14,fontWeight:600,color:"#8B7355",fontFamily:F }}>Add a City</span></div>;
  const sp=COLOR_PRESETS[form.colorIdx%COLOR_PRESETS.length];
  return (
    <div style={{ background:"#FDFAF6",borderRadius:16,padding:24,border:"1.5px solid #C45B2840",animation:"fadeSlide 0.3s ease" }}>
      <div style={{ fontSize:14,fontWeight:700,color:"#2C1810",marginBottom:18,fontFamily:PF }}>Add New City</div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:8,fontFamily:F }}>Icon</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{EMOJI_OPTIONS.map(em=><div key={em} onClick={()=>setForm(f=>({...f,emoji:em}))} style={{ width:34,height:34,borderRadius:8,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:form.emoji===em?`2px solid ${sp.color}`:"1.5px solid #E8E0D4" }}>{em}</div>)}</div>
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:14 }}>
        <div style={{ flex:1 }}><div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:6,fontFamily:F }}>City Name</div><input autoFocus placeholder="e.g. Barcelona" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleAdd()} style={{ width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"white",fontSize:13.5,fontFamily:F,color:"#2C1810",outline:"none",boxSizing:"border-box" }}/></div>
        <div style={{ flex:1 }}><div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:6,fontFamily:F }}>Tagline</div><input placeholder="e.g. The Sunny Coast" value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} style={{ width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"white",fontSize:13.5,fontFamily:F,color:"#2C1810",outline:"none",boxSizing:"border-box" }}/></div>
      </div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#8B7355",marginBottom:8,fontFamily:F }}>Color</div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>{COLOR_PRESETS.map((pr,idx)=><div key={idx} onClick={()=>setForm(f=>({...f,colorIdx:idx}))} style={{ width:28,height:28,borderRadius:8,cursor:"pointer",background:`linear-gradient(135deg,${pr.color},${pr.accent})`,border:form.colorIdx===idx?"2.5px solid #2C1810":"2.5px solid transparent" }}/>)}</div>
      </div>
      <div style={{ display:"flex",gap:10 }}>
        <button onClick={handleAdd} disabled={!form.name.trim()} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:form.name.trim()?"linear-gradient(135deg,#C45B28,#D4753E)":"#E8E0D4",color:form.name.trim()?"white":"#B0A090",fontSize:13,fontWeight:600,cursor:form.name.trim()?"pointer":"default",fontFamily:F }}>Add to Itinerary</button>
        <button onClick={()=>{setIsAdding(false);setForm({name:"",emoji:"🏙️",tagline:"",colorIdx:0});}} style={{ padding:"10px 18px",borderRadius:10,border:"1px solid #E8E0D4",background:"transparent",color:"#8B7355",fontSize:13,cursor:"pointer",fontFamily:F }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Packing (same as before, wired to Supabase) ───
function PackingList() {
  const { data:categories, insert:insertCat, remove:removeCat } = useTable('packing_categories', { orderBy:'sort_order' });
  const { data:items, insert:insertItem, update:updateItem, remove:removeItem } = useTable('packing_items', { orderBy:'sort_order' });
  const [newItems,setNewItems]=useState({});
  const [newCatName,setNewCatName]=useState("");
  const [showAddCat,setShowAddCat]=useState(false);
  const total=items.length, done=items.filter(i=>i.done).length, pct=total>0?Math.round((done/total)*100):0;

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <span style={{ fontSize:13,color:"#8B7355",fontFamily:F }}>{done} of {total} packed</span>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:120,height:6,borderRadius:3,background:"#E8E0D4",overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",borderRadius:3,background:"linear-gradient(90deg,#C45B28,#E8A87C)",transition:"width 0.4s ease" }}/></div>
          <span style={{ fontSize:12,fontWeight:600,color:"#C45B28",fontFamily:F }}>{pct}%</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
        {categories.map(cat=>{
          const catItems=items.filter(i=>i.category_id===cat.id).sort((a,b)=>a.sort_order-b.sort_order);
          return (
            <div key={cat.id} style={{ background:"#FDFAF6",borderRadius:14,padding:18,border:"1px solid #E8E0D4" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <div style={{ fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#C45B28",fontFamily:F }}>{cat.name}</div>
                <button onClick={()=>removeCat(cat.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#C4B8A8",fontSize:15 }}>×</button>
              </div>
              {catItems.map(item=>(
                <div key={item.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",userSelect:"none" }}>
                  <div onClick={()=>updateItem(item.id,{done:!item.done})} style={{ width:20,height:20,borderRadius:6,cursor:"pointer",flexShrink:0,border:item.done?"none":"1.5px solid #C4B8A8",background:item.done?"linear-gradient(135deg,#C45B28,#E8A87C)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"white" }}>{item.done&&<CheckIcon/>}</div>
                  <span onClick={()=>updateItem(item.id,{done:!item.done})} style={{ flex:1,fontSize:13.5,fontFamily:F,color:item.done?"#B0A090":"#4A3728",textDecoration:item.done?"line-through":"none",cursor:"pointer" }}>{item.name}</span>
                  <button onClick={()=>removeItem(item.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#D4C8B8",fontSize:14,padding:0 }}>×</button>
                </div>
              ))}
              <div style={{ display:"flex",gap:6,marginTop:10 }}>
                <input placeholder="+ Add item..." value={newItems[cat.id]||""} onChange={e=>setNewItems(p=>({...p,[cat.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){const t=(newItems[cat.id]||"").trim();if(t){insertItem({id:uid(),category_id:cat.id,name:t,done:false,sort_order:catItems.length});setNewItems(p=>({...p,[cat.id]:""}));}}}} style={{ flex:1,padding:"7px 10px",borderRadius:8,fontSize:12.5,border:"1px solid #E8E0D418",background:"transparent",fontFamily:F,color:"#4A3728",outline:"none" }}/>
                <button onClick={()=>{const t=(newItems[cat.id]||"").trim();if(t){insertItem({id:uid(),category_id:cat.id,name:t,done:false,sort_order:catItems.length});setNewItems(p=>({...p,[cat.id]:""}));}}} style={{ width:28,height:28,borderRadius:7,border:"none",background:"#C45B2815",color:"#C45B28",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><PlusIcon size={12}/></button>
              </div>
            </div>
          );
        })}
        {showAddCat?(
          <div style={{ background:"#FDFAF6",borderRadius:14,padding:18,border:"1.5px dashed #C45B2840" }}>
            <div style={{ fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#C45B28",marginBottom:12,fontFamily:F }}>New Category</div>
            <input autoFocus placeholder="Category name..." value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const n=newCatName.trim();if(n){insertCat({id:uid(),name:n,sort_order:categories.length});setNewCatName("");setShowAddCat(false);}}if(e.key==="Escape"){setShowAddCat(false);setNewCatName("");}}} style={{ padding:"10px 12px",borderRadius:10,border:"1.5px solid #C45B2830",background:"white",fontSize:13,fontFamily:F,color:"#4A3728",outline:"none",marginBottom:10,width:"100%",boxSizing:"border-box" }}/>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>{const n=newCatName.trim();if(n){insertCat({id:uid(),name:n,sort_order:categories.length});setNewCatName("");setShowAddCat(false);}}} style={{ flex:1,padding:"8px 0",borderRadius:8,border:"none",background:"linear-gradient(135deg,#C45B28,#D4753E)",color:"white",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F }}>Create</button>
              <button onClick={()=>{setShowAddCat(false);setNewCatName("");}} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #E8E0D4",background:"transparent",color:"#8B7355",fontSize:12.5,cursor:"pointer",fontFamily:F }}>Cancel</button>
            </div>
          </div>
        ):(
          <div onClick={()=>setShowAddCat(true)} style={{ background:"transparent",borderRadius:14,padding:18,border:"1.5px dashed #D4C8B8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:8,minHeight:120 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:"#C45B2810",display:"flex",alignItems:"center",justifyContent:"center",color:"#C45B28" }}><PlusIcon size={16}/></div>
            <span style={{ fontSize:12.5,fontWeight:600,color:"#8B7355",fontFamily:F }}>Add Category</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Budget ───
function BudgetTracker({ cities, stays }) {
  const { data:expenses, insert:insertExp, remove:removeExp } = useTable('expenses', { orderBy:'created_at' });
  const [newExp,setNewExp]=useState({city_id:cities[0]?.id||"",label:"",amount:"",category:"other"});
  const stayExps = stays.filter(s=>s.add_to_budget&&s.cost>0).map(s=>({id:"stay-"+s.id,city_id:s.city_id,label:s.name,amount:Number(s.cost),category:"stay",fromStay:true}));
  const all=[...expenses.map(e=>({...e,amount:Number(e.amount)})),...stayExps];
  const total=all.reduce((s,e)=>s+e.amount,0);
  const byCategory=all.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
  const catColors={transport:"#C45B28",stay:"#2E7D6F",food:"#8B4513",activity:"#1A5276",other:"#6C5B7B"};
  const catLabels={transport:"Transport",stay:"Accommodation",food:"Food & Drink",activity:"Activities",other:"Other"};

  return (
    <div>
      <div style={{ display:"flex",gap:16,marginBottom:24,flexWrap:"wrap" }}>
        <div style={{ background:"linear-gradient(135deg,#C45B28,#E8A87C)",borderRadius:14,padding:"18px 24px",color:"white",minWidth:180 }}>
          <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",opacity:0.85,fontFamily:F }}>Total Budget</div>
          <div style={{ fontSize:32,fontWeight:700,fontFamily:PF,marginTop:4 }}>${total.toLocaleString()}</div>
          <div style={{ fontSize:12,opacity:0.8,marginTop:2,fontFamily:F }}>CAD estimated</div>
        </div>
        {Object.entries(byCategory).map(([cat,amt])=>(
          <div key={cat} style={{ background:"#FDFAF6",borderRadius:14,padding:"18px 20px",border:`1.5px solid ${catColors[cat]}25`,minWidth:130 }}>
            <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",color:catColors[cat],fontWeight:600,fontFamily:F }}>{catLabels[cat]}</div>
            <div style={{ fontSize:22,fontWeight:700,color:"#2C1810",fontFamily:PF,marginTop:4 }}>${amt.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <select value={newExp.city_id} onChange={e=>setNewExp(p=>({...p,city_id:e.target.value}))} style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"#FDFAF6",fontSize:13,fontFamily:F,color:"#4A3728" }}>{cities.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select>
        <select value={newExp.category} onChange={e=>setNewExp(p=>({...p,category:e.target.value}))} style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"#FDFAF6",fontSize:13,fontFamily:F,color:"#4A3728" }}>{Object.entries(catLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
        <input placeholder="Description" value={newExp.label} onChange={e=>setNewExp(p=>({...p,label:e.target.value}))} style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"#FDFAF6",fontSize:13,fontFamily:F,flex:1,minWidth:140,color:"#4A3728",outline:"none" }}/>
        <input placeholder="$" type="number" value={newExp.amount} onChange={e=>setNewExp(p=>({...p,amount:e.target.value}))} style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid #E8E0D4",background:"#FDFAF6",fontSize:13,fontFamily:F,width:100,color:"#4A3728",outline:"none" }}/>
        <button onClick={()=>{if(!newExp.label||!newExp.amount)return;insertExp({id:uid(),...newExp,amount:Number(newExp.amount)});setNewExp({city_id:cities[0]?.id||"",label:"",amount:"",category:"other"});}} style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#C45B28,#D4753E)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F }}>+ Add</button>
      </div>
      <div style={{ background:"#FDFAF6",borderRadius:14,border:"1px solid #E8E0D4",overflow:"hidden" }}>
        {all.map((exp,i)=>{const city=cities.find(c=>c.id===exp.city_id);return(
          <div key={exp.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:i<all.length-1?"1px solid #E8E0D410":"none" }}>
            <span style={{ fontSize:16 }}>{city?.emoji||"📍"}</span>
            <span style={{ flex:1,fontSize:13.5,color:"#4A3728",fontFamily:F }}>{exp.label}{exp.fromStay&&<span style={{ fontSize:10,color:"#B0A090",marginLeft:6 }}>via hotel</span>}</span>
            <span style={{ fontSize:10,padding:"3px 8px",borderRadius:6,background:`${catColors[exp.category]}15`,color:catColors[exp.category],fontWeight:600,textTransform:"uppercase",fontFamily:F }}>{catLabels[exp.category]}</span>
            <span style={{ fontSize:15,fontWeight:600,color:"#2C1810",fontFamily:F,minWidth:70,textAlign:"right" }}>${exp.amount.toLocaleString()}</span>
            {!exp.fromStay&&<button onClick={()=>removeExp(exp.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#C4B8A8",fontSize:16,padding:"0 4px" }}>×</button>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ─── Weather Data (May averages) ───
const WEATHER_DATA = {
  rome: { high: 24, low: 14, rain: 4, icon: '☀️', desc: 'Warm & sunny' },
  sorrento: { high: 23, low: 15, rain: 5, icon: '🌤️', desc: 'Warm, occasional showers' },
  florence: { high: 24, low: 13, rain: 6, icon: '🌤️', desc: 'Warm, some rain' },
  venice: { high: 22, low: 13, rain: 7, icon: '🌤️', desc: 'Mild, can be humid' },
  london: { high: 17, low: 9, rain: 8, icon: '🌦️', desc: 'Cool, pack layers' },
  milan: { high: 23, low: 13, rain: 8, icon: '🌤️', desc: 'Warm but rainy' },
  naples: { high: 23, low: 14, rain: 5, icon: '☀️', desc: 'Warm & pleasant' },
};

function WeatherBadge({ cityId }) {
  const key = cityId.toLowerCase().replace(/[^a-z]/g, '');
  const w = WEATHER_DATA[key];
  if (!w) return null;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--text-muted)',fontFamily:F,padding:'3px 8px',borderRadius:8,background:'var(--subtle-bg)',border:'1px solid var(--border)' }}>
      <span>{w.icon}</span>
      <span>{w.high}°/{w.low}°C</span>
      <span style={{ opacity:0.6 }}>·</span>
      <span>{w.desc}</span>
    </div>
  );
}

// ─── Notes (with search) ───
function NotesTab({ cities }) {
  const { data:notes, insert:insertNote, remove:removeNote } = useTable('notes', { orderBy:'created_at' });
  const [newNote,setNewNote]=useState({city_id:cities[0]?.id||"",text:""});
  const [search,setSearch]=useState("");

  const filteredNotes = search.trim()
    ? notes.filter(n=>n.text.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes..." style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--card-bg)",fontSize:13,fontFamily:F,color:"var(--text)",outline:"none",boxSizing:"border-box" }}/>
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:24 }}>
        <select value={newNote.city_id} onChange={e=>setNewNote(p=>({...p,city_id:e.target.value}))} style={{ padding:"10px 14px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--card-bg)",fontSize:13,fontFamily:F,color:"var(--text)" }}>{cities.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select>
        <input placeholder="Add a note..." value={newNote.text} onChange={e=>setNewNote(p=>({...p,text:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&newNote.text.trim()){insertNote({id:uid(),...newNote});setNewNote({city_id:cities[0]?.id||"",text:""});}}} style={{ flex:1,padding:"10px 14px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--card-bg)",fontSize:13,fontFamily:F,color:"var(--text)",outline:"none" }}/>
        <button onClick={()=>{if(!newNote.text.trim())return;insertNote({id:uid(),...newNote});setNewNote({city_id:cities[0]?.id||"",text:""});}} style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#C45B28,#D4753E)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F }}>+ Add</button>
      </div>
      <div style={{ display:"grid",gap:12 }}>
        {cities.map(city=>{const cn=filteredNotes.filter(n=>n.city_id===city.id);if(!cn.length)return null;return(
          <div key={city.id} style={{ background:"var(--card-bg)",borderRadius:14,padding:18,border:`1.5px solid ${city.color}20` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><span>{city.emoji}</span><span style={{ fontSize:14,fontWeight:700,color:city.color,fontFamily:F }}>{city.name}</span></div>
            {cn.map((note,i)=>(
              <div key={note.id} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderTop:i>0?`1px solid ${city.color}10`:"none" }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:city.color,marginTop:7,flexShrink:0,opacity:0.4 }}/>
                <span style={{ flex:1,fontSize:13.5,color:"var(--text-secondary)",lineHeight:1.5,fontFamily:F }}>{note.text}</span>
                <button onClick={()=>removeNote(note.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#C4B8A8",fontSize:14,padding:0 }}>×</button>
              </div>
            ))}
          </div>
        );})}
      </div>
    </div>
  );
}

// ─── Dark Mode Toggle ───
function DarkModeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} className="no-print" style={{ width:36,height:36,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--card-bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }} title={dark?'Light mode':'Dark mode'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

// ─── Print Export ───
function PrintButton() {
  return (
    <button onClick={()=>window.print()} className="no-print" style={{ width:36,height:36,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--card-bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }} title="Print / Export PDF">
      🖨️
    </button>
  );
}

// ─── Icons for new tabs ───
const TransportIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const EatsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const MapIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const PhotoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const PhraseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const CurrencyIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="18"/><path d="M15.5 9.5c-.8-1-2-1.5-3.5-1.5s-3 1-3 2.5 1.5 2 3 2.5 3 1 3 2.5-1.5 2.5-3 2.5-2.7-.5-3.5-1.5"/></svg>;
const ImportIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ─── Main App ───
const TABS = [
  {id:"plan",label:"Itinerary",icon:<PlanIcon/>},
  {id:"transport",label:"Transport",icon:<TransportIcon/>},
  {id:"eats",label:"Eats",icon:<EatsIcon/>},
  {id:"pack",label:"Packing",icon:<PackIcon/>},
  {id:"budget",label:"Budget",icon:<BudgetIcon/>},
  {id:"map",label:"Map",icon:<MapIcon/>},
  {id:"notes",label:"Notes",icon:<NotesIcon/>},
  {id:"photos",label:"Photos",icon:<PhotoIcon/>},
  {id:"currency",label:"Currency",icon:<CurrencyIcon/>},
  {id:"phrases",label:"Phrases",icon:<PhraseIcon/>},
  {id:"import",label:"Imports",icon:<ImportIcon/>},
];

// Mobile: 4 primary tabs + "More" button
const MOBILE_PRIMARY = ["plan","transport","budget","import"];
const MOBILE_MORE = TABS.filter(t=>!MOBILE_PRIMARY.includes(t.id));
const MoreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>;

export default function TripPlanner() {
  const [activeTab,setActiveTab]=useState("plan");
  const [expandedCity,setExpandedCity]=useState(null);
  const [dark,setDark]=useState(false);
  const [dragId,setDragId]=useState(null);
  const [moreOpen,setMoreOpen]=useState(false);
  const [flightEditOpen,setFlightEditOpen]=useState(false);

  const { data:flights, update:updateFlights } = useSingleton('flights');
  const { data:cities, insert:insertCity, update:updateCity, remove:removeCity } = useTable('cities', { orderBy:'sort_order' });
  const stayTable = useTable('stays', { orderBy:'created_at' });
  const dayPlanTable = useTable('day_plans', { orderBy:'sort_order' });
  const flightLegsTable = useTable('flight_legs', { orderBy:'leg_order' });

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleDeleteCity = async (id) => { await removeCity(id); if(expandedCity===id) setExpandedCity(null); };

  // Drag and drop for cities
  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (targetId) => {
    if (!dragId || dragId === targetId) return;
    const fromIdx = cities.findIndex(c => c.id === dragId);
    const toIdx = cities.findIndex(c => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    // Reorder: swap sort_order values
    const reordered = [...cities];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    // Update sort_order for all affected
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await updateCity(reordered[i].id, { sort_order: i });
      }
    }
    setDragId(null);
  };

  const warnings = computeWarnings(flights, cities, stayTable.data);
  const tripDays = flights?.depart_date&&flights?.return_date ? getDayCount(flights.depart_date,flights.return_date) : null;
  const totalNights = cities.reduce((s,c)=>s+getDayCount(c.arrive,c.depart),0);

  return (
    <div style={{ minHeight:"100vh" }}>
      <div className="app-header" style={{ padding:"40px 0 14px",textAlign:"center" }}>
        {/* Top bar: dark mode + print */}
        <div className="no-print" style={{ display:'flex',justifyContent:'flex-end',gap:8,padding:'0 24px',marginBottom:12 }}>
          <PrintButton/>
          <DarkModeToggle dark={dark} onToggle={()=>setDark(!dark)}/>
        </div>

        <div style={{ fontSize:14,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--accent)",fontWeight:600,marginBottom:8 }}>May 2026</div>
        <h1 className="app-title" style={{ fontFamily:PF,fontSize:48,fontWeight:800,color:"var(--text)",margin:0,letterSpacing:"-0.02em",lineHeight:1.1 }}>Italy & Beyond</h1>
        <div style={{ marginTop:12,display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap" }}>
          {cities.map((city,i)=>(
            <span key={city.id} style={{ display:"flex",alignItems:"center",gap:4 }}>
              <span style={{ fontSize:12,color:city.color,fontWeight:500,padding:"4px 10px",borderRadius:20,background:`${city.color}10`,border:`1px solid ${city.color}20` }}>{city.emoji} {city.name}</span>
              {i<cities.length-1&&<span style={{ color:"var(--text-muted)",fontSize:10 }}>→</span>}
            </span>
          ))}
        </div>

        {/* Countdown Timer */}
        <div style={{ marginTop:16 }}>
          <CountdownTimer departDate={flights?.depart_date}/>
        </div>
      </div>

      {/* Desktop tabs - scrollable */}
      <div className="desktop-tabs" style={{ display:"flex",justifyContent:"center",gap:4,padding:"0 20px",marginBottom:30,position:"sticky",top:0,zIndex:10,background:`linear-gradient(180deg,var(--bg-solid) 80%,transparent)`,paddingTop:10,paddingBottom:14,overflowX:"auto",WebkitOverflowScrolling:"touch" }}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:12,border:activeTab===tab.id?"1.5px solid #C45B2840":"1.5px solid transparent",background:activeTab===tab.id?"#C45B2812":"transparent",color:activeTab===tab.id?"#C45B28":"var(--text-muted)",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F,transition:"all 0.25s ease",whiteSpace:"nowrap",flexShrink:0 }}>{tab.icon}{tab.label}</button>
        ))}
      </div>

      {/* Mobile bottom nav — 4 primary tabs + More */}
      <div className="mobile-bottom-nav" style={{ display:"none",position:"fixed",bottom:0,left:0,right:0,zIndex:20,background:"var(--card-bg)",borderTop:"1px solid var(--border)",padding:"6px 0 env(safe-area-inset-bottom, 6px)",justifyContent:"space-around" }}>
        {MOBILE_PRIMARY.map(id=>{const tab=TABS.find(t=>t.id===id);return(
          <button key={id} onClick={()=>{setActiveTab(id);setMoreOpen(false);}} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 12px",borderRadius:10,border:"none",background:activeTab===id?"#C45B2812":"transparent",color:activeTab===id?"#C45B28":"var(--text-muted)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F }}>
            {tab.icon}
            <span style={{ fontSize:10,lineHeight:1 }}>{tab.label}</span>
          </button>
        );})}
        <button onClick={()=>setMoreOpen(!moreOpen)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 12px",borderRadius:10,border:"none",background:moreOpen||(!MOBILE_PRIMARY.includes(activeTab))?"#C45B2812":"transparent",color:moreOpen||(!MOBILE_PRIMARY.includes(activeTab))?"#C45B28":"var(--text-muted)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F }}>
          <MoreIcon/>
          <span style={{ fontSize:10,lineHeight:1 }}>More</span>
        </button>
      </div>

      {/* More menu overlay */}
      {moreOpen&&(
        <>
          <div className="more-menu-overlay" onClick={()=>setMoreOpen(false)}/>
          <div className="more-menu">
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
              {MOBILE_MORE.map(tab=>(
                <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setMoreOpen(false);}} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 8px",borderRadius:12,border:activeTab===tab.id?"1.5px solid #C45B28":"1.5px solid var(--border)",background:activeTab===tab.id?"#C45B2812":"transparent",color:activeTab===tab.id?"#C45B28":"var(--text-muted)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="main-content" style={{ maxWidth:820,margin:"0 auto",padding:"0 24px 60px" }}>
        {activeTab==="plan"&&(
          <div>
            <FlightCard flights={flights} onUpdate={updateFlights} flightLegs={flightLegsTable.data} flightLegsActions={flightLegsTable} tripDays={tripDays} totalNights={totalNights} onEditOpen={()=>setFlightEditOpen(true)}/>
            <WarningsPanel warnings={warnings}/>
            <TimelineOverview cities={cities}/>
            <div style={{ display:"grid",gap:14 }}>
              {cities.map(city=>(
                <div key={city.id} draggable onDragStart={()=>handleDragStart(city.id)} onDragOver={handleDragOver} onDrop={()=>handleDrop(city.id)} onDragEnter={e=>e.currentTarget.classList.add('drag-over')} onDragLeave={e=>e.currentTarget.classList.remove('drag-over')}>
                  <WeatherBadge cityId={city.id}/>
                  <CityCard city={city} isExpanded={expandedCity===city.id}
                    onToggle={()=>setExpandedCity(expandedCity===city.id?null:city.id)}
                    onUpdate={updateCity} onDelete={handleDeleteCity}
                    stays={stayTable.data} stayActions={stayTable}
                    dayPlans={dayPlanTable.data} dayPlanActions={dayPlanTable}/>
                </div>
              ))}
              <AddCityCard onAdd={insertCity}/>
            </div>
          </div>
        )}
        {activeTab==="transport"&&<TransportPlanner cities={cities}/>}
        {activeTab==="eats"&&<RestaurantBookmarks cities={cities}/>}
        {activeTab==="pack"&&<PackingList/>}
        {activeTab==="budget"&&<BudgetTracker cities={cities} stays={stayTable.data}/>}
        {activeTab==="map"&&<MapView cities={cities} flights={flights}/>}
        {activeTab==="notes"&&<NotesTab cities={cities}/>}
        {activeTab==="photos"&&<PhotoJournal cities={cities}/>}
        {activeTab==="currency"&&<CurrencyConverter/>}
        {activeTab==="phrases"&&<PhraseBook/>}
        {activeTab==="import"&&<ImportVault cities={cities} stayActions={stayTable} flights={flights} updateFlights={updateFlights}/>}
      </div>

      {/* Flight Edit Modal */}
      {flightEditOpen&&<FlightEditModal flightLegs={flightLegsTable.data} flightLegsActions={flightLegsTable} updateFlights={updateFlights} onClose={()=>setFlightEditOpen(false)}/>}
    </div>
  );
}
