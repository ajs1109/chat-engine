import express  from "express";
import auth from "../Middleware/authMiddleware.js";
import { accesschat, createGroupChat, deleteGroup, fetchChats, removeFromGroup, renameGroup } from "../controllers/chatController.js";

const router = express.Router();
router.post('/createChat',auth,accesschat);
router.get('/fetchChats',auth,fetchChats);
router.post('/createGroupChat',auth,createGroupChat);
router.put('/renameGroup',auth,renameGroup);
router.put('/removeFromGroup',auth,removeFromGroup);
router.put('/deleteGroup',auth,deleteGroup);

export default router;