import express from "express";
import {
  createRestaurant,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurants.controller.js";
import { authorize } from "../middleware/authentication.js";

const router = express.Router();

router.get("/top", authorize(), async (req, res) => {
  try {
    const restaurants = await fetchTopRestaurants();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/name/:name", authorize(), async (req, res) => {
  try {
    const restaurant = await fetchRestaurantByName(req.params.name);
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authorize(), async (req, res) => {
  try {
    const restaurant = await fetchRestaurantById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authorize(), async (req, res) => {
  try {
    const restaurants = await fetchAllRestaurants();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authorize("admin"), async (req, res) => {
  try {
    const newRestaurant = await createRestaurant(req.body);
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authorize("admin"), async (req, res) => {
  try {
    const updatedRestaurant = await updateRestaurant(req.params.id, req.body);
    if (!updatedRestaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/:id", authorize("admin"), async (req, res) => {
  try {
    const deletedRestaurant = await deleteRestaurant(req.params.id);
    if (!deletedRestaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
