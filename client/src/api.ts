import axios from 'axios';

// In production VITE_API_URL points to the deployed backend (e.g. https://alnoor-api.vercel.app).
// In local dev it is unset so we fall back to relative /api which Vite proxies to :5000.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _isRefreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  _refreshQueue.forEach(cb => cb(newToken));
  _refreshQueue = [];
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    // Only attempt refresh on 401, once, and not on auth endpoints themselves
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (_isRefreshing) {
        return new Promise(resolve => {
          _refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      _isRefreshing = true;
      try {
        const res = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        _refreshQueue = [];
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        _isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
