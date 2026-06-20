import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const buildToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(
    {
      email: user.email,
      id: user._id,
    },
    secret,
    { expiresIn: "2h" }
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = buildToken(existingUser);
    const result = existingUser.toObject();
    delete result.password;

    return res.status(200).json({ result, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const signUp = async (req, res) => {
  const { fname, lname, email, password, confirmPassword } = req.body;
  const pic = req.file ? req.file.filename : null;

  if (!fname || !lname || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      name: `${fname} ${lname}`.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      pic,
    });

    const token = buildToken(result);
    const responseUser = result.toObject();
    delete responseUser.password;

    return res.status(200).json({ result: responseUser, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("name email pic");

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

