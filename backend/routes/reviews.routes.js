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
import {
  createReviewValidator,
  updateReviewValidator,
} from "../middleware/validators/review.validators.js";
import { validateObjectIdParam } from "../middleware/validators/common.validators.js";
import { validationHandler } from "../middleware/validationHandler.js";

const router = express.Router();

router.post(
  "/",
  authorize(),
  createReviewValidator,
  validationHandler,
  createReview
);

router.get(
  "/restaurant/:restaurantId",
  authorize(),
  validateObjectIdParam("restaurantId"),
  validationHandler,
  getReviewsForRestaurant
);
router.get(
  "/user/:userId",
  authorize(),
  validateObjectIdParam("userId"),
  validationHandler,
  getReviewsByUser
);
router.get(
  "/:reviewId",
  authorize(),
  validateObjectIdParam("reviewId"),
  validationHandler,
  getReviewById
);
router.put(
  "/:reviewId",
  authorize(),
  ownerOrAdmin,
  validateObjectIdParam("reviewId"),
  updateReviewValidator,
  validationHandler,
  updateReview
);
router.delete(
  "/:reviewId",
  authorize(),
  ownerOrAdmin,
  validateObjectIdParam("reviewId"),
  validationHandler,
  deleteReview
);

export default router;
