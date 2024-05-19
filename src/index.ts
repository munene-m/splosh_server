import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import userRoutes from "./routes/user";
import productRoutes from "./routes/product";
import paymentRoutes from "./routes/payments";
import wheelSpinRoutes from "./routes/wheelSpin";
import { connectDB } from "./config/db";
import config from "./config";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
connectDB();

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/chpter", paymentRoutes);
app.use("/api/v1/wheel-spin", wheelSpinRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  console.log("Goodbye!");
  process.exit(0);
});
