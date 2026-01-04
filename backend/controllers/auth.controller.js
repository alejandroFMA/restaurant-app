import {
  createUser,
  fetchUserByEmail,
  fetchUserByUsername,
} from "../repository/users.repository.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/encryptPassword.js";

const register = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    const existingUsername = await fetchUserByUsername(username);
    if (existingUsername) {
      const error = new Error("Username already exists");
      error.statusCode = 409;
      return next(error);
    }

    const existingEmail = await fetchUserByEmail(email);
    if (existingEmail) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
    });

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User registered successfully", user: userResponse });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const errorMessage = `${field} already exists`;
      const duplicateError = new Error(errorMessage);
      duplicateError.statusCode = 409;
      return next(duplicateError);
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await fetchUserByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    const userId = user.id || user._id?.toString();

    const token = jwt.sign(
      {
        id: userId,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(200)
      .json({ message: "Login successful", user: userResponse, token });
  } catch (error) {
    next(error);
  }
};

export { register, login };
