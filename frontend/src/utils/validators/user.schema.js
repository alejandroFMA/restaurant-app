import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine(
      (val) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]+$/.test(val),
      "Password must include a number and a special character (!@#$%^&*)"
    ),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine(
      (val) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]+$/.test(val),
      "Password must include a number and a special character (!@#$%^&*)"
    ),
});
