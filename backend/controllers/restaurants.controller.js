const restaurants = require("../db/restaurants.json");

const fetchAllRestaurants = (req, res) => {
  res.json(restaurants);
};

module.exports = {
  fetchAllRestaurants,
};
