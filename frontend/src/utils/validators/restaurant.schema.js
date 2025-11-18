import { z } from "zod";

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  neighborhood: z
    .string()
    .min(1, "Neighborhood is required")
    .max(100, "Neighborhood must not exceed 100 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must not exceed 200 characters"),
  image: z
    .string()
    .url("Image must be a valid URL")
    .regex(/^https?:\/\/.+$/, "Image must be a valid HTTP/HTTPS URL"),
  cuisine_type: z
    .string()
    .min(1, "Cuisine type is required")
    .max(50, "Cuisine type must not exceed 50 characters"),
  operating_hours: z.object({
    Monday: z
      .string()
      .min(1, "Monday hours are required")
      .max(50, "Monday hours must not exceed 50 characters"),
    Tuesday: z
      .string()
      .min(1, "Tuesday hours are required")
      .max(50, "Tuesday hours must not exceed 50 characters"),
    Wednesday: z
      .string()
      .min(1, "Wednesday hours are required")
      .max(50, "Wednesday hours must not exceed 50 characters"),
    Thursday: z
      .string()
      .min(1, "Thursday hours are required")
      .max(50, "Thursday hours must not exceed 50 characters"),
    Friday: z
      .string()
      .min(1, "Friday hours are required")
      .max(50, "Friday hours must not exceed 50 characters"),
    Saturday: z
      .string()
      .min(1, "Saturday hours are required")
      .max(50, "Saturday hours must not exceed 50 characters"),
    Sunday: z
      .string()
      .min(1, "Sunday hours are required")
      .max(50, "Sunday hours must not exceed 50 characters"),
  }),
});
