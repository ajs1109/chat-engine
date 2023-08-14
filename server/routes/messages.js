import express from "express"
import {getMessages, sendMessage} from "../controllers/messageController.js"

import auth from "../Middleware/authMiddleware.js"

const router = express.Router();
router.post('/sendMessage',auth,sendMessage);
router.get('/getMessages/:chatId',getMessages);

export default router;
