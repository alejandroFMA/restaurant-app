import restaurants from "../config/restaurants.json" assert { type: "json" };

export const fetchAllRestaurants = (req, res) => {
  res.json(restaurants);
};
