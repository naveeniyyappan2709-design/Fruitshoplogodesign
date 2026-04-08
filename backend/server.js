require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const fruitRoutes = require('./routes/fruits');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/fruits', fruitRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MKV fruits MongoDB API is running 🍊' });
});

// Initialize database then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🍊 MKV fruits API Server`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`🔐 Admin login: admin@freshfruit.com / admin123\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
