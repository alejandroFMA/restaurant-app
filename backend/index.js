import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";

import restaurantsAPIRoute from "./routes/restaurants.routes.js";
import usersAPIRoute from "./routes/users.routes.js";
import authAPIRoute from "./routes/auth.routes.js";
import reviewsAPIRoute from "./routes/reviews.routes.js";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());

// routes
app.use("/api/restaurants", restaurantsAPIRoute);
app.use("/api/users", usersAPIRoute);
app.use("/api/auth", authAPIRoute);
app.use("/api/reviews", reviewsAPIRoute);

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
