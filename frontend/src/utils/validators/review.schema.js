import { z } from "zod";

export const reviewSchema = z.object({
  restaurant: z
    .string()
    .min(1, "Restaurant ID is required")
    .max(100, "Restaurant ID must not exceed 100 characters"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  review: z
    .string()
    .min(1, "Review text is required")
    .max(1000, "Review must not exceed 1000 characters"),
});
