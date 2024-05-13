import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import userRoutes from "./routers/user";
import { connectDB } from "./config/db";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
connectDB();
const PORT = 5000;

app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  console.log("Goodbye!");
  process.exit(0);
});
