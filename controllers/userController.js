import userModel from "../models/user.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY);
};

// Route for User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    // validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = generateToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route for registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check id user already registered
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already registered!" });

    // validate email and password format
    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    // hash password before saving to database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET_KEY);
      console.log("Admin logged in successfully");
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Invalid credentials" });
  }
};

export { loginUser, registerUser, adminLogin };
