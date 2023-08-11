import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User does not exists" });
    if (password !== existingUser.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
      },
      "test",
      { expiresIn: "2h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const signUp = async (req, res) => {
  const { fname, lname, email, password, confirmPassword } = req.body;
  const pic = req.file ? req.file.filename : null;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const newData =[password, ...newData];

    const result = await User.create({
      name: `${fname} ${lname}`,
      email: `${email}`,
      password: `${password}`,
      pic: `${pic}`,
    });

    const token = jwt.sign(
      {
        email: result.email,
        id: result._id,
      },
      "test",
      { expiresIn: "2h" }
    );
    res.status(200).json({ result, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [      
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('name email pic');
  res.status(200).json({users});
};


