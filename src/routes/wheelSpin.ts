import express from "express";
import authProtect from "../middleware/authMiddleware";
import { createWheelSpinResult, getUserWins } from "../controllers/wheelSpins";
import { confirmUserWheelspin } from "../middleware/wheelspinMiddleware";
const router = express.Router();

router
  .route("/create")
  .post(authProtect, confirmUserWheelspin, createWheelSpinResult);
router.route("/:userId").get(authProtect, getUserWins);

export default router;
