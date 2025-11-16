import {
  fetchUserById,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchAllUsers,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
} from "../repository/users.repository.js";

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) throw new Error("User ID is required");
    const user = await fetchUserById(userId);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  const email = req.params.email;
  try {
    const user = await fetchUserByEmail(email);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserByUsername = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await fetchUserByUsername(username);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userWhiteList = ["first_name", "last_name", "username"];

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) throw new Error("User ID is required");

    const filteredData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => userWhiteList.includes(key))
    );
    const user = await updateUserById(userId, filteredData);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) throw new Error("User ID is required");
    const user = await deleteUserById(userId);
    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFavouriteRestaurants = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) throw new Error("User ID is required");
    const user = await fetchFavouriteRestaurants(userId);
    if (!user) throw new Error("User not found");
    res.status(200).json(user.favourite_restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
