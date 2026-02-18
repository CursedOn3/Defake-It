const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const detectRoutes = require('./routes/detect');
const historyRoutes = require('./routes/history');
const authRoutes = require('./routes/auth');
const { initializeEmailService, getEmailServiceStatus, shutdownEmailService } = require('./utils/emailService');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (for preview)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    const emailStatus = getEmailServiceStatus();
    res.json({ 
        status: 'ok', 
        message: 'DeepFake Detection API is running',
        services: {
            api: 'operational',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            email: emailStatus.configured ? 'configured' : 'not configured'
        },
        emailStats: emailStatus.configured ? emailStatus.stats : null
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepfake-detector';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // Initialize email service after successful DB connection
        await initializeEmailService();
    })
    .catch((err) => {
        console.log('⚠️  MongoDB connection failed:', err.message);
        console.log('📌 App will run without database (history will not be saved)');
        
        // Still try to initialize email service even if DB fails
        initializeEmailService();
    });

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║        🔍 DeepFake Detection API Server                    ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}              ║
║  📁 Uploads directory: ${uploadsDir}
║  🗄️  Database: MongoDB                                      ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('🔌 HTTP server closed');
        shutdownEmailService();
        mongoose.connection.close(false, () => {
            console.log('🗄️  MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('🔌 HTTP server closed');
        shutdownEmailService();
        mongoose.connection.close(false, () => {
            console.log('🗄️  MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;
