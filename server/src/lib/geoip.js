/**
 * IP geolocation via ipinfo.io
 * Cache: 24h per IP address (in-memory Map)
 */

const https = require('https');

const cache = new Map(); // ip → { data, cachedAt }
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Parse forwarded IP from Express request (handles proxies)
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
}

// Fetch from ipinfo.io
async function fetchGeo(ip) {
  const token = process.env.IPINFO_TOKEN;
  if (!token || token === 'your_ipinfo_token_here') return null;
  // Skip private/loopback IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) return null;

  return new Promise((resolve) => {
    const url = `https://ipinfo.io/${ip}?token=${token}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.bogon || j.error) { resolve(null); return; }
          const [lat, lon] = (j.loc || ',').split(',');
          resolve({
            ip: j.ip,
            country: j.country,       // ISO-2 e.g. "US"
            countryName: j.org ? undefined : j.country, // ipinfo doesn't return full name directly
            city: j.city,
            region: j.region,
            latitude: lat ? parseFloat(lat) : null,
            longitude: lon ? parseFloat(lon) : null,
            timezone: j.timezone,
            isp: j.org,               // "AS12345 ISP Name"
          });
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function lookup(ip) {
  if (!ip) return null;
  const cached = cache.get(ip);
  if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL) return cached.data;
  const data = await fetchGeo(ip);
  if (data) cache.set(ip, { data, cachedAt: Date.now() });
  return data;
}

// Country code → currency code mapping (top trading partners + Gulf)
const COUNTRY_CURRENCY = {
  PK: 'PKR', US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', NL: 'EUR',
  CA: 'CAD', AU: 'AUD', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD',
  OM: 'OMR', BH: 'BHD', IN: 'INR', BD: 'BDT', MY: 'MYR', SG: 'SGD',
  JP: 'JPY', CN: 'CNY', ZA: 'ZAR', EG: 'EGP', TR: 'TRY', NG: 'NGN',
};

function currencyForCountry(countryCode) {
  return COUNTRY_CURRENCY[countryCode] || 'USD';
}

module.exports = { lookup, getClientIp, currencyForCountry };
