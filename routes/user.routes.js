import express from "express";
import { registerUser, verifyUser, loginUser, getMe, logoutUser, forgotPassword } from "../controller/user.controller.js";
import { isLoggedIn } from "../middlewares/user.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.get("/me", isLoggedIn, getMe);
router.get("/password_reset/:token", forgotPassword); 
router.get("/logout", isLoggedIn, logoutUser);
export default router