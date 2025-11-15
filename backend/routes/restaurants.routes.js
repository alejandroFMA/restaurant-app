const express = require("express");
const restaurant_controller = require("../controllers/restaurants.controller");
const router = express.Router();

router.get("/restaurants", restaurant_controller.fetchAllRestaurants);

module.exports = router;
