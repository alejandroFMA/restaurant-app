import Review from "../schema/Review.schema.js";
import User from "../schema/User.schema.js";
import Restaurant from "../schema/Restaurant.schema.js";
import { updateRestaurantAvgRating } from "../service/ReviewService.js";

const createReview = async (user, data) => {
  const { restaurant, rating, review } = data;
  if (!user || !restaurant || !rating) {
    throw new Error("User, restaurant, and rating are required");
  }

  const [userExists, restaurantExists] = await Promise.all([
    User.findById(user),
    Restaurant.findById(restaurant),
  ]);
  if (!userExists) throw new Error("User not found");
  if (!restaurantExists) throw new Error("Restaurant not found");

  const existing = await Review.findOne({ user, restaurant });
  if (existing) {
    throw new Error("User has already reviewed this restaurant");
  }

  const savedReview = await Review.create({ user, restaurant, rating, review });

  await updateRestaurantAvgRating(restaurant);
  return savedReview;
};

const fetchAllReviewsForRestaurant = async (restaurantId) => {
  if (!restaurantId) throw new Error("Restaurant ID is required");

  const reviews = await Review.find({ restaurant: restaurantId }).populate(
    "user",
    "username"
  );
  return reviews;
};

const fetchAllReviewsByUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const reviews = await Review.find({ user: userId }).populate(
    "restaurant",
    "name"
  );
  return reviews;
};

const updateReview = async (reviewId, data) => {
  if (!reviewId) throw new Error("Review ID is required");

  const review = await Review.findByIdAndUpdate(reviewId, data, { new: true });
  if (!review) throw new Error("Review not found");

  await updateRestaurantAvgRating(review.restaurant);
  return review;
};

const deleteReview = async (reviewId) => {
  if (!reviewId) throw new Error("Review ID is required");

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  await Review.findByIdAndDelete(reviewId);
  await updateRestaurantAvgRating(review.restaurant);

  return { message: "Review deleted successfully" };
};

export {
  createReview,
  fetchAllReviewsForRestaurant,
  fetchAllReviewsByUser,
  updateReview,
  deleteReview,
};
