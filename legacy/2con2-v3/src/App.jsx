import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Studio from './components/Studio.jsx';
import Services from './components/Services.jsx';
import Vano from './components/Vano.jsx';
import Projects from './components/Projects.jsx';
import Process from './components/Process.jsx';
import Faq from './components/Faq.jsx';
import Reviews from './components/Reviews.jsx';
import Quote from './components/Quote.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { Marquee, ScrollProgress } from './components/ui.jsx';
import { useI18n } from './i18n/index.jsx';

export default function App() {
  const { t, dict } = useI18n();
  const words = [dict.services.title, ...dict.services.items.map((i) => i.title), t('contact.cityValue')];
  return (
    <>
      <a className="skip" href="#main">{t('a11y.skip')}</a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <Hero />
        <Marquee items={words} />
        <Studio />
        <Services />
        <Vano />
        <Projects />
        <Reviews />
        <Process />
        <Faq />
        <Quote />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
