import mongoose from "mongoose";

let connectionPromise = null;

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  if (isDatabaseConnected()) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not configured");
  }

  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    });
    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
export { isDatabaseConnected };
