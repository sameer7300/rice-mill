import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  name: string;
  code: string; // dial code e.g. "+92"
  iso: string;  // ISO 2-letter e.g. "PK"
  flag: string; // emoji
}

const COUNTRIES: Country[] = [
  { name: 'Pakistan',      code: '+92',  iso: 'PK', flag: '🇵🇰' },
  { name: 'UAE',           code: '+971', iso: 'AE', flag: '🇦🇪' },
  { name: 'Saudi Arabia',  code: '+966', iso: 'SA', flag: '🇸🇦' },
  { name: 'Qatar',         code: '+974', iso: 'QA', flag: '🇶🇦' },
  { name: 'Kuwait',        code: '+965', iso: 'KW', flag: '🇰🇼' },
  { name: 'Bahrain',       code: '+973', iso: 'BH', flag: '🇧🇭' },
  { name: 'Oman',          code: '+968', iso: 'OM', flag: '🇴🇲' },
  { name: 'United Kingdom',code: '+44',  iso: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: '+1',   iso: 'US', flag: '🇺🇸' },
  { name: 'Canada',        code: '+1',   iso: 'CA', flag: '🇨🇦' },
  { name: 'Germany',       code: '+49',  iso: 'DE', flag: '🇩🇪' },
  { name: 'Australia',     code: '+61',  iso: 'AU', flag: '🇦🇺' },
  { name: 'India',         code: '+91',  iso: 'IN', flag: '🇮🇳' },
  { name: 'Bangladesh',    code: '+880', iso: 'BD', flag: '🇧🇩' },
  { name: 'China',         code: '+86',  iso: 'CN', flag: '🇨🇳' },
  { name: 'Turkey',        code: '+90',  iso: 'TR', flag: '🇹🇷' },
  { name: 'Malaysia',      code: '+60',  iso: 'MY', flag: '🇲🇾' },
  { name: 'Nigeria',       code: '+234', iso: 'NG', flag: '🇳🇬' },
];

// Parse a stored full phone into { dialCode, local }
export function parsePhone(full: string): { dialCode: string; local: string } {
  if (!full) return { dialCode: '+92', local: '' };
  const found = COUNTRIES.find(c => full.startsWith(c.code));
  if (found) return { dialCode: found.code, local: full.slice(found.code.length).trim() };
  return { dialCode: '+92', local: full };
}

// Build full phone from dialCode + local
export function buildPhone(dialCode: string, local: string): string {
  return `${dialCode}${local.replace(/^0+/, '')}`;
}

interface Props {
  value: string;           // full phone e.g. "+92 3001234567"
  onChange: (full: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  defaultIso?: string;     // ISO-2 country code to auto-select dial code (e.g. "US")
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = '3001234567',
  required,
  className = '',
  inputClassName = '',
  label,
  defaultIso,
}: Props) {
  const { dialCode: initCode, local: initLocal } = parsePhone(value);
  const [dialCode, setDialCode] = useState(initCode);
  const [local, setLocal] = useState(initLocal);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Sync when parent resets the value (e.g. profile prefill)
  useEffect(() => {
    const { dialCode: c, local: l } = parsePhone(value);
    setDialCode(c);
    setLocal(l);
  }, [value]);

  // Auto-select dial code when defaultIso changes (e.g. geo detected)
  useEffect(() => {
    if (!defaultIso || local) return; // only apply if phone field is still empty
    const country = COUNTRIES.find(c => c.iso === defaultIso.toUpperCase());
    if (country && country.code !== dialCode) {
      setDialCode(country.code);
      onChange(buildPhone(country.code, local));
    }
  }, [defaultIso]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLocal = (v: string) => {
    setLocal(v);
    onChange(buildPhone(dialCode, v));
  };

  const handleSelect = (c: Country) => {
    setDialCode(c.code);
    setOpen(false);
    setSearch('');
    onChange(buildPhone(c.code, local));
  };

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRIES;

  const selected = COUNTRIES.find(c => c.code === dialCode) || COUNTRIES[0];

  const baseInput = `w-full border border-gray-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
          {label}{required && ' *'}
        </label>
      )}
      <div className="flex gap-2" ref={ref}>
        {/* Country code picker */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={`${baseInput} flex items-center gap-1.5 px-3 pr-2 cursor-pointer min-w-[90px] justify-between`}
            style={{ borderRadius: '0.75rem' }}
          >
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selected.code}</span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
                )}
                {filtered.map(c => (
                  <li key={`${c.iso}-${c.code}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                        c.code === dialCode && c.iso === selected.iso ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-gray-400 font-mono text-xs">{c.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Local number */}
        <input
          type="tel"
          inputMode="numeric"
          value={local}
          onChange={e => handleLocal(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${baseInput} px-4 flex-1 ${inputClassName}`}
        />
      </div>
    </div>
  );
}
