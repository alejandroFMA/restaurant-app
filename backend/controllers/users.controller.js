import User from "../models/User.model.js";

const fetchUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

const fetchAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

const fetchUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error("Error fetching user by email: " + error.message);
  }
};

const fetchUserByUsername = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required");
    }
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    throw new Error("Error fetching user by username: " + error.message);
  }
};

const userWhiteList = ["first_name", "last_name", "username"];

const updateUserById = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => userWhiteList.includes(key))
    );

    const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
    });
    return updatedUser;
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

const deleteUserById = async (userId) => {
  try {
    await User.findByIdAndDelete(userId);
    return true;
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};

const fetchFavouriteRestaurants = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const user = await User.findById(userId).populate({
      path: "favourite_restaurants",
      select: "name -__v",
      model: "Restaurant",
    });

    if (!user) {
      return null;
    }

    return user.favourite_restaurants;
  } catch (error) {
    throw new Error("Error fetching favourite restaurants: " + error.message);
  }
};

export {
  fetchUserById,
  updateUserById,
  deleteUserById,
  fetchAllUsers,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchFavouriteRestaurants,
};
