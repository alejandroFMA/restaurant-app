import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

import restaurantsAPIRoute from "./routes/restaurants.routes.js";
import usersAPIRoute from "./routes/users.routes.js";
import authAPIRoute from "./routes/auth.routes.js";
import reviewsAPIRoute from "./routes/reviews.routes.js";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/auth"),
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(morgan("dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(
          null,
          process.env.NODE_ENV === "production" ? false : true
        );
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use("/api/", limiter);
app.use(express.json());

app.use("/api/restaurants", restaurantsAPIRoute);
app.use("/api/users", usersAPIRoute);
app.use("/api/auth", authAPIRoute);
app.use("/api/reviews", reviewsAPIRoute);

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.statusCode = 404;
    return next(error);
  }
  next();
});

app.use(errorHandler);

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

if (process.env.NODE_ENV !== "test") {
  start();
}
export default app;
