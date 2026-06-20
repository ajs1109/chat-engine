import { Chat } from "../models/chatModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";

export const sendMessage = async (req, res) => {
  const { content, chatId, attachments = [] } = req.body;

  if ((!content && attachments.length === 0) || !chatId) {
    return res.status(400).json({ message: "Invalid message payload" });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    attachments,
    chat: chatId,
  };

  try {
    const chat = await Chat.findOne({ _id: chatId, users: req.user._id });
    if (!chat) {
      return res.status(403).json({ message: "Access denied for this chat" });
    }

    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    return res.status(200).json(message);
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, users: req.user._id });

    if (!chat) {
      return res.status(403).json({ message: "Access denied for this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
