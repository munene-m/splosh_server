import express from "express";
import {
  deleteUser,
  getLinks,
  getUser,
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/users";
import authProtect from "../middleware/authMiddleware";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/:id").get(getUser);
router.route("/:id").delete(authProtect, deleteUser);
router.route("/verify/:token").post(verifyUser);
router.route("/links/:userId").get(authProtect, getLinks);

export default router;
