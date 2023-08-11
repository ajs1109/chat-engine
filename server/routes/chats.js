import express  from "express";
import auth from "../Middleware/authMiddleware.js";
import { accesschat, fetchChats } from "../controllers/chatController.js";

const router = express.Router();
router.post('/createChat',auth,accesschat);
router.get('/fetchChats',auth,fetchChats);

export default router;