import {
  createReview as createReviewRepository,
  fetchReviewById as fetchReviewByIdRepository,
  fetchAllReviewsForRestaurant as fetchAllReviewsForRestaurantRepository,
  fetchAllReviewsByUser as fetchAllReviewsByUserRepository,
  updateReviewById as updateReviewByIdRepository,
  deleteReviewById as deleteReviewByIdRepository,
} from "../repository/reviews.repository.js";
import { updateRestaurantAvgRating } from "../service/ReviewService.js";

const createReview = async (req, res) => {
  try {
    const { restaurant, rating, review } = req.body;
    const userId = req.user.id;
    if (!userId || !restaurant || !rating) {
      return res
        .status(400)
        .json({ error: "User, restaurant, and rating are required" });
    }

    const savedReview = await createReviewRepository({
      user: userId,
      restaurant,
      rating,
      review,
    });
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    if (!reviewId) {
      return res.status(400).json({ error: "Review ID is required" });
    }
    const review = await fetchReviewByIdRepository(reviewId);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getReviewsForRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    const reviews = await fetchAllReviewsForRestaurantRepository(restaurantId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const reviews = await fetchAllReviewsByUserRepository(userId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    if (!reviewId) {
      return res.status(400).json({ error: "Review ID is required" });
    }
    const review = await updateReviewByIdRepository(reviewId, req.body);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await updateRestaurantAvgRating(review.restaurant);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    if (!reviewId) {
      return res.status(400).json({ error: "Review ID is required" });
    }
    const review = await deleteReviewByIdRepository(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    await updateRestaurantAvgRating(review.restaurant);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
