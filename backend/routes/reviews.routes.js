import express from "express";
import {
  createReview,
  getReviewsForRestaurant,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { authorize, ownerOrAdmin } from "../middleware/authentication.js";

const router = express.Router();

router.post("/", authorize(), createReview);

router.get("/restaurant/:restaurantId", authorize(), getReviewsForRestaurant);
router.get("/user/:userId", authorize(), getReviewsByUser);
router.get("/:reviewId", authorize(), getReviewById);
router.put("/:reviewId", authorize(), ownerOrAdmin, updateReview);
router.delete("/:reviewId", authorize(), ownerOrAdmin, deleteReview);

export default router;
