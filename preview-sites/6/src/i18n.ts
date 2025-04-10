import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import arTranslation from './locales/ar.json';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    // Static translations
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      },
      ar: {
        translation: arTranslation
      }
    }
  });

export default i18n;
