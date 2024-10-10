import express from "express";
import { getBalance, transferFunds } from "../controller/account.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/getbalance").get(authMiddleware, getBalance);
router.route("/transferfund").post(authMiddleware, transferFunds);

export default router;
