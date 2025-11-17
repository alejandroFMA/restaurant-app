import api from "./config";

export const fetchAllUsers = async () => {
  const response = await api.get(`/users`);
  return response.data;
};

export const fetchUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const fetchUserByEmail = async (email) => {
  const response = await api.get(`/users/email/${email}`);
  return response.data;
};

export const fetchUserByUsername = async (username) => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

export const fetchFavouriteRestaurants = async (userId) => {
  const response = await api.get(`/users/${userId}/favourites`);
  return response.data;
};

export const updateUserById = async (id, user) => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUserById = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
