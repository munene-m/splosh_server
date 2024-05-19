import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  prefix: process.env.API_PREFIX,
  databaseUri: process.env.MONGO_URI,
};

export default config;
