import express from "express";
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  getFavouriteRestaurants,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/users/email/:email", async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/username/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/:id/favourites", async (req, res) => {
  try {
    const favourites = await getFavouriteRestaurants(req.params.id);
    res.json(favourites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
