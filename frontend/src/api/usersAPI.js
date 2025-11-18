import api from "./config";

const fetchAllUsers = async () => {
  const response = await api.get(`/users`);
  return response.data;
};

const fetchUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

const fetchUserByEmail = async (email) => {
  const response = await api.get(`/users/email/${email}`);
  return response.data;
};

const fetchUserByUsername = async (username) => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

const fetchFavouriteRestaurants = async (userId) => {
  const response = await api.get(`/users/${userId}/favourites`);
  return response.data;
};

const updateUserById = async (id, user) => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

const deleteUserById = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

const addRestaurantToFavourites = async (restaurantId) => {
  const response = await api.post(`/users/favourites`, { restaurantId });
  return response.data;
};

const removeRestaurantFromFavourites = async (restaurantId) => {
  const response = await api.delete(`/users/favourites`, {
    data: { restaurantId },
  });
  return response.data;
};

export default {
  fetchAllUsers,
  fetchUserById,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchFavouriteRestaurants,
  updateUserById,
  deleteUserById,
  addRestaurantToFavourites,
  removeRestaurantFromFavourites,
};
