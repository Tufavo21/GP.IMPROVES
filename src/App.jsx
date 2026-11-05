import { LazyMotion, domAnimation } from 'motion/react';
import { useI18n } from './i18n/index.jsx';
import { useLenis } from './lib/hooks.js';
import { DEMO_ENABLED } from './content/demo-content.js';
import Header from './components/Header.jsx';
import Hero from './sections/Hero.jsx';
import Studio from './sections/Studio.jsx';
import Projects from './sections/Projects.jsx';
import Services from './sections/Services.jsx';
import Process from './sections/Process.jsx';
import Testimonials from './sections/Testimonials.jsx';
import Faq from './sections/Faq.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';

export default function App() {
  const { t } = useI18n();
  useLenis();
  const sections = [Studio, Projects, Services, Process, ...(DEMO_ENABLED ? [Testimonials, Faq] : []), Contact];
  return (
    <LazyMotion features={domAnimation} strict>
      <a className="skip" href="#main">{t('skip')}</a>
      <Header />
      <main id="main">
        <Hero />
        {sections.map((S, i) => <S key={i} index={i + 1} total={sections.length} />)}
      </main>
      <Footer />
    </LazyMotion>
  );
}
