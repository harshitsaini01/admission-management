import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config"; // Import the shared config

const JWT_SECRET = config.JWT_SECRET;

// Log the JWT_SECRET to confirm it's loaded correctly
console.log("JWT_SECRET in auth.ts:", JWT_SECRET);

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;
  console.log("Received token:", token);
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log("Token verification error:", err);
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    (req as any).user = user;
    next();
  });
};

export default authenticateToken;

