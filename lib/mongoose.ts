import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nextjs-todo";
    
    await mongoose.connect(MONGODB_URI);

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};