import express from "express";
import {
  createRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getRestaurantByName,
  getTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurants.controller.js";
import { authorize } from "../middleware/authentication.js";
import {
  createRestaurantValidator,
  updateRestaurantValidator,
} from "../middleware/validators/restaurant.validators.js";
import { validateObjectIdParam } from "../middleware/validators/common.validators.js";
import { validationHandler } from "../middleware/validationHandler.js";
import { param } from "express-validator";

const router = express.Router();

router.get("/top", authorize(), getTopRestaurants);
router.get(
  "/name/:name",
  authorize(),
  param("name").trim().notEmpty().withMessage("Restaurant name is required"),
  validationHandler,
  getRestaurantByName
);
router.get(
  "/:id",
  authorize(),
  validateObjectIdParam("id"),
  validationHandler,
  getRestaurantById
);
router.get("/", authorize(), getAllRestaurants);
router.post(
  "/",
  authorize("admin"),
  createRestaurantValidator,
  validationHandler,
  createRestaurant
);
router.put(
  "/:id",
  authorize("admin"),
  validateObjectIdParam("id"),
  updateRestaurantValidator,
  validationHandler,
  updateRestaurant
);
router.delete(
  "/:id",
  authorize(),
  validateObjectIdParam("id"),
  validationHandler,
  deleteRestaurant
);

export default router;
