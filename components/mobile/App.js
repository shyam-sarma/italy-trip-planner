'use client';
import { useState, useEffect } from 'react';
import { TOKENS, injectBaseStyles } from './tokens';
import { TabBar } from './ui';
import { useTripData } from './useTripData';
import HomeScreen from './HomeScreen';
import TodayScreen from './TodayScreen';
import TimelineScreen from './TimelineScreen';
import CityScreen from './CityScreen';
import PackScreen from './PackScreen';
import WalletScreen from './WalletScreen';

const TAB_TO_SCREEN = {
  trip: 'home', today: 'today', map: 'timeline', pack: 'pack', wallet: 'wallet',
};
const SCREEN_TO_TAB = {
  home: 'trip', today: 'today', timeline: 'map',
  city: 'trip', pack: 'pack', wallet: 'wallet',
};
const TAB_ORDER = ['trip', 'today', 'map', 'pack', 'wallet'];

function ScreenSwitcher({ children, screen, dir }) {
  const [curr, setCurr] = useState({ screen, node: children });
  const [prev, setPrev] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (screen !== curr.screen) {
      setPrev(curr);
      setCurr({ screen, node: children });
      setAnimKey(k => k + 1);
      const t = setTimeout(() => setPrev(null), 380);
      return () => clearTimeout(t);
    } else {
      setCurr({ screen, node: children });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, children]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {prev && (
        <div key={`p-${animKey}`} style={{
          position: 'absolute', inset: 0,
          animation: `itscr-out-${dir > 0 ? 'left' : 'right'} 0.34s cubic-bezier(0.4,0,0.2,1) both`,
        }}>
          {prev.node}
        </div>
      )}
      <div key={`c-${animKey}`} style={{
        position: 'absolute', inset: 0,
        animation: prev ? `itscr-in-${dir > 0 ? 'right' : 'left'} 0.34s cubic-bezier(0.4,0,0.2,1) both` : 'none',
      }}>
        {curr.node}
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => { injectBaseStyles(); }, []);

  const trip = useTripData();

  const [screen, setScreen] = useState('home');
  const [cityId, setCityId] = useState(null);
  const [walletOpen, setWalletOpen] = useState(null);
  const [dir, setDir] = useState(1);

  const goto = (next, opts = {}) => {
    setDir(opts.dir ?? 1);
    setScreen(next);
  };
  const openCity = (id) => { setCityId(id); goto('city', { dir: 1 }); };
  const back = () => goto('home', { dir: -1 });

  const onTab = (tab) => {
    const next = TAB_TO_SCREEN[tab];
    const curTab = SCREEN_TO_TAB[screen];
    const d = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(curTab) ? 1 : -1;
    goto(next, { dir: d });
  };

  const activeTab = SCREEN_TO_TAB[screen] || 'trip';

  if (trip.loading) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: TOKENS.paper, color: TOKENS.inkSoft,
        fontFamily: TOKENS.hand, fontSize: 22,
      }}>
        loading your trip…
      </div>
    );
  }

  const resolvedCityId = cityId || trip.cities[0]?.id;

  const screens = {
    home:     <HomeScreen trip={trip} onOpenCity={openCity} onGoto={goto}/>,
    today:    <TodayScreen trip={trip} onOpenCity={openCity}/>,
    timeline: <TimelineScreen trip={trip} onOpenCity={openCity}/>,
    city:     <CityScreen trip={trip} cityId={resolvedCityId} onBack={back}/>,
    pack:     <PackScreen trip={trip}/>,
    wallet:   <WalletScreen trip={trip} expanded={walletOpen} setExpanded={setWalletOpen}/>,
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: TOKENS.paper }}>
      <ScreenSwitcher screen={screen} dir={dir}>
        {screens[screen]}
      </ScreenSwitcher>
      <TabBar active={activeTab} onTab={onTab}/>
    </div>
  );
}
