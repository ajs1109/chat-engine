import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";

export const accesschat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json("userId param not sent with request");
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.status(200).json({ isChat });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(fullChat);
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
};

export const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).json(results);
      });
  } catch (error) {
    res.status(401).json(error.message);
  }
};

export const createGroupChat = async (req, res) => {
  if (!req.body.name || !req.body.newusers) {
    return res.status(400).json({ message: "Please Fill all the fields" });
  }
  var users = JSON.parse(req.body.newusers);
  if (users.length < 2) {
    return res
      .status(400)
      .json({message : "More than two users are required to form a group chat"});
  }
  users.push(req.user);
  console.log(users)

  try{
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({_id: groupChat._id})
    .populate("users","-password")
    .populate("groupAdmin","-password")

    res.status(200).json({fullGroupChat})
  }catch(err){
    res.status(400).json({message:"Something went wrong. Please try again"})
  }
};
