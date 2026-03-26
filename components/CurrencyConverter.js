'use client';
import { useState, useEffect, useCallback } from 'react';

const F = "'DM Sans',sans-serif";

const CURRENCIES = [
  { code: 'CAD', symbol: '$', flag: '🇨🇦', label: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', label: 'British Pound' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'US Dollar' },
];

// Fallback rates (approximate May 2026 estimates, CAD base)
const FALLBACK_RATES = { CAD: 1, EUR: 0.67, GBP: 0.57, USD: 0.73 };

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('CAD');
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/CAD');
      if (res.ok) {
        const data = await res.json();
        setRates({
          CAD: 1,
          EUR: data.rates.EUR || FALLBACK_RATES.EUR,
          GBP: data.rates.GBP || FALLBACK_RATES.GBP,
          USD: data.rates.USD || FALLBACK_RATES.USD,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      // Use fallback rates
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const convert = (toCode) => {
    const num = parseFloat(amount) || 0;
    const inCAD = num / rates[from];
    return (inCAD * rates[toCode]).toFixed(2);
  };

  const others = CURRENCIES.filter(c => c.code !== from);

  return (
    <div>
      <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1.5px solid var(--border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontFamily: F }}>Amount</div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 20, fontWeight: 700, fontFamily: F, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontFamily: F }}>From</div>
            <select value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 14, fontFamily: F, color: 'var(--text)', cursor: 'pointer' }}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {others.map(c => {
            const converted = convert(c.code);
            return (
              <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--subtle-bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 22 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: F }}>{c.symbol}{parseFloat(converted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F, textAlign: 'right' }}>
                  1 {from} = {(rates[c.code] / rates[from]).toFixed(4)} {c.code}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F }}>{lastUpdated ? `Updated: ${lastUpdated}` : 'Using estimated rates'}</span>
        <button onClick={fetchRates} style={{ fontSize: 11, fontWeight: 600, color: '#1A5276', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>Refresh Rates</button>
      </div>

      <div style={{ marginTop: 20, background: 'var(--card-bg)', borderRadius: 14, padding: 18, border: '1.5px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C45B28', marginBottom: 12, fontFamily: F }}>Quick Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, fontFamily: F, color: 'var(--text-secondary)' }}>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>☕ Coffee: ~€1.50 / £3.50</div>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>🍕 Pizza: ~€8-12 / £12-16</div>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>🍝 Pasta: ~€10-15 / £14-20</div>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>🍷 Wine (glass): ~€5-8 / £7-12</div>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>🚇 Metro ticket: ~€2 / £2.80</div>
          <div style={{ padding: '8px 12px', background: 'var(--subtle-bg)', borderRadius: 8 }}>🎟️ Museum avg: ~€15 / £20</div>
        </div>
      </div>
    </div>
  );
}
