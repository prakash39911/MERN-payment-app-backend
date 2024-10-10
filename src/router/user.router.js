import Router from "express";
import {
  getAllUserDoc,
  LogIn,
  SignUp,
  updateProfile,
  getCurrentUser,
} from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/signup").post(SignUp);
router.post("/login", LogIn);
router.route("/updateprofile").patch(authMiddleware, updateProfile);
router.route("/getalluser").get(authMiddleware, getAllUserDoc);
router.route("/getcurrentuser").get(authMiddleware, getCurrentUser);

export default router;
