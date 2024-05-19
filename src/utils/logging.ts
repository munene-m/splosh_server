import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";
import {
  MongoDBTransportInstance,
  MongoDBConnectionOptions,
} from "winston-mongodb";
const {}: { MongoDB: MongoDBTransportInstance } = require("winston-mongodb");
import winstonMongoDB from "winston-mongodb";
import config from "../config";
dotenv.config();

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Log all errors to a file
    new transports.File({ filename: "logs/combined.log" }), // Log all levels to another file
    new transports.MongoDB({
      level: "info", // Log level for this transport
      db: config.databaseUri,
      collection: "splosh-server-logs",
      options: {
        useUnifiedTopology: true,
      },
      leaveConnectionOpen: false,
      expireAfterSeconds: 2592000,
      storeHost: false,
    } as MongoDBConnectionOptions),
  ],
});

export default logger;
