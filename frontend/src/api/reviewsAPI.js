import api from "./config";

export const fetchAllReviewsForRestaurant = async (restaurantId) => {
  const response = await api.get(`/reviews/restaurant/${restaurantId}`);
  return response.data;
};

export const fetchAllReviewsByUser = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

export const fetchReviewById = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const createReview = async (review) => {
  const response = await api.post(`/reviews`, review);
  return response.data;
};

export const updateReviewById = async (id, review) => {
  const response = await api.put(`/reviews/${id}`, review);
  return response.data;
};

export const deleteReviewById = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
