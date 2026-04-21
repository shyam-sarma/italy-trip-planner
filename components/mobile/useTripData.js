'use client';
import { useMemo } from 'react';
import { useTable, useSingleton } from '../../lib/hooks';
import { supabase } from '../../lib/supabase';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function getDayCount(a, d) {
  if (!a || !d) return 0;
  const x = new Date(a + 'T12:00:00'), y = new Date(d + 'T12:00:00');
  if (isNaN(x) || isNaN(y)) return 0;
  return Math.max(0, Math.round((y - x) / 864e5));
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d;
}

function fmtDayLabel(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function useTripData() {
  const { data: cityRows, loading: lc } = useTable('cities', { orderBy: 'sort_order' });
  const { data: stayRows, loading: ls } = useTable('stays', { orderBy: 'created_at' });
  const { data: planRows, loading: lp } = useTable('day_plans', { orderBy: 'sort_order' });
  const { data: catRows, loading: lpc }  = useTable('packing_categories', { orderBy: 'sort_order' });
  const { data: itemRows, loading: lpi } = useTable('packing_items', { orderBy: 'sort_order' });
  const { data: flights, loading: lf }   = useSingleton('flights');

  const loading = lc || ls || lp || lpc || lpi || lf;

  const trip = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const cities = cityRows.map(c => {
      const nights = getDayCount(c.arrive, c.depart);
      const stay = stayRows.find(s => s.city_id === c.id) || null;
      return {
        id: c.id,
        name: c.name,
        country: c.country || 'Italy',
        tagline: c.tagline || '',
        emoji: c.emoji || '🏙️',
        coverTone: c.cover_tone || c.accent || '#d4a574',
        color: c.color,
        arrive: c.arrive || '',
        depart: c.depart || '',
        nights,
        highlights: Array.isArray(c.must_see) ? c.must_see : [],
        tips: Array.isArray(c.tips) ? c.tips : [],
        stay: stay ? {
          id: stay.id,
          name: stay.name,
          area: stay.address,
          nights,
          cost: Number(stay.cost || 0),
          confirm: stay.confirm_num,
          checkin: stay.checkin,
          checkout: stay.checkout,
        } : null,
      };
    });

    // Group day_plans by city → day_index
    const days = {};
    cities.forEach(c => {
      const cityPlans = planRows
        .filter(p => p.city_id === c.id)
        .slice()
        .sort((a, b) => (a.day_index - b.day_index) || (a.sort_order - b.sort_order));
      if (cityPlans.length === 0) return;

      const byIdx = new Map();
      cityPlans.forEach(p => {
        if (!byIdx.has(p.day_index)) byIdx.set(p.day_index, []);
        byIdx.get(p.day_index).push(p);
      });

      const dayArray = [];
      const sortedIdxs = [...byIdx.keys()].sort((a, b) => a - b);
      sortedIdxs.forEach(idx => {
        const label = c.arrive ? fmtDayLabel(addDays(c.arrive, idx)) : `Day ${idx + 1}`;
        dayArray.push({
          dayIndex: idx,
          d: label,
          items: byIdx.get(idx).map(p => ({
            id: p.id,
            t: p.time || '',
            label: p.text,
            kind: p.kind || 'sight',
            ticket: p.ticket || '',
            done: !!p.done,
          })),
        });
      });
      days[c.id] = dayArray;
    });

    // Packing list
    const packList = catRows
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        items: itemRows
          .filter(it => it.category_id === cat.id)
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(it => ({ id: it.id, name: it.name, done: !!it.done })),
      }));

    // Figure out "today's city"
    let todayCity = null;
    let todayDayIndex = 0;
    for (const c of cities) {
      if (c.arrive && c.depart && today >= c.arrive && today <= c.depart) {
        todayCity = c;
        todayDayIndex = getDayCount(c.arrive, today);
        break;
      }
    }
    if (!todayCity && cities.length) { todayCity = cities[0]; todayDayIndex = 0; }

    return {
      meta: {
        departDate: flights?.depart_date || '',
        returnDate: flights?.return_date || '',
        today,
      },
      cities,
      days,
      packList,
      flights: flights || {},
      todayCity,
      todayDayIndex,
    };
  }, [cityRows, stayRows, planRows, catRows, itemRows, flights]);

  // ── Mutators (direct Supabase — realtime subscriptions auto-refresh useTable hooks)
  const togglePlanDone = async (planId, currentDone) => {
    await supabase.from('day_plans').update({ done: !currentDone }).eq('id', planId);
  };

  const togglePackItem = async (itemId, currentDone) => {
    await supabase.from('packing_items').update({ done: !currentDone }).eq('id', itemId);
  };

  const addPackItem = async (categoryId, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const siblings = itemRows.filter(i => i.category_id === categoryId);
    const sort_order = siblings.length
      ? Math.max(...siblings.map(i => i.sort_order || 0)) + 1
      : 0;
    await supabase.from('packing_items').insert({
      id: uid(), category_id: categoryId, name: trimmed, done: false, sort_order,
    });
  };

  const removePackItem = async (itemId) => {
    await supabase.from('packing_items').delete().eq('id', itemId);
  };

  const addPackCategory = async (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const sort_order = catRows.length
      ? Math.max(...catRows.map(c => c.sort_order || 0)) + 1
      : 0;
    await supabase.from('packing_categories').insert({
      id: uid(), name: trimmed, sort_order,
    });
  };

  const removePackCategory = async (categoryId) => {
    await supabase.from('packing_categories').delete().eq('id', categoryId);
  };

  return {
    ...trip,
    loading,
    mutators: {
      togglePlanDone,
      togglePackItem,
      addPackItem,
      removePackItem,
      addPackCategory,
      removePackCategory,
    },
  };
}
