import dotenv from "dotenv";
import express from "express";
import restaurantsAPIRoute from "./routes/restaurants.routes.js";
import usersAPIRoute from "./routes/users.routes.js";
import authAPIRoute from "./routes/auth.routes.js";
import connectDB from "./config/database.js";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// routes
app.use("/api", restaurantsAPIRoute);
app.use("/api", usersAPIRoute);
app.use("/api", authAPIRoute);

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
