import dotenv from "dotenv";

dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  SUPERADMIN_USERNAME: process.env.SUPERADMIN_USERNAME,
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
};

export default config;