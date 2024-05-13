import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

export const generateRefreshToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.REFRESH_SECRET || "", {
    expiresIn: "30d",
  });
};

export const generateAccessToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "", {
    expiresIn: "2h",
  });
};

export default { generateRefreshToken, generateAccessToken };
