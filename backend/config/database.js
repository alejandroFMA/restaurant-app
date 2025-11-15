import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI || "mongodb://localhost:27017/restaurant-app";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
