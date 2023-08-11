import express from 'express';
import { login, signUp, allUsers } from '../controllers/usersController.js';
import multer from 'multer';
import auth from '../Middleware/authMiddleware.js';

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
router.get('/findUsers',auth,allUsers)
// router.get()

export default router