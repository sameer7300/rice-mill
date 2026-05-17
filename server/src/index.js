require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const millRoutes = require('./routes/millRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const financeRoutes = require('./routes/financeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { router: notificationRoutes } = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const agentRoutes = require('./routes/agentRoutes');
const shopRoutes = require('./routes/shopRoutes');
const ecommerceRoutes = require('./routes/ecommerceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const blogRoutes = require('./routes/blogRoutes');
const careerRoutes = require('./routes/careerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const addressRoutes = require('./routes/addressRoutes');
const locationRoutes = require('./routes/locationRoutes');
const { router: loyaltyRouter } = require('./routes/loyaltyRoutes');
const wholesaleRoutes = require('./routes/wholesaleRoutes');
const stockAlertRoutes = require('./routes/stockAlertRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const supplierPortalRoutes = require('./routes/supplierPortalRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const faqRoutes = require('./routes/faqRoutes');
const { setupSocket } = require('./socket');

const app = express();
app.use(cors());
app.use(express.json());

// __dirname = server/src/ so ../uploads = server/uploads/ (where multer saves files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d',
  etag: true,
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

// Rate limit AI endpoint
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { message: 'Too many AI requests, slow down.' } });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/mill', millRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', addressRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/wholesale', wholesaleRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/products', recentlyViewedRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/supplier-portal', supplierPortalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/faq', faqRoutes);
app.use('/', sitemapRoutes);

app.get('/api/health', (_, res) => res.json({ success: true, version: '3.1', app: 'Al-Noor Rice Mills' }));

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🌾 Al-Noor Rice Mills Server v3.1 running on http://localhost:${PORT}`));
