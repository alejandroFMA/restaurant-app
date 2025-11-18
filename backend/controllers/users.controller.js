import {
  fetchUserById,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchAllUsers,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
  addRestaurantToFavouritesRepository,
  removeRestaurantFromFavouritesRepository,
} from "../repository/users.repository.js";
import { fetchRestaurantById } from "../repository/restaurants.repository.js";
import User from "../schema/User.schema.js";

const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const isAdmin = req.user?.is_admin;
    const isOwnProfile = req.user?.id === userId || req.user?._id === userId;
    const includeEmail = isAdmin || isOwnProfile;

    const user = includeEmail
      ? await User.findById(userId).select("+email").populate({
          path: "favourite_restaurants",
          select: "name id",
          model: "Restaurant",
        })
      : await fetchUserById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (includeEmail) {
      const userObj = user.toObject();
      userObj.email = user.email;
      res.status(200).json(userObj);
    } else {
      res.status(200).json(user);
    }
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

const userWhiteList = ["first_name", "last_name", "username", "email"];

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
    const isAdmin = req.user?.is_admin;
    const isOwnProfile = req.user?.id === userId || req.user?._id === userId;
    if (isAdmin || isOwnProfile) {
      const userObj = user.toObject();
      userObj.email = user.email;
      res.status(200).json(userObj);
    } else {
      res.status(200).json(user);
    }
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

const addRestaurantToFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      const error = new Error("Restaurant ID is required");
      error.statusCode = 400;
      return next(error);
    }

    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const userBefore = await fetchUserById(userId);
    if (!userBefore) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const alreadyInFavourites = userBefore.favourite_restaurants?.some(
      (id) => id.toString() === restaurantId
    );

    if (alreadyInFavourites) {
      const error = new Error("Restaurant already in favourites");
      error.statusCode = 400;
      return next(error);
    }

    const user = await addRestaurantToFavouritesRepository(
      userId,
      restaurantId
    );

    res.status(200).json({
      message: "Restaurant added to favourites successfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

const removeRestaurantFromFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      const error = new Error("restaurantId is required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await removeRestaurantFromFavouritesRepository(
      userId,
      restaurantId
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Restaurant removed from favourites successfully",
      user: user,
    });
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
  addRestaurantToFavourites,
  removeRestaurantFromFavourites,
};
