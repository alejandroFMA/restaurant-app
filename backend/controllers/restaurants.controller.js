import Restaurant from "../models/Restaurant.model.js";

const createRestaurant = async (data) => {
  try {
    const {
      name,
      neighborhood,
      address,
      latlng,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    } = data;

    if (
      !name ||
      !neighborhood ||
      !address ||
      !latlng ||
      !image ||
      !cuisine_type ||
      !operating_hours ||
      !photograph
    ) {
      throw new Error("All restaurant fields are required");
    }

    const newRestaurant = new Restaurant({
      name,
      neighborhood,
      address,
      latlng,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    });

    const savedRestaurant = await newRestaurant.save();
    return savedRestaurant;
  } catch (error) {
    throw new Error("Error creating restaurant: " + error.message);
  }
};

const fetchRestaurantById = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    return restaurant;
  } catch (error) {
    throw new Error("Error fetching restaurant: " + error.message);
  }
};

const fetchAllRestaurants = async () => {
  try {
    const restaurants = await Restaurant.find();
    return restaurants;
  } catch (error) {
    throw new Error("Error fetching restaurants: " + error.message);
  }
};

export { createRestaurant, fetchRestaurantById, fetchAllRestaurants };
