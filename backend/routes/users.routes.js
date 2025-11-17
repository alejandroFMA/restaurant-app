import express from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  getFavouriteRestaurants,
} from "../controllers/users.controller.js";
import { authorize, ownerOrAdmin } from "../middleware/authentication.js";

const router = express.Router();

// Specific routes must come before parameterized routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/email/:email", authorize("admin"), getUserByEmail);
router.get("/username/:username", authorize(), getUserByUsername);
router.get("/:id/favourites", authorize(), getFavouriteRestaurants);
router.get("/:id", authorize(), getUserById);

router.put("/:id", authorize(), ownerOrAdmin, updateUser);

router.delete("/:id", authorize("admin"), ownerOrAdmin, deleteUser);

export default router;
