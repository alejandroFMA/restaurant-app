import api from "./config";

const fetchAllReviewsForRestaurant = async (restaurantId) => {
  const response = await api.get(`/reviews/restaurant/${restaurantId}`);
  return response.data;
};

const fetchAllReviewsByUser = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

const fetchReviewById = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

const createReview = async (review) => {
  const response = await api.post(`/reviews`, review);
  return response.data;
};

const updateReviewById = async (id, review) => {
  const response = await api.put(`/reviews/${id}`, review);
  return response.data;
};

const deleteReviewById = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

export default {
  fetchAllReviewsForRestaurant,
  fetchAllReviewsByUser,
  fetchReviewById,
  createReview,
  updateReviewById,
  deleteReviewById,
};
