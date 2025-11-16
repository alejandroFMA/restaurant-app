import Restaurant from "../models/Restaurant.model.js";
import Review from "../models/Review.model.js";

export const updateRestaurantAvgRating = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  const reviews = await Review.find({ restaurant: restaurantId });
  const reviewsCount = reviews.length;
  const avgRating =
    reviewsCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

  restaurant.average_rating = avgRating;
  restaurant.reviews_count = reviewsCount;
  await restaurant.save();
};
