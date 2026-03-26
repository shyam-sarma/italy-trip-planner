'use client';
import { useState } from 'react';

const F = "'DM Sans',sans-serif";
const PF = "'Playfair Display',Georgia,serif";

const CATEGORIES = [
  {
    id: 'basics', emoji: '👋', title: 'Basics',
    phrases: [
      { it: 'Ciao', en: 'Hello / Goodbye (informal)', pron: 'CHOW' },
      { it: 'Buongiorno', en: 'Good morning / Good day', pron: 'bwon-JORN-oh' },
      { it: 'Buonasera', en: 'Good evening', pron: 'bwon-ah-SEH-rah' },
      { it: 'Grazie', en: 'Thank you', pron: 'GRAH-tsee-eh' },
      { it: 'Grazie mille', en: 'Thank you very much', pron: 'GRAH-tsee-eh MEE-leh' },
      { it: 'Prego', en: "You're welcome", pron: 'PREH-goh' },
      { it: 'Per favore', en: 'Please', pron: 'pair fah-VOH-reh' },
      { it: 'Scusi', en: 'Excuse me (formal)', pron: 'SKOO-zee' },
      { it: 'Mi dispiace', en: "I'm sorry", pron: 'mee dee-SPYAH-cheh' },
      { it: 'Sì / No', en: 'Yes / No', pron: 'see / noh' },
      { it: 'Non parlo italiano', en: "I don't speak Italian", pron: 'non PAR-loh ee-tahl-YAH-noh' },
      { it: 'Parla inglese?', en: 'Do you speak English?', pron: 'PAR-lah een-GLEH-zeh' },
    ]
  },
  {
    id: 'dining', emoji: '🍽️', title: 'Dining',
    phrases: [
      { it: 'Un tavolo per due, per favore', en: 'A table for two, please', pron: 'oon TAH-voh-loh pair DOO-eh' },
      { it: 'Il menu, per favore', en: 'The menu, please', pron: 'eel meh-NOO pair fah-VOH-reh' },
      { it: 'Il conto, per favore', en: 'The check, please', pron: 'eel KON-toh pair fah-VOH-reh' },
      { it: 'Vorrei...', en: 'I would like...', pron: 'vor-RAY' },
      { it: 'Acqua naturale / frizzante', en: 'Still / sparkling water', pron: 'AH-kwah nah-too-RAH-leh / free-TSAHN-teh' },
      { it: 'Un caffè', en: 'A coffee (espresso)', pron: 'oon kah-FEH' },
      { it: 'Un bicchiere di vino rosso/bianco', en: 'A glass of red/white wine', pron: 'oon bee-KYEH-reh dee VEE-noh' },
      { it: 'Buono! / Delizioso!', en: 'Good! / Delicious!', pron: 'BWOH-noh / deh-lee-TSYOH-zoh' },
      { it: "Cos'è questo?", en: 'What is this?', pron: 'koh-ZEH KWEH-stoh' },
      { it: 'Sono allergico/a a...', en: "I'm allergic to...", pron: 'SOH-noh ah-LEHR-jee-koh ah' },
    ]
  },
  {
    id: 'directions', emoji: '🗺️', title: 'Getting Around',
    phrases: [
      { it: "Dov'è...?", en: 'Where is...?', pron: 'doh-VEH' },
      { it: 'A destra / A sinistra', en: 'To the right / To the left', pron: 'ah DEH-strah / ah see-NEE-strah' },
      { it: 'Sempre dritto', en: 'Straight ahead', pron: 'SEM-preh DREE-toh' },
      { it: 'Quanto costa il biglietto?', en: 'How much is the ticket?', pron: 'KWAHN-toh KOH-stah eel bee-LYEH-toh' },
      { it: 'La fermata del treno/bus', en: 'The train/bus stop', pron: 'lah fair-MAH-tah del TREH-noh' },
      { it: 'A che ora parte?', en: 'What time does it leave?', pron: 'ah keh OH-rah PAR-teh' },
      { it: 'Mi sono perso/a', en: "I'm lost", pron: 'mee SOH-noh PAIR-soh' },
      { it: 'Quanto è lontano?', en: 'How far is it?', pron: 'KWAHN-toh eh lon-TAH-noh' },
    ]
  },
  {
    id: 'shopping', emoji: '🛍️', title: 'Shopping',
    phrases: [
      { it: 'Quanto costa?', en: 'How much does it cost?', pron: 'KWAHN-toh KOH-stah' },
      { it: 'Posso pagare con la carta?', en: 'Can I pay by card?', pron: 'POH-soh pah-GAH-reh kon lah KAR-tah' },
      { it: 'Troppo caro', en: 'Too expensive', pron: 'TROH-poh KAH-roh' },
      { it: 'Solo guardando', en: 'Just looking', pron: 'SOH-loh gwar-DAHN-doh' },
      { it: 'Un gelato, per favore', en: 'An ice cream, please', pron: 'oon jeh-LAH-toh' },
    ]
  },
  {
    id: 'emergency', emoji: '🆘', title: 'Emergency',
    phrases: [
      { it: 'Aiuto!', en: 'Help!', pron: 'ah-YOO-toh' },
      { it: "Ho bisogno di un medico", en: 'I need a doctor', pron: 'oh bee-ZOHN-yoh dee oon MEH-dee-koh' },
      { it: 'Chiamate la polizia', en: 'Call the police', pron: 'kyah-MAH-teh lah poh-lee-TSEE-ah' },
      { it: "Dov'è l'ospedale?", en: 'Where is the hospital?', pron: 'doh-VEH loh-speh-DAH-leh' },
      { it: "Dov'è la farmacia?", en: 'Where is the pharmacy?', pron: 'doh-VEH lah far-mah-CHEE-ah' },
    ]
  },
  {
    id: 'british', emoji: '🇬🇧', title: 'British Slang (for London)',
    phrases: [
      { it: 'Cheers', en: 'Thank you / Goodbye', pron: 'cheerz' },
      { it: 'The Tube', en: 'London Underground', pron: 'the toob' },
      { it: 'Quid', en: 'Pound (currency)', pron: 'kwid' },
      { it: 'Fancy a cuppa?', en: 'Want a cup of tea?', pron: 'as written' },
      { it: 'Lovely / Brilliant', en: 'Great / Awesome', pron: 'as written' },
    ]
  },
];

