import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n';

type Lang = 'en' | 'ur';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  isUrdu: boolean;
}

const LangContext = createContext<LangContextType>({} as LangContextType);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>((localStorage.getItem('lang') as Lang) || 'en');

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ur' : 'en');

  return (
    <LangContext.Provider value={{ lang, toggleLang, isUrdu: lang === 'ur' }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
