# BloodBridge (Blood Donation & Emergency Broadcast Coordination)

BloodBridge is an emergency blood broadcast and donor coordination platform built on the MERN stack with real-time Socket.IO, OSRM road travel distance & ETA calculation, atomic backup responder pools, and interactive Swagger API documentation.

## Key Features

- **Role-less Community Member Model:** Users register with basic details, phone number, and blood group without static home addresses because donors travel dynamically.
- **Targeted Medical Emergency Broadcast:** Targeted broadcasts to eligible donors based on medical RBC compatibility (including universal donors $O^-$ and universal recipients $AB^+$) and 90-day cooldown enforcement.
- **One-Time Location Confirmation (Zero Continuous Tracking):** Preserves donor privacy and battery. Real-world driving distance and travel duration are calculated once upon confirmation via OSRM (with Haversine fallback).
- **Atomic Backup Responder Pool:** Automatically assigns confirmed donors into primary and backup slots, auto-promoting the best backup responder if a primary donor withdraws.
- **Real-Time Coordination & In-App Chat:** Socket.IO rooms for broadcast alerts, live pool updates, and in-app coordination between donors and requesters.
- **Interactive Swagger Documentation:** Complete OpenAPI 3.0 specification served directly at `/api-docs`.

---

## Architecture & Project Structure

```text
blood_matching/
├── BloodBridge.docx             # Consolidated project documentation
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   └── requestController.js # Emergency broadcast, OSRM ETA, pool ranking
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT Bearer guard
│   │   │   └── validateMiddleware.js# Joi validation runner
│   │   ├── models/
│   │   │   ├── BloodRequest.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── RequestResponse.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── requestRoutes.js
│   │   ├── sockets/
│   │   │   └── socketHandler.js     # Socket.IO connection & room handlers
│   │   ├── swagger/
│   │   │   ├── swagger.js           # Swagger UI setup loader
│   │   │   └── swagger.yml          # OpenAPI 3.0 specification
│   │   ├── validations/
│   │   │   ├── authValidation.js
│   │   │   ├── chatValidation.js
│   │   │   └── requestValidation.js
│   │   └── server.js                # Express & Socket.IO server entry
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas)

### 2. Setup Environment Variables
Navigate to `server/` and create a `.env` file from `.env.example`:
```bash
cp server/.env.example server/.env
```

### 3. Install Dependencies & Run Server
```bash
cd server
npm install
npm run dev
```

### 4. Interactive Swagger Documentation
Open in your browser:
- **Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## License
MIT

