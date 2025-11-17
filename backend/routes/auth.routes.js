import express from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
