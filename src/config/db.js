import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI environment variable");
  }
  await mongoose.connect(mongoUri);
  return mongoose.connection;
} 