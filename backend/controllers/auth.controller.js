import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/encryptPassword.js";
import { isValidEmail, isPasswordValid } from "../utils/checkUserFields.js";

const register = async (req, res) => {
  try {
    const data = req.body;
    const {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    } = data;

    if (!username || !email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include a number and a special character",
      });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const savedUser = await User.create({
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
    res.status(500).json({ error: "Error registering user: " + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("User logged in:", user);

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
    res.status(500).json({ error: "Error logging in: " + error.message });
  }
};

export { register, login };
