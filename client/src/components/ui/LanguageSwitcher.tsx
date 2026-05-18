import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { dropdownVariants } from '../../utils/animations';

const LANG_META: Record<string, { label: string; native: string; flag: string; rtl?: boolean }> = {
  en: { label: 'English',  native: 'English', flag: '🇬🇧' },
  ur: { label: 'Urdu',     native: 'اردو',    flag: '🇵🇰', rtl: true },
  ar: { label: 'Arabic',   native: 'العربية', flag: '🇸🇦', rtl: true },
  pa: { label: 'Punjabi',  native: 'ਪੰਜਾਬੀ',  flag: '🇮🇳' },
  hi: { label: 'Hindi',    native: 'हिन्दी',   flag: '🇮🇳' },
  bn: { label: 'Bengali',  native: 'বাংলা',   flag: '🇧🇩' },
  zh: { label: 'Chinese',  native: '中文',     flag: '🇨🇳' },
};

interface Props {
  variant?: 'dropdown' | 'flags' | 'compact';
}

export default function LanguageSwitcher({ variant = 'dropdown' }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = i18n.language || 'en';
  const meta = LANG_META[current] || LANG_META.en;

  const switchLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18n_lang', lang);
    setOpen(false);
  };

  if (variant === 'flags') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {SUPPORTED_LANGUAGES.map(lang => {
          const m = LANG_META[lang];
          return (
            <motion.button
              key={lang}
              onClick={() => switchLang(lang)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title={m.native}
              className={`text-xl leading-none p-1.5 rounded-lg transition-all ${
                current === lang
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'opacity-50 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              {m.flag}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
      >
        <span className="text-base leading-none">{meta.flag}</span>
        {variant !== 'compact' && (
          <span className="hidden sm:inline">{meta.native}</span>
        )}
        <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              variants={dropdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ transformOrigin: 'top right' }}
              className="absolute right-0 top-full mt-2 z-50 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
            >
              {SUPPORTED_LANGUAGES.map(lang => {
                const m = LANG_META[lang];
                return (
                  <button
                    key={lang}
                    onClick={() => switchLang(lang)}
                    dir={m.rtl ? 'rtl' : 'ltr'}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      current === lang
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg leading-none flex-shrink-0">{m.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{m.native}</p>
                      {m.native !== m.label && (
                        <p className="text-xs text-gray-400 truncate">{m.label}</p>
                      )}
                    </div>
                    {current === lang && <CheckCircle size={14} className="text-green-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
