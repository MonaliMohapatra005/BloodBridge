import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from './config/db.js';
import { setupSwagger } from './swagger/swagger.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';


const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Dynamic CORS Validation: Allow all localhost/127.0.0.1 ports (5173, 5174, etc.), devtunnels, and CLIENT_URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, curl, internal)
  if (origin === clientUrl) return true;
  // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, 3000)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) return true;
  // Allow local LAN IPs (e.g. 192.168.x.x, 10.x.x.x, 172.x.x.x) for mobile testing
  if (/^https?:\/\/(192\.168\.[0-9]+\.[0-9]+|10\.[0-9]+\.[0-9]+\.[0-9]+|172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]+\.[0-9]+)(:[0-9]+)?$/.test(origin)) return true;
  // Allow Devtunnels
  if (origin.endsWith('.devtunnels.ms')) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Setup Socket.IO with dynamic origin support
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to express app for access inside route handlers
app.set('io', io);
setupSocketHandlers(io);

// Security Middleware (CSP disabled for Swagger UI inline scripts & styles)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting - relaxed in development to support live dashboard polling and tests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 3000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Mount Interactive Swagger Documentation
setupSwagger(app);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BloodBridge API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    swaggerDocs: '/api-docs',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/requests', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack || err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for ${err.path}: ${err.value}`,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ServerError] Port ${PORT} is already in use.`);
    console.error(`[ServerError] Please stop any running instance or terminate the process on port ${PORT}.\n`);
    process.exit(1);
  } else {
    console.error('[ServerError] Fatal server startup error:', err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` BloodBridge Backend Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Swagger UI:  http://localhost:${PORT}/api-docs`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

export { app, server, io };
