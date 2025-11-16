import Restaurant from "../schema/Restaurant.schema.js";

const createRestaurant = async (data) => {
  return await Restaurant.create(data);
};

const fetchRestaurantById = async (id) => {
  return await Restaurant.findById(id);
};

const fetchAllRestaurants = async () => {
  return await Restaurant.find();
};

const fetchRestaurantByName = async (name) => {
  return await Restaurant.find({ name: { $regex: name, $options: "i" } });
};

const fetchTopRestaurants = async () => {
  return await Restaurant.find().sort({ average_rating: -1 }).limit(10);
};

const updateRestaurantById = async (id, data) => {
  return await Restaurant.findByIdAndUpdate(id, data, { new: true });
};

const deleteRestaurantById = async (id) => {
  return await Restaurant.findByIdAndDelete(id);
};

export {
  createRestaurant,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurantById,
  deleteRestaurantById,
};
