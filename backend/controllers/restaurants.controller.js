import Restaurant from "../schema/Restaurant.schema.js";

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

    const savedRestaurant = await Restaurant.create({
      name,
      neighborhood,
      address,
      latlng,
      image,
      cuisine_type,
      operating_hours,
      photograph,
    });
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
    const restaurant = await Restaurant.findById(restaurantId);
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

const fetchRestaurantByName = async (name) => {
  try {
    if (!name) {
      throw new Error("Restaurant name is required");
    }
    const restaurant = await Restaurant.findOne({ name: name });
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    return restaurant;
  } catch (error) {
    throw new Error("Error fetching restaurant: " + error.message);
  }
};

const fetchTopRestaurants = async () => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ average_rating: -1 })
      .limit(5);
    return restaurants;
  } catch (error) {
    throw new Error("Error fetching top restaurants: " + error.message);
  }
};

const updateRestaurant = async (restaurantId, updateData) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { new: true }
    );
    if (!updatedRestaurant) {
      throw new Error("Restaurant not found");
    }
    return updatedRestaurant;
  } catch (error) {
    throw new Error("Error updating restaurant: " + error.message);
  }
};

const deleteRestaurant = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!deletedRestaurant) {
      throw new Error("Restaurant not found");
    }
    return deletedRestaurant;
  } catch (error) {
    throw new Error("Error deleting restaurant: " + error.message);
  }
};

export {
  createRestaurant,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
};
