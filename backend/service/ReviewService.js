import {
  fetchRestaurantById,
  updateRestaurantById,
} from "../repository/restaurants.repository.js";
import { fetchAllReviewsForRestaurant } from "../repository/reviews.repository.js";

export const updateRestaurantAvgRating = async (restaurantId) => {
  const restaurant = await fetchRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error("Restaurant not found");
    error.statusCode = 404;
    throw error;
  }

  const reviews = await fetchAllReviewsForRestaurant(restaurantId);
  const reviewsCount = reviews.length;
  const avgRating =
    reviewsCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

  const roundedAvgRating = Math.round(avgRating * 100) / 100;

  await updateRestaurantById(restaurantId, {
    average_rating: roundedAvgRating,
    reviews_count: reviewsCount,
  });
};
