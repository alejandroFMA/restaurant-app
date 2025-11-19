import { body, param } from "express-validator";

const validateOperatingHours = () => {
  return body("operating_hours")
    .notEmpty()
    .withMessage("Operating hours is required")
    .isObject()
    .withMessage("Operating hours must be an object")
    .custom((value) => {
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const days = Object.keys(value);

      for (const day of days) {
        if (typeof value[day] !== "string") {
          throw new Error(`Operating hours for ${day} must be a string`);
        }
      }

      return true;
    });
};

export const createRestaurantValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("neighborhood")
    .trim()
    .notEmpty()
    .withMessage("Neighborhood is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Neighborhood must be between 1 and 100 characters"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),

  body("image")
    .trim()
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("cuisine_type")
    .trim()
    .notEmpty()
    .withMessage("Cuisine type is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Cuisine type must be between 1 and 50 characters"),

  validateOperatingHours(),
];

export const getAllRestaurantsValidator = [
  param("sortby")
    .optional()
    .trim()
    .isIn([
      "name_desc",
      "name_asc",
      "average_rating_desc",
      "average_rating_asc",
      "reviews_count_desc",
      "reviews_count_asc",
    ])
    .withMessage(
      "Invalid sort option. Valid options: name_asc, name_desc, average_rating_asc, average_rating_desc, reviews_count_asc, reviews_count_desc"
    ),
];

export const updateRestaurantValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("neighborhood")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Neighborhood must be between 1 and 100 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("photograph")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Photograph must be between 1 and 100 characters"),

  body("cuisine_type")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Cuisine type must be between 1 and 50 characters"),

  body("operating_hours")
    .optional()
    .isObject()
    .withMessage("Operating hours must be an object")
    .custom((value) => {
      for (const day in value) {
        if (typeof value[day] !== "string") {
          throw new Error(`Operating hours for ${day} must be a string`);
        }
      }
      return true;
    }),
];
