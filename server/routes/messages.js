import express from "express";
import auth from "../Middleware/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();
router.post("/sendMessage", auth, sendMessage);
router.get("/getMessages/:chatId", auth, getMessages);

export default router;

