import User from "../models/User.model.js";
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
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
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
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Error logging in: " + error.message });
  }
};

export { register, login };
