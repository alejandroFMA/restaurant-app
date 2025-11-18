import { body } from "express-validator";

const validateLatLng = (fieldName = "latlng") => {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isObject()
    .withMessage(`${fieldName} must be an object`)
    .custom((value) => {
      if (typeof value.lat !== "number" || typeof value.lng !== "number") {
        throw new Error(
          `${fieldName} must have numeric lat and lng properties`
        );
      }
      if (value.lat < -90 || value.lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      if (value.lng < -180 || value.lng > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      return true;
    });
};

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

  body("latlng")
    .optional()
    .isObject()
    .withMessage("latlng must be an object")
    .custom((value) => {
      if (value.lat !== undefined) {
        if (
          typeof value.lat !== "number" ||
          value.lat < -90 ||
          value.lat > 90
        ) {
          throw new Error("Latitude must be a number between -90 and 90");
        }
      }
      if (value.lng !== undefined) {
        if (
          typeof value.lng !== "number" ||
          value.lng < -180 ||
          value.lng > 180
        ) {
          throw new Error("Longitude must be a number between -180 and 180");
        }
      }
      return true;
    }),

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
