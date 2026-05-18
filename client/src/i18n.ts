import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ur from './locales/ur.json';
import ar from './locales/ar.json';
import pa from './locales/pa.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = ['en', 'ur', 'ar', 'pa', 'hi', 'bn', 'zh'] as const;
export type SupportedLang = typeof SUPPORTED_LANGUAGES[number];
export const RTL_LANGUAGES: SupportedLang[] = ['ur', 'ar'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
      ar: { translation: ar },
      pa: { translation: pa },
      hi: { translation: hi },
      bn: { translation: bn },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18n_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
