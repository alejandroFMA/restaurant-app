import { body } from "express-validator";
import mongoose from "mongoose";

export const createReviewValidator = [
  body("restaurant")
    .notEmpty()
    .withMessage("Restaurant ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid restaurant ID format");
      }
      return true;
    }),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("review")
    .optional()
    .isString()
    .withMessage("Review must be a string")
    .isLength({ max: 1000 })
    .withMessage("Review must not exceed 1000 characters"),
];

export const updateReviewValidator = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("review")
    .optional()
    .isString()
    .withMessage("Review must be a string")
    .isLength({ max: 1000 })
    .withMessage("Review must not exceed 1000 characters"),
];
