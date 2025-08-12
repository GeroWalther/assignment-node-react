// Simple test to verify our optimized backend works
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Import our optimized routes
const itemsRouter = require('./src/routes/items');
const statsRouter = require('./src/routes/stats');

// Use routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Optimized backend is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Optimized Backend Server Running!');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log('📋 Endpoints:');
  console.log('   GET  /health');
  console.log('   GET  /api/items?page=1&limit=5');
  console.log('   GET  /api/items?q=laptop');
  console.log('   GET  /api/stats');
  console.log('   POST /api/items');
});
