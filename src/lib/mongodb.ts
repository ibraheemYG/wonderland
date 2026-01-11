import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI as string;

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // عدد الاتصالات المتزامنة
      serverSelectionTimeoutMS: 5000, // وقت انتظار اختيار السيرفر
      socketTimeoutMS: 45000, // وقت انتظار العمليات
    };

    cached.mongoose.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongoose) => mongoose)
      .catch((error) => {
        throw error;
      });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
}

export default connectDB;
