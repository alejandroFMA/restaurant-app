import User from "../schema/User.schema.js";

const fetchUserById = async (userId) => {
  return await User.findById(userId);
};

const fetchUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

const fetchUserByUsername = async (username) => {
  return await User.findOne({ username }).select("+password");
};

const createUser = async (data) => {
  return await User.create(data);
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
  createUser,
  fetchAllUsers,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
};
