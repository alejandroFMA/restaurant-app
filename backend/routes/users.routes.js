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

router.get("/email/:email", authorize("admin"), getUserByEmail);

router.get("/username/:username", authorize(), getUserByUsername);

router.get("/:id", authorize(), getUserById);

router.get("/", authorize("admin"), getAllUsers);

router.put("/:id", authorize(), ownerOrAdmin, updateUser);

router.delete("/:id", authorize("admin"), ownerOrAdmin, deleteUser);

router.get("/:id/favourites", authorize(), getFavouriteRestaurants);

export default router;
