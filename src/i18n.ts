import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';
import zhTWTranslation from './locales/zh-TW/translation.json';
import zhHKTranslation from './locales/zh-HK/translation.json';
import jaTranslation from './locales/ja/translation.json';
import esTranslation from './locales/es/translation.json';
import frTranslation from './locales/fr/translation.json';
import koTranslation from './locales/ko/translation.json';
import deTranslation from './locales/de/translation.json';
import ruTranslation from './locales/ru/translation.json';
import itTranslation from './locales/it/translation.json';
import ptTranslation from './locales/pt/translation.json';
import trTranslation from './locales/tr/translation.json';
import arTranslation from './locales/ar/translation.json';
import hiTranslation from './locales/hi/translation.json';

const resources = {
  'en': {
    translation: enTranslation
  },
  'en-US': {
    translation: enTranslation
  },
  'en-GB': {
    translation: enTranslation
  },
  'zh': {
    translation: zhTranslation
  },
  'zh-CN': {
    translation: zhTranslation
  },
  'zh-TW': {
    translation: zhTWTranslation
  },
  'zh-HK': {
    translation: zhHKTranslation
  },
  'ja': {
    translation: jaTranslation
  },
  'es': {
    translation: esTranslation
  },
  'es-ES': {
    translation: esTranslation
  },
  'es-MX': {
    translation: esTranslation
  },
  'fr': {
    translation: frTranslation
  },
  'ko': {
    translation: koTranslation
  },
  'de': {
    translation: deTranslation
  },
  'ru': {
    translation: ruTranslation
  },
  'it': {
    translation: itTranslation
  },
  'pt': {
    translation: ptTranslation
  },
  'pt-PT': {
    translation: ptTranslation
  },
  'pt-BR': {
    translation: ptTranslation
  },
  'tr': {
    translation: trTranslation
  },
  'ar': {
    translation: arTranslation
  },
  'ar-SA': {
    translation: arTranslation
  },
  'ar-EG': {
    translation: arTranslation
  },
  'ar-AE': {
    translation: arTranslation
  },
  'hi': {
    translation: hiTranslation
  },
  'hi-IN': {
    translation: hiTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;