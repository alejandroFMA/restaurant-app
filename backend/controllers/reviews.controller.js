import {
  createReview as createReviewRepository,
  fetchReviewById as fetchReviewByIdRepository,
  fetchAllReviewsForRestaurant as fetchAllReviewsForRestaurantRepository,
  fetchAllReviewsByUser as fetchAllReviewsByUserRepository,
  updateReviewById as updateReviewByIdRepository,
  deleteReviewById as deleteReviewByIdRepository,
} from "../repository/reviews.repository.js";
import { updateRestaurantAvgRating } from "../service/ReviewService.js";

const createReview = async (req, res, next) => {
  try {
    const { restaurant, rating, review } = req.body;
    const userId = req.user.id;

    const savedReview = await createReviewRepository({
      user: userId,
      restaurant,
      rating,
      review,
    });

    // Update restaurant average rating after creating review
    await updateRestaurantAvgRating(restaurant);

    res.status(201).json(savedReview);
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await fetchReviewByIdRepository(reviewId);
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};
const getReviewsForRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId;
    const reviews = await fetchAllReviewsForRestaurantRepository(restaurantId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getReviewsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const reviews = await fetchAllReviewsByUserRepository(userId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await updateReviewByIdRepository(reviewId, req.body);
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      return next(error);
    }

    await updateRestaurantAvgRating(review.restaurant);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await deleteReviewByIdRepository(reviewId);
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      return next(error);
    }
    await updateRestaurantAvgRating(review.restaurant);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  createReview,
  getReviewsForRestaurant,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
};
