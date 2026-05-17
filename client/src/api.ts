import axios from 'axios';

// Use relative /api so Vite's proxy forwards to Express on port 5000.
// This also works in production when frontend and backend share the same origin.
const api = axios.create({ baseURL: '/api', withCredentials: true });

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
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
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
