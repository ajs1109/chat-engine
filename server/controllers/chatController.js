import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";

export const accesschat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json("userId param not sent with request");
  }

  let isChat = await Chat.find({
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
    return res.status(200).json({ isChat });
  }

  const chatData = {
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
    return res.status(200).json(fullChat);
  } catch (e) {
    return res.status(400).json(e.message);
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
        return res.status(200).json(results);
      });
  } catch (error) {
    return res.status(401).json(error.message);
  }
};

export const createGroupChat = async (req, res) => {
  if (!req.body.name || !req.body.newusers) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const users = JSON.parse(req.body.newusers);
  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than two users are required to form a group chat" });
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json({ fullGroupChat });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong. Please try again" });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(404).json({ message: "Chat not found" });
  }

  return res.status(200).json(removed);
};

export const deleteGroup = async (req, res) => {
  const chatId = req.body.chatId || req.body.activeChat?._id;

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  try {
    const chat = await Chat.findById(chatId).populate("users").populate("groupAdmin");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isMember = chat.users.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this group" });
    }

    const isAdmin =
      chat.groupAdmin &&
      chat.groupAdmin._id.toString() === req.user._id.toString();

    if (isAdmin) {
      const nextAdmin = chat.users.find(
        (user) => user._id.toString() !== req.user._id.toString()
      );

      if (nextAdmin) {
        chat.groupAdmin = nextAdmin._id;
      }
    }

    chat.users = chat.users.filter(
      (user) => user._id.toString() !== req.user._id.toString()
    );

    if (chat.users.length === 0) {
      await Chat.findByIdAndDelete(chat._id);
      return res.status(200).json({ message: "Group deleted" });
    }

    const updated = await chat.save();
    const populated = await Chat.findById(updated._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(populated);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

