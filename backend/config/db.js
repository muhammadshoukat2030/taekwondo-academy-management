import mongoose from 'mongoose';

/**
 * Global connection cache for Mongoose across serverless function invocations (Vercel).
 * In serverless environments, warm containers are reused across requests.
 * Reusing an existing connection avoids socket exhaustion and MongoDB Atlas connection limits.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse existing active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      const errorMsg = '❌ [FATAL] MONGODB_URI is not set in environment variables! Please configure your MongoDB Atlas connection string in the Vercel Dashboard.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.warn('⚠️ MONGODB_URI missing. Falling back to local mongodb://127.0.0.1:27017/almurtaza_taekwondo');
  }

  const connectionString = mongoUri || 'mongodb://127.0.0.1:27017/almurtaza_taekwondo';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,           // Fail fast instead of buffering operations indefinitely on disconnect
      maxPoolSize: 10,                 // Optimal pool size for serverless functions
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if connection cannot be established
      socketTimeoutMS: 45000           // Close inactive sockets after 45s
    };

    cached.promise = mongoose.connect(connectionString, opts).then((m) => {
      console.log(`🥋 [MongoDB Connected]: ${m.connection.host}/${m.connection.name}`);
      return m;
    }).catch((err) => {
      console.error(`❌ [MongoDB Connection Error]: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;
