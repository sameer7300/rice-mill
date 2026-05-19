/**
 * TrackingContext — geo detection, session management, page-view tracking, cookie consent.
 *
 * Geo cache: localStorage with 24h TTL so repeat visits get instant correct currency/country
 * without waiting for the async API call.
 */

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { getStoredConsent, setStoredConsent, type ConsentState } from '../components/CookieBanner';

function generateSessionId(): string {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

function getOrCreateSessionId(): string {
  const key = 'alnoor_session_id';
  let id = localStorage.getItem(key);
  if (!id) { id = generateSessionId(); localStorage.setItem(key, id); }
  return id;
}

export interface GeoData {
  detected: boolean;
  country: string | null;    // ISO-2 e.g. "US"
  countryCode: string | null;
  city: string | null;
  currency: string;          // e.g. "USD"
}

interface TrackingContextValue {
  sessionId: string;
  consent: ConsentState | null;
  geo: GeoData | null;
  geoLoading: boolean;
  applyConsent: (all: boolean) => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

const SESSION_KEY   = 'alnoor_session_registered';
export const GEO_CACHE_KEY = 'alnoor_geo_cache';
const GEO_TTL_MS    = 24 * 60 * 60 * 1000; // 24 hours

// Read cached geo from localStorage synchronously (for instant init)
function readCachedGeo(): GeoData | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt < GEO_TTL_MS) return data as GeoData;
    localStorage.removeItem(GEO_CACHE_KEY); // expired
  } catch {}
  return null;
}

function writeCachedGeo(data: GeoData) {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() })); } catch {}
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const sessionId = useRef(getOrCreateSessionId()).current;
  const location  = useLocation();
  const [consent, setConsent]   = useState<ConsentState | null>(getStoredConsent);
  // Initialise geo synchronously from localStorage cache (instant on repeat visits)
  const [geo, setGeo]           = useState<GeoData | null>(readCachedGeo);
  const [geoLoading, setGeoLoading] = useState(!readCachedGeo()); // loading only if no cache
  const pageEnterTime = useRef<number>(Date.now());
  const prevPath      = useRef<string>('');

  // --- Geo detection ---
  useEffect(() => {
    // If we already have a fresh cache, skip the API call
    if (readCachedGeo()) { setGeoLoading(false); return; }

    setGeoLoading(true);
    api.get('/tracking/geo').then(({ data }) => {
      const result: GeoData = {
        detected: data.detected,
        country:     data.countryCode || null,
        countryCode: data.countryCode || null,
        city:        data.city || null,
        currency:    data.currency || 'PKR',
      };
      setGeo(result);
      writeCachedGeo(result);
      // Notify CurrencyContext in the same tab
      window.dispatchEvent(new CustomEvent('alnoor:geo', { detail: result }));
    }).catch(() => {}).finally(() => setGeoLoading(false));
  }, []);

  // --- Register / refresh session once per browser session ---
  const registerSession = useCallback((c: ConsentState | null) => {
    api.post('/tracking/session', {
      sessionId,
      consentAnalytics: c?.analytics || false,
      consentAll:       c?.analytics && c?.marketing,
      referrer:         document.referrer || null,
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    const alreadyRegistered = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyRegistered) {
      registerSession(consent);
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, []);

  // --- Page view tracking (analytics consent required) ---
  useEffect(() => {
    if (!consent?.analytics) return;

    const path = location.pathname + location.search;
    const now  = Date.now();

    // Send duration for previous page
    if (prevPath.current && prevPath.current !== path) {
      const durationSec = Math.round((now - pageEnterTime.current) / 1000);
      api.post('/tracking/pageview', {
        sessionId, path: prevPath.current, title: document.title, durationSec,
      }).catch(() => {});
    }

    // Record current page
    api.post('/tracking/pageview', {
      sessionId, path, title: document.title, referrer: document.referrer || null,
      productId: path.startsWith('/products/') ? path.split('/products/')[1]?.split('/')[0] : null,
    }).catch(() => {});

    prevPath.current  = path;
    pageEnterTime.current = now;
  }, [location.pathname, location.search, consent?.analytics]);

  // --- Consent handler (called by CookieBanner) ---
  const applyConsent = useCallback((all: boolean) => {
    const c = setStoredConsent({ analytics: all, marketing: all });
    setConsent(c);
    api.post('/tracking/session', { sessionId, consentAnalytics: c.analytics, consentAll: c.analytics && c.marketing }).catch(() => {});
    api.post('/tracking/consent', { sessionId, analytics: c.analytics, marketing: c.marketing, all }).catch(() => {});
  }, [sessionId]);

  return (
    <TrackingContext.Provider value={{ sessionId, consent, geo, geoLoading, applyConsent }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within TrackingProvider');
  return ctx;
}
