import {
  fetchRestaurantById,
  updateRestaurantById,
} from "../repository/restaurants.repository.js";
import { fetchAllReviewsForRestaurant } from "../repository/reviews.repository.js";

export const updateRestaurantAvgRating = async (restaurantId) => {
  const restaurant = await fetchRestaurantById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  const reviews = await fetchAllReviewsForRestaurant(restaurantId);
  const reviewsCount = reviews.length;
  const avgRating =
    reviewsCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

  await updateRestaurantById(restaurantId, {
    average_rating: avgRating,
    reviews_count: reviewsCount,
  });
};
