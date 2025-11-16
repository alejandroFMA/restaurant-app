import express from "express";
import {
  createReview,
  fetchAllReviewsForRestaurant,
  fetchAllReviewsByUser,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { authorize, ownerOrAdmin } from "../middleware/authentication.js";

const router = express.Router();

router.post("/", authorize(), async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    const newReview = await createReview(payload);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/restaurant/:restaurantId", authorize(), async (req, res) => {
  try {
    const reviews = await fetchAllReviewsForRestaurant(req.params.restaurantId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:userId", authorize(), async (req, res) => {
  try {
    const reviews = await fetchAllReviewsByUser(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:reviewId", authorize(), ownerOrAdmin, async (req, res) => {
  try {
    const updatedReview = await updateReview(req.params.reviewId, req.body);
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/:reviewId", authorize(), ownerOrAdmin, async (req, res) => {
  try {
    const result = await deleteReview(req.params.reviewId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
