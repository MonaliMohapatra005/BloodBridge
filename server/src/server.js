import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { setupSwagger } from './swagger/swagger.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Universal CORS Options: Allow requests and sockets from any frontend origin (Localhost, Vercel, Netlify, Tunnels, Mobile)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins or requests with no origin (like mobile apps, curl, or Postman)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Setup Socket.IO with universal CORS
const io = new SocketIOServer(server, {
  cors: corsOptions,
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
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
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` BloodBridge Backend Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Local:       http://localhost:${PORT}`);
  console.log(` Network:     http://0.0.0.0:${PORT}`);
  console.log(` Swagger UI:  http://localhost:${PORT}/api-docs`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

export { app, server, io };
