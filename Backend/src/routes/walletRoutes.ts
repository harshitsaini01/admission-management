import express, { Request, Response, NextFunction } from "express";
import Wallet from "../models/Wallet";
import Center from "../models/Center";
import fs from "fs";
import path from "path";
import multer from "multer";
import config from "../config";

const router = express.Router();

// Helper function to get the correct protocol
const getBaseUrl = (req: Request): string => {
  // Check if the request is forwarded from HTTPS
  const isHttps = req.headers['x-forwarded-proto'] === 'https' || 
                  req.headers['x-forwarded-ssl'] === 'on' ||
                  req.secure;
  
  const protocol = isHttps ? 'https' : req.protocol;
  const host = req.get('host') || req.get('x-forwarded-host') || 'localhost';
  
  return `${protocol}://${host}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads"); // Adjusted to root uploads directory
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
});

// Middleware to check if user is superadmin
const isSuperadmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmins can perform this action" });
    return;
  }
  next();
};

// POST /api/wallet/recharge - Create a new recharge request (multipart/form-data)
const rechargeWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    upload.single("paySlip")(req, res, async (err: any) => {
      if (err) {
        console.error("Multer error:", err.message);
        res.status(400).json({ message: err.message || "Failed to upload pay slip image" });
        return;
      }

      const {
        centerCode,
        centerName,
        beneficiary,
        paymentType,
        accountHolderName,
        amount,
        transactionId,
        transactionDate,
        addedOn,
        status,
      } = req.body;

      if (!req.file) {
        res.status(400).json({ message: "Pay slip image is required" });
        return;
      }

      const center = await Center.findOne({ code: centerCode });
      if (!center) {
        fs.unlinkSync(req.file.path);
        res.status(400).json({ message: "Invalid center code" });
        return;
      }

      const rechargeData = new Wallet({
        centerId: center._id,
        centerCode,
        centerName,
        beneficiary,
        paymentType,
        accountHolderName,
        amount: parseFloat(amount),
        transactionId,
        transactionDate: new Date(transactionDate),
        paySlip: req.file.filename,
        addedOn: addedOn ? new Date(addedOn) : new Date(),
        status: status || "Pending",
      });

      await rechargeData.save();
      res.status(201).json({ message: "Recharge request submitted successfully", data: rechargeData });
    });
  } catch (error: any) {
    console.error("Error in rechargeWallet:", error);
    res.status(500).json({ message: "Failed to process recharge request", error: error.message });
  }
};

// GET /api/wallet/recharge - Fetch all recharge requests (filtered for admins)
const getRechargeRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { centerId } = req.query;

    const query = user.role === "admin" ? { centerId: user.centerId } : centerId ? { centerId } : {};

    const rechargeRequests = await Wallet.find(query);
    res.status(200).json(rechargeRequests);
  } catch (error: any) {
    console.error("Error in getRechargeRequests:", error);
    res.status(500).json({ message: "Failed to fetch recharge requests", error: error.message });
  }
};

// PATCH /api/wallet/recharge/:id/status - Update the status of a recharge request (superadmin only)
const updateRechargeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const rechargeRequest = await Wallet.findById(id);
    if (!rechargeRequest) {
      res.status(404).json({ message: "Recharge request not found" });
      return;
    }

    const center = await Center.findById(rechargeRequest.centerId);
    if (!center) {
      res.status(400).json({ message: "Center not found" });
      return;
    }

    // Handle wallet balance changes based on status transitions
    if (status === "Approved" && rechargeRequest.status !== "Approved") {
      // Adding amount: only when changing TO approved from non-approved status
      center.walletBalance = (center.walletBalance || 0) + rechargeRequest.amount;
      await center.save();
    } else if (status !== "Approved" && rechargeRequest.status === "Approved") {
      // Removing amount: when changing FROM approved to non-approved status
      center.walletBalance = Math.max(0, (center.walletBalance || 0) - rechargeRequest.amount);
      await center.save();
    }

    rechargeRequest.status = status;
    await rechargeRequest.save();

    res.status(200).json({ message: "Status updated successfully", data: rechargeRequest });
  } catch (error: any) {
    console.error("Error in updateRechargeStatus:", error);
    res.status(500).json({ message: "Failed to update recharge status", error: error.message });
  }
};

// GET /api/wallet/centers - Fetch all centers for superadmin (for center selection)
const getAllCenters = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (user.role !== "superadmin") {
      res.status(403).json({ message: "Only superadmins can access all centers" });
      return;
    }

    const centers = await Center.find({}, 'code name university walletBalance').sort({ code: 1 });
    res.status(200).json(centers);
  } catch (error: any) {
    console.error("Error in getAllCenters:", error);
    res.status(500).json({ message: "Failed to fetch centers", error: error.message });
  }
};

// Routes
router.get("/centers", getAllCenters);
router.post("/recharge", rechargeWallet);
router.get("/recharge", getRechargeRequests);
router.patch("/recharge/:id/status", isSuperadmin, updateRechargeStatus);

export default router;