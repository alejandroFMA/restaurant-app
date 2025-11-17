import api from "./config";

const fetchAllRestaurants = async () => {
  const response = await api.get(`/restaurants`);
  return response.data;
};

const fetchRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

const fetchRestaurantByName = async (name) => {
  const response = await api.get(`/restaurants/name/${name}`);
  return response.data;
};

const fetchTopRestaurants = async () => {
  const response = await api.get(`/restaurants/top`);
  return response.data;
};

const createRestaurant = async (restaurant) => {
  const response = await api.post(`/restaurants`, restaurant);
  return response.data;
};

const updateRestaurant = async (id, restaurant) => {
  const response = await api.put(`/restaurants/${id}`, restaurant);
  return response.data;
};

const deleteRestaurantById = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};

export default {
  fetchAllRestaurants,
  fetchRestaurantById,
  fetchRestaurantByName,
  fetchTopRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantById,
};
