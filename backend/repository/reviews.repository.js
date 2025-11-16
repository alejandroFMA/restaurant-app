import Review from "../schema/Review.schema.js";

const createReview = async (data) => {
  return await Review.create(data);
};

const fetchReviewById = async (id) => {
  return await Review.findById(id);
};

const fetchAllReviewsForRestaurant = async (restaurantId) => {
  return await Review.find({ restaurant: restaurantId }).populate(
    "user",
    "username"
  );
};

const fetchAllReviewsByUser = async (userId) => {
  return await Review.find({ user: userId });
};

const updateReviewById = async (id, data) => {
  return await Review.findByIdAndUpdate(id, data, { new: true });
};

const deleteReviewById = async (id) => {
  return await Review.findByIdAndDelete(id);
};

export {
  createReview,
  fetchReviewById,
  fetchAllReviewsForRestaurant,
  fetchAllReviewsByUser,
  updateReviewById,
  deleteReviewById,
};
