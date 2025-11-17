import {
  fetchUserById,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchAllUsers,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
} from "../repository/users.repository.js";

const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await fetchUserById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const getUserByEmail = async (req, res, next) => {
  const email = req.params.email;
  try {
    const user = await fetchUserByEmail(email);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await fetchAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await fetchUserByUsername(username);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const userWhiteList = ["first_name", "last_name", "username"];

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const filteredData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => userWhiteList.includes(key))
    );
    const user = await updateUserById(userId, filteredData);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await deleteUserById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getFavouriteRestaurants = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await fetchFavouriteRestaurants(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(user.favourite_restaurants);
  } catch (error) {
    next(error);
  }
};

export {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  deleteUser,
  getFavouriteRestaurants,
  getAllUsers,
};
