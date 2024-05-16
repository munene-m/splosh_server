import {
  initiatePayment,
  handleCallback,
  getCallbackResponse,
} from "../controllers/payments";
import express from "express";
import authProtect from "../middleware/authMiddleware";

const router = express.Router();

router.route("/initiate").post(authProtect, initiatePayment);
router.route("/callback").post(handleCallback);
router.route("/response").post(getCallbackResponse);

export default router;
