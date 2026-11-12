import { useEffect, useState } from 'react';
import Hero from './components/Hero.jsx';
import Booking from './components/Booking.jsx';
import Lista from './components/Lista.jsx';
import Tickets from './components/Tickets.jsx';
import { Header, Rooms, Week, Zones, Info, Footer, Cursor } from './components/Sections.jsx';
import { useLenis } from './lib/hooks.js';
import { startAccent } from './lib/accent.js';
import { langStore, useStore } from './lib/store.js';

const TITLE = {
  es: 'Committee Club Valencia · Reservados VIP, entradas y lista',
  en: 'Committee Club Valencia · VIP tables, entry and list',
};

export default function App() {
  const lang = useStore(langStore);
  const [pick, setPick] = useState(null);
  useLenis();
  useEffect(() => startAccent(), []);
  useEffect(() => { document.documentElement.lang = lang; document.title = TITLE[lang]; }, [lang]);
  return (
    <>
      <a className="skip" href="#entradas">{lang === 'es' ? 'Ir a entradas' : 'Skip to tickets'}</a>
      <Header />
      <main>
        <Hero />
        <Rooms />
        <Week />
        <Tickets />
        <Zones onPick={(zone) => setPick({ zone, at: Date.now() })} />
        <Booking pick={pick} />
        <Lista />
        <Info />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
