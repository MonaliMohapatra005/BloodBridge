
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { setupSwagger } from './swagger/swagger.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

// --------------------------------------------------
// ENVIRONMENT CONFIGURATION
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

connectDB();

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

// Configure allowed frontend origins in server/.env:
// CLIENT_URL=https://your-frontend.onrender.com
// ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''));

const isAllowedOrigin = (origin) => {
  // Allow requests without an Origin header (Postman, curl, mobile apps)
  if (!origin) return true;

  // Allow explicitly configured frontend origins
  if (configuredOrigins.includes(origin)) return true;

  // Allow localhost and LAN during development only
  if (NODE_ENV !== 'production') {
    // Localhost and 127.0.0.1
    if (
      /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)
    ) {
      return true;
    }

    // Local network IP addresses
    if (
      /^https?:\/\/(192\.168\.[0-9]+\.[0-9]+|10\.[0-9]+\.[0-9]+\.[0-9]+|172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]+\.[0-9]+)(:[0-9]+)?$/.test(
        origin
      )
    ) {
      return true;
    }

    // Development tunnels
    if (/^https:\/\/[a-zA-Z0-9-]+\.devtunnels\.ms$/.test(origin)) {
      return true;
    }
  }

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

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
};

// --------------------------------------------------
// SOCKET.IO CONFIGURATION
// --------------------------------------------------

const io = new SocketIOServer(server, {
  cors: corsOptions,
});

app.set('io', io);

setupSocketHandlers(io);

// --------------------------------------------------
// SECURITY MIDDLEWARE
// --------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS middleware also handles preflight OPTIONS requests
app.use(cors(corsOptions));

// --------------------------------------------------
// REQUEST BODY PARSING
// --------------------------------------------------

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: NODE_ENV === 'production' ? 300 : 3000,

  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// --------------------------------------------------
// SWAGGER DOCUMENTATION
// --------------------------------------------------

setupSwagger(app);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BloodBridge API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    swaggerDocs: '/api-docs',
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/requests', requestRoutes);

app.use('/api/requests', chatRoutes);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// CENTRALIZED ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(
    '[ServerError]',
    err.stack || err.message
  );

  if (err.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS policy.',
    });
  }

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

// --------------------------------------------------
// SERVER ERROR HANDLING
// --------------------------------------------------

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[ServerError] Port ${PORT} is already in use.`
    );

    console.error(
      `[ServerError] Stop the process using port ${PORT}.\n`
    );
  } else {
    console.error(
      '[ServerError] Fatal server startup error:',
      err
    );
  }

  process.exit(1);
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

// Bind to 0.0.0.0 for Render, Docker and network access
server.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================================');
  console.log(` BloodBridge Backend running on port ${PORT}`);
  console.log(` Environment: ${NODE_ENV}`);
  console.log(` Local:       http://localhost:${PORT}`);
  console.log(` Network:     http://0.0.0.0:${PORT}`);
  console.log(` Swagger UI:  http://localhost:${PORT}/api-docs`);
  console.log(` Health:      http://localhost:${PORT}/health`);
  console.log('=======================================================');
});

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

export { app, server, io };
