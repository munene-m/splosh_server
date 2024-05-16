import { Request, Response } from "express";
import { User } from "../models/users";
import { hash, verify } from "@node-rs/argon2";
import { isValidEmail } from "../utils/validation";
import { sendVerificationEmail } from "../utils/sendVerificationMail";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { AffiliateLinkModel } from "../models/affiliateLink";

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password, phoneNumber, isAgent } = req.body;
  const existingUser = await User.findOne({ email, username });

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Invalid password" });
  }
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Email or username already in use." });
  }
  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  try {
    const newUser = await User.create({
      username,
      email,
      password: passwordHash,
      phoneNumber,
      isAgent,
    });
    if (newUser.email === process.env.ADMIN_EMAIL) {
      newUser.isAdmin = true;
      await newUser.save();
    }
    if (newUser) {
      await sendVerificationEmail(newUser._id, newUser.email, newUser.username);
    }

    return res.status(201).json({
      token: generateToken(newUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const validPassword = await verify(user.password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.status(200).json({
      id: user.id,
      name: user.username,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login user", error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as DecodedToken;
    const userId = decodedToken.userId;

    // Check if the user with userId exists in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user's verification token matches the received token
    if (user.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Mark the user as verified and clear the verification token
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Account successfully verified" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error when verifying user account", error });
  }
};

export const getLinks = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const links = await AffiliateLinkModel.find({ user: userId });
    return res.status(200).json(links);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured while fetching links", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the user to be deleted
    const deletedUser = await User.findOne({ _id: id });
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Delete the user from the database
    await User.deleteOne({ _id: id });

    res
      .status(200)
      .json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const generateToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });
};
