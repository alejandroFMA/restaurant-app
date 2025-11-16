import express from "express";
import {
  fetchUserById,
  updateUserById,
  deleteUserById,
  fetchAllUsers,
  fetchUserByEmail,
  fetchUserByUsername,
  fetchFavouriteRestaurants,
} from "../controllers/users.controller.js";
import { authorize, ownerOrAdmin } from "../middleware/authentication.js";

const router = express.Router();

router.get("/email/:email", authorize("admin"), async (req, res) => {
  try {
    const user = await fetchUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/username/:username", authorize(), async (req, res) => {
  try {
    const user = await fetchUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authorize(), async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authorize("admin"), async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authorize(), ownerOrAdmin, async (req, res) => {
  try {
    const updatedUser = await updateUserById(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authorize("admin"), ownerOrAdmin, async (req, res) => {
  try {
    const deletedUser = await deleteUserById(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/favourites", authorize(), async (req, res) => {
  try {
    const favourites = await fetchFavouriteRestaurants(req.params.id);
    res.json(favourites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
