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
import {
  updateUserValidator,
  getUserByEmailValidator,
  getUserByUsernameValidator,
} from "../middleware/validators/user.validator.js";
import { validateObjectIdParam } from "../middleware/validators/common.validators.js";
import { validationHandler } from "../middleware/validationHandler.js";

const router = express.Router();

router.get("/", authorize("admin"), getAllUsers);
router.get(
  "/email/:email",
  authorize("admin"),
  getUserByEmailValidator,
  validationHandler,
  getUserByEmail
);
router.get(
  "/username/:username",
  authorize(),
  getUserByUsernameValidator,
  validationHandler,
  getUserByUsername
);
router.get(
  "/:id/favourites",
  authorize(),
  validateObjectIdParam("id"),
  validationHandler,
  getFavouriteRestaurants
);
router.get(
  "/:id",
  authorize(),
  validateObjectIdParam("id"),
  validationHandler,
  getUserById
);

router.put(
  "/:id",
  authorize(),
  ownerOrAdmin,
  validateObjectIdParam("id"),
  updateUserValidator,
  validationHandler,
  updateUser
);

router.delete(
  "/:id",
  authorize("admin"),
  ownerOrAdmin,
  validateObjectIdParam("id"),
  validationHandler,
  deleteUser
);

export default router;
