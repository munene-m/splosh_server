import mongoose from "mongoose";
import config from "./index";
export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.databaseUri || "");
    console.log("MongoDB connected successfully");
  } catch (err: any) {
    console.log(err.message);
    process.exit(1);
  }
}
