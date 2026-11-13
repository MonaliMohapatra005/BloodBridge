import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodbridge';

  const connectWithRetry = async () => {
    try {
      console.log(`[MongoDB] Attempting to connect to: ${mongoURI}`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`[MongoDB] Connection failed: ${err.message}`);
      console.log('[MongoDB] Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
      return null;
    }
  };

  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Mongoose event: connected to database');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Mongoose event: disconnected from database');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Mongoose event error: ${err.message}`);
  });

  return await connectWithRetry();
};
