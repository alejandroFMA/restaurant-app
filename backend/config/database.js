import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  try {
    await mongoose.connect(uri, {
      dbName: dbName,
    });

    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
