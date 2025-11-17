import api from "./config";

export const fetchAllRestaurants = async () => {
  const response = await api.get(`/restaurants`);
  return response.data;
};

export const fetchRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const fetchRestaurantByName = async (name) => {
  const response = await api.get(`/restaurants/name/${name}`);
  return response.data;
};

export const fetchTopRestaurants = async () => {
  const response = await api.get(`/restaurants/top`);
  return response.data;
};

export const createRestaurant = async (restaurant) => {
  const response = await api.post(`/restaurants`, restaurant);
  return response.data;
};

export const updateRestaurant = async (id, restaurant) => {
  const response = await api.put(`/restaurants/${id}`, restaurant);
  return response.data;
};

export const deleteRestaurantById = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};
