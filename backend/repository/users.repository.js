import User from "../schema/User.schema.js";

const fetchUserById = async (userId) => {
  return await User.findById(userId);
};

const fetchUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const fetchUserByUsername = async (username) => {
  return await User.findOne({ username });
};

const fetchAllUsers = async () => {
  return await User.find();
};

const fetchFavouriteRestaurants = async (userId) => {
  return await User.findById(userId).populate({
    path: "favourite_restaurants",
    select: "name -__v",
    model: "Restaurant",
  });
};

const updateUserById = async (userId, data) => {
  return await User.findByIdAndUpdate(userId, data, { new: true });
};

const deleteUserById = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export {
  fetchUserById,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchAllUsers,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
};
