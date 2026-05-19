import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api';

export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'CAD' | 'AUD' | 'OMR' | 'QAR' | 'KWD' | 'BHD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'PKR', symbol: '₨',  name: 'Pakistani Rupee',    flag: '🇵🇰' },
  { code: 'USD', symbol: '$',   name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   name: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',      flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',         flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼',   name: 'Saudi Riyal',        flag: '🇸🇦' },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',    flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',  flag: '🇦🇺' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial',         flag: '🇴🇲' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal',       flag: '🇶🇦' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar',      flag: '🇰🇼' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar',    flag: '🇧🇭' },
];

// Fallback rates (PKR base) used when API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  PKR: 1, USD: 0.00357, EUR: 0.00329, GBP: 0.00281,
  AED: 0.01311, SAR: 0.01339, CAD: 0.00487, AUD: 0.00546,
  OMR: 0.00137, QAR: 0.01300, KWD: 0.00110, BHD: 0.00134,
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode, manual?: boolean) => void;
  rates: Record<string, number>;
  symbol: string;
  info: CurrencyInfo;
  convert: (pkrAmount: number) => number;
  format: (pkrAmount: number, opts?: { compact?: boolean }) => string;
  formatRaw: (amount: number, code?: CurrencyCode) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'alnoor_currency';
const GEO_CACHE_KEY = 'alnoor_geo_cache';

function detectInitialCurrency(): CurrencyCode {
  // 1. User's explicit stored preference takes priority
  const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
  if (saved && CURRENCIES.some(c => c.code === saved)) return saved;
  // 2. Fall back to cached geo (populated by TrackingContext on first visit)
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (raw) {
      const { data } = JSON.parse(raw);
      const geoCur = data?.currency as CurrencyCode;
      if (geoCur && CURRENCIES.some(c => c.code === geoCur)) return geoCur;
    }
  } catch {}
  return 'PKR';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, _setCurrency] = useState<CurrencyCode>(detectInitialCurrency);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/currency/rates');
      if (data.rates) setRates(data.rates);
    } catch {
      // keep fallback rates
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // On first-ever visit: geo arrives async → TrackingContext fires a custom event → update currency
  useEffect(() => {
    const onGeo = (e: Event) => {
      const manualKey = 'alnoor_currency_manual';
      if (localStorage.getItem(manualKey)) return; // user picked manually
      if (localStorage.getItem(STORAGE_KEY)) return; // user has a stored preference already
      const geo = (e as CustomEvent).detail;
      const geoCur = geo?.currency as CurrencyCode;
      if (geoCur && CURRENCIES.some(c => c.code === geoCur)) {
        _setCurrency(geoCur);
        // Don't save to STORAGE_KEY — we want geo to remain the source of truth
        // until the user manually picks a currency
      }
    };
    window.addEventListener('alnoor:geo', onGeo);
    return () => window.removeEventListener('alnoor:geo', onGeo);
  }, []);

  const setCurrency = (c: CurrencyCode, manual = false) => {
    _setCurrency(c);
    localStorage.setItem(STORAGE_KEY, c);
    if (manual) localStorage.setItem('alnoor_currency_manual', '1');
  };

  const info = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const symbol = info.symbol;
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;

  const convert = (pkrAmount: number) => pkrAmount * rate;

  const format = (pkrAmount: number, opts?: { compact?: boolean }) => {
    const amount = convert(pkrAmount);
    const digits = ['KWD', 'BHD', 'OMR'].includes(currency) ? 3 : ['PKR'].includes(currency) ? 0 : 2;
    if (opts?.compact && amount >= 1000) {
      const compact = amount >= 1_000_000
        ? `${(amount / 1_000_000).toFixed(1)}M`
        : `${(amount / 1000).toFixed(1)}K`;
      return `${symbol}${compact}`;
    }
    return `${symbol}${amount.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  };

  const formatRaw = (amount: number, code?: CurrencyCode) => {
    const c = code || currency;
    const inf = CURRENCIES.find(x => x.code === c) || CURRENCIES[0];
    const digits = ['KWD', 'BHD', 'OMR'].includes(c) ? 3 : c === 'PKR' ? 0 : 2;
    return `${inf.symbol}${amount.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, symbol, info, convert, format, formatRaw, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
