import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-ext-700.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import './styles/global.css';
import App from './App.jsx';
import { I18nProvider } from './i18n/index.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
