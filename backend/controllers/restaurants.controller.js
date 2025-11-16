import {
  createRestaurant as createRestaurantRepository,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurantById,
  deleteRestaurantById,
} from "../repository/restaurants.repository.js";
import { isValidLatLng } from "../utils/checkUserFields.js";

const createRestaurant = async (req, res) => {
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
    } = req.body;

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
      return res
        .status(400)
        .json({ error: "All restaurant fields are required" });
    }

    if (!isValidLatLng(latlng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const savedRestaurant = await createRestaurantRepository({
      name,
      neighborhood,
      address,
      latlng,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    });
    res.status(201).json(savedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  const restaurantId = req.params.id;
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await fetchAllRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantByName = async (req, res) => {
  const name = req.params.name;
  try {
    if (!name) {
      return res.status(400).json({ error: "Restaurant name is required" });
    }
    const restaurant = await fetchRestaurantByName(name);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    res.status(200).json(restaurant);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching restaurant: " + error.message });
  }
};

const getTopRestaurants = async (req, res) => {
  try {
    const restaurants = await fetchTopRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  const restaurantId = req.params.id;
  const updateData = req.body;
  try {
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    const updatedRestaurant = await updateRestaurantById(
      restaurantId,
      updateData
    );
    if (!updatedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  const restaurantId = req.params.id;
  try {
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    const deletedRestaurant = await deleteRestaurantById(restaurantId);
    if (!deletedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
