import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import esMX from './locales/es-MX.json';

const resources = {
  en: { translation: en },
  'es-MX': { translation: esMX },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es-MX', // 默认西班牙语
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 