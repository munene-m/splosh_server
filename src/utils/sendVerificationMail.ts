import nodemailer from "nodemailer";
import { User } from "../models/users";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "node:fs";
import { ObjectId } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const transporter = nodemailer.createTransport({
//   auth: {
//     user: process.env.EMAIL_FROM,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   host: process.env.EMAIL_HOST,
//   port: 465,
// });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface Error {
  name: string;
  message: string;
  stack?: string;
}

export const sendVerificationEmail = async (
  userId: ObjectId,
  userEmail: string,
  username: string
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      let verificationToken: string | undefined;
      if (user) {
        verificationToken = jwt.sign({ userId }, process.env.JWT_SECRET || "", {
          expiresIn: "1h",
        });

        user.verificationToken = verificationToken;
        await user.save();
      }

      //   const client = userEmail.split("@")[0];
      const verificationPath = path.join(
        __dirname,
        "../client/verification.html"
      );
      const verificationTemplate = fs.readFileSync(verificationPath, "utf-8");
      const linkUrl = `${process.env.CLIENT_URL}`;
      const verificationT = `${verificationToken}`;
      const personalizedTemplate = verificationTemplate
        .replace("{{client}}", username)
        .replace("{{linkUrl}}", linkUrl)
        .replace("{{verification}}", verificationT);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: "Splosh Essence Account Verification",
        html: personalizedTemplate,
      };

      transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
        if (error) {
          console.log(error);
          reject("Failed to send account verification email");
        } else {
          console.log("Email sent: " + info.response);
          resolve("Account verification email sent");
        }
      });
    } catch (err) {
      console.log(err);
      reject("Failed to send account verification email");
    }
  });
};
