import {
  createRestaurant as createRestaurantRepository,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurantById,
  deleteRestaurantById,
} from "../repository/restaurants.repository.js";
import { geocodeAddress } from "../utils/geocoding.js";

const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      neighborhood,
      address,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    } = req.body;

    let coordinates;
    try {
      coordinates = await geocodeAddress(address);
      console.log(`Geocoded address "${address}" to coordinates:`, coordinates);
    } catch (geocodingError) {
      const error = new Error(
        `Could not geocode address "${address}": ${geocodingError.message}. Please verify the address is correct.`
      );
      error.statusCode = 400;
      return next(error);
    }

    const savedRestaurant = await createRestaurantRepository({
      name,
      neighborhood,
      address,
      latlng: coordinates,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    });
    res.status(201).json(savedRestaurant);
  } catch (error) {
    next(error);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await fetchAllRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

const getRestaurantByName = async (req, res, next) => {
  try {
    const name = req.params.name;
    const restaurant = await fetchRestaurantByName(name);
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

const getTopRestaurants = async (req, res, next) => {
  try {
    const restaurants = await fetchTopRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    const updateData = req.body;
    const updatedRestaurant = await updateRestaurantById(
      restaurantId,
      updateData
    );
    if (!updatedRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(updatedRestaurant);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    const deletedRestaurant = await deleteRestaurantById(restaurantId);
    if (!deletedRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  createRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getRestaurantByName,
  getTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
};
