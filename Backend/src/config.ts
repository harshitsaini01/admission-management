import dotenv from "dotenv";

dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
};

// Log the JWT_SECRET to confirm it's loaded correctly
console.log("JWT_SECRET in config.ts:", config.JWT_SECRET);

if (!config.JWT_SECRET || config.JWT_SECRET === "your-secret-key") {
  console.warn("⚠️ JWT_SECRET is not set or is using default value. Please set a secure key in .env!");
}

if (!config.MONGO_URI) {
  console.error("❌ MongoDB URI is missing in .env file!");
  process.exit(1);
}

export default config;