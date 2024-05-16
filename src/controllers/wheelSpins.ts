import { Request, Response } from "express";
import { Wheelspin } from "../models/wheelSpin";
import { User } from "../models/users";

export const createWheelSpinResult = async (req: Request, res: Response) => {
  const { userId, amountWon } = req.body;
  if (!userId || !amountWon) {
    res.status(400).json({ message: "Please enter all required fields." });
  }
  if (typeof amountWon !== "number") {
    res.status(400).json({ message: "amountWon should be a number" });
  }
  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(400).json({ message: "User does not exist." });
    }
    const newRecord = await Wheelspin.create({
      userId,
      amountWon,
    });
    res.status(201).json({ message: "Wheel spin result saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occured.", error });
  }
};

export const getUserWins = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(400).json({ message: "User does not exist." });
    }
    const wins = await Wheelspin.find();
    return res.status(200).json(wins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user's wheel spin results", error });
  }
};
