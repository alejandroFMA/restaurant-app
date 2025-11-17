import { param } from "express-validator";
import mongoose from "mongoose";

export const validateObjectIdParam = (fieldName = "id") => {
  return param(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${fieldName} format`);
      }
      return true;
    });
};
