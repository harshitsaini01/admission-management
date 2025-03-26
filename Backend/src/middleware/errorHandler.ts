import { Request, Response, NextFunction } from "express";
import multer from "multer";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error("❌ Error:", err.stack || err.message);
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: `Multer error: ${err.message}` });
    return;
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
};

export default errorHandler;