export default function PhraseBook() {
  const [openCat, setOpenCat] = useState('basics');
  const [search, setSearch] = useState('');

  const filteredCategories = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        phrases: cat.phrases.filter(p =>
          p.it.toLowerCase().includes(search.toLowerCase()) ||
          p.en.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(cat => cat.phrases.length > 0)
    : CATEGORIES;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search phrases..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--card-bg)', fontSize: 14, fontFamily: F, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filteredCategories.map(cat => {
          const isOpen = search.trim() || openCat === cat.id;
          return (
            <div key={cat.id} style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
              <div onClick={() => !search.trim() && setOpenCat(openCat === cat.id ? '' : cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: PF }}>{cat.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: F }}>{cat.phrases.length} phrases</span>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)', fontSize: 14 }}>▾</span>
              </div>

              {isOpen && (
                <div style={{ padding: '0 18px 16px' }}>
                  {cat.phrases.map((phrase, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border-light, #E8E0D410)' : 'none', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#C45B28', fontFamily: F }}>{phrase.it}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: F, marginTop: 2 }}>{phrase.pron}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: F }}>{phrase.en}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: '16px 18px', background: 'var(--card-bg)', borderRadius: 14, border: '1.5px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C45B28', marginBottom: 10, fontFamily: F }}>Quick Tips</div>
        <div style={{ display: 'grid', gap: 6, fontSize: 13, fontFamily: F, color: 'var(--text-secondary)' }}>
          <div style={{ padding: '6px 0' }}>• In Italy, greet with <strong>Buongiorno</strong> (morning) or <strong>Buonasera</strong> (evening) — it goes a long way</div>
          <div style={{ padding: '6px 0' }}>• <strong>Coperto</strong> on the bill is a normal cover charge — not a tip</div>
          <div style={{ padding: '6px 0' }}>• Tipping 5-10% is appreciated but not expected in Italy</div>
          <div style={{ padding: '6px 0' }}>• Say <strong>permesso</strong> (pair-MEH-soh) to get past people politely</div>
          <div style={{ padding: '6px 0' }}>• In London, "please" and "thank you" go even further than in Canada</div>
        </div>
      </div>
    </div>
  );
}
