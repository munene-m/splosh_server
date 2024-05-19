import { Request, Response, NextFunction } from "express";
import { Wheelspin } from "../models/wheelSpin";

export const confirmUserWheelspin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  try {
    const existingWheelSpin = await Wheelspin.findOne({ userId });
    if (existingWheelSpin) {
      return res
        .status(400)
        .json({ message: "User has already made a wheel spin" });
    }
    next();
  } catch (error) {
    console.error("Error checking wheel spin for user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
