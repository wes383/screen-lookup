import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const isServer = typeof window === 'undefined';

if (isServer) {
  const fs = require('fs');
  const path = require('path');
  
  const localesDir = path.join(process.cwd(), 'public', 'locales');
  const enTranslation = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'translation.json'), 'utf-8'));
  
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enTranslation }
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    initImmediate: false
  });
} else {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      backend: {
        loadPath: '/locales/{{lng}}/translation.json'
      },
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
    
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && savedLanguage !== i18n.language) {
    i18n.changeLanguage(savedLanguage);
  }
  
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
  });
}

export default i18n;
