import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import centerRoutes from "./src/routes/centerRoutes";
import studentRoutes from "./src/routes/studentRoutes";
import walletRoutes from "./src/routes/walletRoutes";
import authenticateToken from "./src/middleware/auth";
import errorHandler from "./src/middleware/errorHandler";
import jwt from "jsonwebtoken";
import path from "path";
import config from "./src/config";
import fs from "fs"; // Add fs for file existence check

const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI!;
const JWT_SECRET = config.JWT_SECRET;
const NODE_ENV = config.NODE_ENV;
const CORS_ORIGIN = config.CORS_ORIGIN || "http://localhost:5174"; // Fallback to localhost:5174 for development
// Load superadmin credentials from config
const SUPERADMIN_USERNAME = config.SUPERADMIN_USERNAME;
const SUPERADMIN_PASSWORD = config.SUPERADMIN_PASSWORD;

// Determine if we're in production
const isProduction = NODE_ENV === "production";

const app = express();

// Configure CORS to allow requests from the frontend domain
app.use(
  cors({
    origin: isProduction ? CORS_ORIGIN : "http://localhost:5174", // Use CORS_ORIGIN in production
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests to /uploads and check if the file exists
app.use("/uploads", (req: Request, res: Response, next: NextFunction) => {
  const filePath = path.join(__dirname, "./uploads", req.path);
  console.log(`Request for file: ${req.path}`);
  console.log(`Looking for file at: ${filePath}`);
  if (fs.existsSync(filePath)) {
    console.log("File exists on server.");
  } else {
    console.log("File does not exist on server.");
  }
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};
connectDB();

// Login handler
const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  // Use environment variables for superadmin credentials
  if (username === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD) {
    const user = { role: "superadmin", username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Secure cookies in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // Use "none" for cross-site in production
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    console.log("Cookie set for superadmin:", { token });
    res.status(200).json({ role: "superadmin", username, message: "Login successful" });
    return;
  }

  try {
    const center = await mongoose.model("Center").findOne({ code: username, password });
    if (center) {
      const user = { role: "admin", centerId: center._id.toString(), university: center.university };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction, // Secure cookies in production (HTTPS)
        sameSite: isProduction ? "none" : "lax", // Use "none" for cross-site in production
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      console.log("Cookie set for admin:", { token });
      res.status(200).json({ role: "admin", centerId: center._id.toString(), message: "Login successful" });
      return;
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error: any) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

// Check auth handler
const checkAuthHandler = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.status(200).json({ role: user.role, username: user.username, centerId: user.centerId });
};

// Logout handler
const logoutHandler = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

app.post("/api/login", loginHandler);
app.get("/api/check-auth", authenticateToken, checkAuthHandler);
app.post("/api/logout", logoutHandler);
app.use("/api/centers", authenticateToken, centerRoutes);
app.use("/api/students", authenticateToken, studentRoutes);
app.use("/api/wallet", authenticateToken, walletRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send(`✅ API is running in ${NODE_ENV} mode...`);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});