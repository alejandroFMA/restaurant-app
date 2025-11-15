import express from "express";
import { fetchAllRestaurants } from "../controllers/restaurants.controller.js";

const router = express.Router();

router.get("/", fetchAllRestaurants);

export default router;
