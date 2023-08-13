import express  from "express";
import auth from "../Middleware/authMiddleware.js";
import { accesschat, createGroupChat, fetchChats } from "../controllers/chatController.js";

const router = express.Router();
router.post('/createChat',auth,accesschat);
router.get('/fetchChats',auth,fetchChats);
router.post('/createGroupChat',auth,createGroupChat);

export default router;