import {
  createUser,
  fetchUserByEmail,
  fetchUserByUsername,
} from "../repository/users.repository.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/encryptPassword.js";

const register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    } = req.body;
    const existingUser =
      (await fetchUserByUsername(username)) || (await fetchUserByEmail(email));
    if (existingUser) {
      const error = new Error("Username or email already exists");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser({
      username,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User registered successfully", user: userResponse });
  } catch (error) {
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
      { id: userId, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    user.password = undefined;

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    next(error);
  }
};

export { register, login };
