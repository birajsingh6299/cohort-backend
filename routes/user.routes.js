import express from "express";
import { registerUser, verifyUser, loginUser, getMe, logoutUser, forgotPassword, resetPassword } from "../controller/user.controller.js";
import { isLoggedIn } from "../middlewares/user.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.get("/me", isLoggedIn, getMe);
router.get("/logout", isLoggedIn, logoutUser);
router.post("/forgot_passsword", forgotPassword);
router.post("/password_reset/:token", resetPassword); 

export default router