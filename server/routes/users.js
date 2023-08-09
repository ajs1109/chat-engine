import express from 'express';
import { login, signUp } from '../controllers/usersController.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profilePicture");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname );
  },
});

const upload = multer({ storage: storage });
router.post('/login',login);
router.post('/signup',upload.single('pic'),signUp);

export default router