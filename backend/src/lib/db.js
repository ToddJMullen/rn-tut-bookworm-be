import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`connectDB/ connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("connectDB/error", error);
    process.exit(1); // exit with failure
  }
};
