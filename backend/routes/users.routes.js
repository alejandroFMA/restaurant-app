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
import { authorizedUser, adminOnly } from "../middleware/authentication.js";

const router = express.Router();

router.get("/email/:email", authorizedUser, async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/username/:username", authorizedUser, async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authorizedUser, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authorizedUser, adminOnly, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authorizedUser, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authorizedUser, adminOnly, async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/favourites", authorizedUser, async (req, res) => {
  try {
    const favourites = await getFavouriteRestaurants(req.params.id);
    res.json(favourites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
