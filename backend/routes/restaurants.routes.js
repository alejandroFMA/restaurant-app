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

const router = express.Router();

router.get("/top", authorize(), getTopRestaurants);
router.get("/name/:name", authorize(), getRestaurantByName);
router.get("/:id", authorize(), getRestaurantById);
router.get("/", authorize(), getAllRestaurants);
router.post("/", authorize("admin"), createRestaurant);
router.put("/:id", authorize("admin"), updateRestaurant);
router.delete("/:id", authorize(), deleteRestaurant);

export default router;
