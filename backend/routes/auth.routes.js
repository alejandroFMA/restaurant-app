import express from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../middleware/validators/auth.validators.js";
import { validationHandler } from "../middleware/validationHandler.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validationHandler,
  register
);
router.post("/login", authLimiter, loginValidator, validationHandler, login);

export default router;
