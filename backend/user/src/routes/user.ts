import express from 'express';
import { loginUser, myProfile, verifyUser, getAllUser, getAUser, updateName } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

router.post("/login", loginUser)
router.post("/verify", verifyUser)
router.get("/me", isAuth, myProfile)
router.get("/user/all", isAuth, getAllUser)
router.get("/user/:id", getAUser)
router.post("/update/user", isAuth, updateName)

export { router }