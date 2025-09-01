const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Only require kill-port in development
let killPort;
try {
  killPort = require('kill-port');
} catch (err) {
  // kill-port not available in production - that's fine
  killPort = null;
}
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
// Removed initRuntimeConfig - external API dependency not needed for assessment
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4001;

// Middleware - Allow requests from frontend
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const startServer = async (port) => {
  try {
    // Connect to MongoDB first
    await connectDB();

    console.log('🚀 Starting optimized backend server...');
    const server = app.listen(port, () => {
      console.log(`✅ Backend running on http://localhost:${port}`);
      console.log('📋 Available endpoints:');
      console.log('   GET  /api/items?page=1&limit=10');
      console.log('   GET  /api/items?q=laptop');
      console.log('   GET  /api/stats');
      console.log('   POST /api/items');
      console.log('💡 MongoDB UI available at: http://localhost:8081');
    });

    const shutdownHandler = (signal) => {
      console.log(`\nCaught ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed. Port released.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Force exiting after timeout');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      shutdownHandler('uncaughtException');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Kill port BEFORE starting server (development only)
if (killPort) {
  killPort(PORT, 'tcp')
    .then(async () => {
      console.log(`Port ${PORT} killed. Starting fresh server...`);
      await startServer(PORT);
    })
    .catch(async (err) => {
      console.warn(
        `Port ${PORT} may not have been in use. Starting server anyway...`
      );
      await startServer(PORT);
    });
} else {
  // Production: start server directly
  console.log('🏭 Production mode: starting server directly...');
  startServer(PORT);
}
