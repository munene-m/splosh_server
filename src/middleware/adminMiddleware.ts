import { Request, Response, NextFunction } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/users";
import rateLimit from "express-rate-limit";
import { generateAccessToken } from "../utils/refreshToken";
import { ObjectId } from "mongoose";

interface DecodedToken extends JwtPayload {
  userId: string; // Adjust the structure as needed based on your token
}

// Define a rate limit middleware for authenticated users
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Maximum requests per windowMs per user
  keyGenerator: (req) => {
    // Generate a unique key based on the user's identifier (e.g., user ID)
    if (req.user) {
      return req.user.id.toString();
    }
    // Return a default key for unauthenticated users
    return "unauthenticated";
  },
  message: "Too many requests from this user, please try again later.",
});

const adminProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as DecodedToken;

      const user = await User.findById(decoded.id).select("-password");

      if (!user || user.isAdmin === false) {
        return res.status(401).json({ error: "Unauthorized attempt" });
      }

      req.user = { id: user._id, ...user };

      if (
        req.params.customerId &&
        req.params.customerId !== user._id.toString()
      ) {
        return res.status(403).json({ error: "Forbidden attempt" });
      }

      // Apply rate limiting for authenticated users
      authLimiter(req, res, (err) => {
        if (err) {
          return res
            .status(429)
            .json({ error: "Rate limit exceeded. Try again later." });
        }
        next();
      });
    } catch (error: any) {
      // Handle errors other than TokenExpiredError
      if (error.name !== "TokenExpiredError") {
        console.log("error on customer middleware: ", error);
        return res.status(401).json({ error: "Unauthorized attempt" });
      }

      // If the error is TokenExpiredError, proceed to refresh the token
      try {
        const decoded = jwt.decode(token) as DecodedToken;
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return res.status(401).json({ error: "Unauthorized attempt" });
        }

        const newAccessToken = await refreshAccessToken(user.id);
        if (
          newAccessToken === "Login session expired. Please log in again." ||
          newAccessToken === "An error occured. Please log in again."
        ) {
          return res.status(401).json({ error: newAccessToken });
        } else {
          res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          req.user = { id: user._id, ...user };
          return next();
        }
      } catch (err) {
        console.error("Error decoding token or refreshing access token:", err);
        return res.status(401).json({ error: "Unauthorized attempt" });
      }
    }
  } else {
    return res.status(401).json({ error: "Unauthorized attempt" });
  }
};

async function refreshAccessToken(id: ObjectId): Promise<string | null> {
  try {
    console.log("Refreshing token...");

    const customer = await User.findById(id).select("-password");
    if (!customer) {
      return "An error occured. Please log in again.";
    }

    const decoded = jwt.verify(
      customer.refreshToken,
      process.env.REFRESH_SECRET as string
    ) as DecodedToken;

    const newAccessToken = generateAccessToken(decoded.id);

    return newAccessToken;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return "Login session expired. Please log in again.";
    } else {
      return "An error occured. Please log in again.";
    }
  }
}

export default adminProtect;
