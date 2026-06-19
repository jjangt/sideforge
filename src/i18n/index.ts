import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ko from './locales/ko';
import en from './locales/en';
import ja from './locales/ja';
import zh from './locales/zh';

const deviceLang = getLocales()[0]?.languageCode || 'ko';
const supported = ['ko', 'en', 'ja', 'zh'];
const lng = supported.includes(deviceLang) ? deviceLang : 'ko';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
    zh: { translation: zh },
  },
  lng,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export default i18n;
