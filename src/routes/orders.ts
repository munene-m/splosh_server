import { initiateOrder } from "../controllers/orders";
import express from "express";
import authProtect from "../middleware/authMiddleware";

const router = express.Router();

router.route("/initiate").post(authProtect, initiateOrder);

export default router;
