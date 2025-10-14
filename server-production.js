const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const assistantRoutes = require('./routes/assistant');
const apiRoutes = require('./routes/api');
const telegramBot = require('./services/telegramBot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      scriptSrc: ["'self'", "https://telegram.org"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org"],
      frameSrc: ["'self'", "https://telegram.org"]
    }
  }
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main WebApp page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Database connection and server start
async function startServer() {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await db.connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.log('⚠️ Database connection failed, running in limited mode:', dbError.message);
      console.log('📝 Some features may not work without database');
    }
    
    // Initialize Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
      telegramBot.init();
      console.log('✅ Telegram bot initialized');
    } else {
      console.log('⚠️ Telegram bot token not provided');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 KЁLTISON Mini App server running on port ${PORT}`);
      console.log(`📱 WebApp URL: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}`);
      console.log(`🔧 Admin Panel: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/admin`);
      console.log(`❤️ Health Check: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/health`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🌐 Production mode enabled');
      } else {
        console.log('🔧 Development mode enabled');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await db.close();
  } catch (error) {
    console.error('Error closing database:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await db.close();
  } catch (error) {
    console.error('Error closing database:', error);
  }
  process.exit(0);
});

startServer();
