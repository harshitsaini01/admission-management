import express, { Request, Response, NextFunction, RequestHandler } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import centerRoutes from "./routes/centerRoutes";
import studentRoutes from "./routes/studentRoutes";
import jwt from "jsonwebtoken";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing in .env file!");
  process.exit(1);
}

if (!JWT_SECRET || JWT_SECRET === "your-secret-key") {
  console.warn("⚠️ JWT_SECRET is not set or is using default value. Please set a secure key in .env!");
}

app.use(
  cors({
    origin: "http://localhost:5173", // Hardcode for dev
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};
connectDB();

const authenticateToken: RequestHandler = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Received cookies:", req.cookies); // Debug log
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    (req as any).user = user;
    next();
  });
};

const loginHandler: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  if (username === "harshit01" && password === "harshit@123") {
    const user = { role: "superadmin", username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Force false for dev
      sameSite: "lax", // Lax for dev
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    console.log("Cookie set for superadmin:", { token }); // Debug log
    res.status(200).json({ role: "superadmin", message: "Login successful" });
    return;
  }

  try {
    const center = await mongoose.model("Center").findOne({ code: username, password });
    if (center) {
      const user = { role: "admin", centerId: center._id.toString(), university: center.university };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      console.log("Cookie set for admin:", { token }); // Debug log
      res.status(200).json({ role: "admin", centerId: center._id.toString(), message: "Login successful" });
      return;
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error: any) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

const logoutHandler: RequestHandler = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

app.post("/api/login", loginHandler);
app.post("/api/logout", logoutHandler);
app.use("/api/centers", authenticateToken, centerRoutes);
app.use("/api/students", authenticateToken, studentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send(`✅ API is running in ${NODE_ENV} mode...`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.stack || err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});