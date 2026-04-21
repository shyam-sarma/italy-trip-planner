'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Generic hook: fetch + realtime subscribe + mutations
export function useTable(table, { orderBy = 'created_at', filter } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from(table).select('*');
    if (orderBy) q = q.order(orderBy.replace('-', ''), { ascending: !orderBy.startsWith('-') });
    if (filter) Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data: rows } = await q;
    if (rows) setData(rows);
    setLoading(false);
  }, [table, orderBy, filter?.city_id]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch, table]);

  const upsert = async (row) => {
    const { error } = await supabase.from(table).upsert(row);
    if (error) console.error(`upsert ${table}:`, error);
  };

  const insert = async (row) => {
    const { error } = await supabase.from(table).insert(row);
    if (error) console.error(`insert ${table}:`, error);
  };

  const update = async (id, changes) => {
    const { error } = await supabase.from(table).update(changes).eq('id', id);
    if (error) console.error(`update ${table}:`, error);
  };

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(`delete ${table}:`, error);
  };

  const removeWhere = async (col, val) => {
    const { error } = await supabase.from(table).delete().eq(col, val);
    if (error) console.error(`deleteWhere ${table}:`, error);
  };

  return { data, loading, fetch, upsert, insert, update, remove, removeWhere };
}

// Singleton row hook (for flights table)
export function useSingleton(table) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows } = await supabase.from(table).select('*').limit(1);
    if (rows && rows.length > 0) setData(rows[0]);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`${table}-singleton`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch, table]);

  const update = async (changes) => {
    const { error } = await supabase.from(table).update({ ...changes, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) console.error(`update ${table}:`, error);
  };

  return { data, loading, update };
}
