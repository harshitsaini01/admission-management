import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import centerRoutes from "./routes/centerRoutes";
import studentRoutes from "./routes/studentRoutes";
import path from "path";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Add to .env
const NODE_ENV = process.env.NODE_ENV || "development";

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing!");
  process.exit(1);
}

app.use(
  cors({
    origin: NODE_ENV === "production" ? "https://your-frontend-domain.com" : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB Connection
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

// Middleware to verify JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    (req as any).user = user; // Attach user to request
    next(); // Proceed to the next middleware/route handler
  });
};

// Login endpoint
app.post("/api/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  // Super Admin Login
  if (username === "harshit01" && password === "harshit@123") {
    const token = jwt.sign({ role: "superadmin", username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: "superadmin" });
    return;
  }

  // Admin Login (Center-based)
  try {
    const center = await mongoose.model("Center").findOne({ code: username, password });
    if (center) {
      const token = jwt.sign(
        { role: "admin", centerId: center._id, university: center.university },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token, role: "admin" });
      return;
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error: any) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// Routes
app.use("/api/centers", authenticateToken, centerRoutes);
app.use("/api/students", authenticateToken, studentRoutes);

app.get("/", (req: Request, res: Response): void => {
  res.send(`✅ API is running in ${NODE_ENV} mode...`);
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
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