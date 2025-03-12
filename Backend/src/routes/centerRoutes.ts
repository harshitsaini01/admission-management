import express, { Request, Response, RequestHandler } from "express";
import Center from "../models/Center";

const router = express.Router();

const createCenter: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can create centers" });
    return;
  }
  try {
    const center = new Center(req.body);
    await center.save();
    res.status(201).json({ message: "Center created successfully", center });
  } catch (error: any) {
    console.error("Error creating center:", error);
    res.status(400).json({ message: "Failed to create center", error: error.message });
  }
};

const getCenters: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can view all centers" });
    return;
  }
  try {
    const centers = await Center.find();
    if (!centers.length) {
      res.status(200).json([]); // Return empty array instead of 404
      return;
    }
    res.status(200).json(centers);
  } catch (error: any) {
    console.error("Error fetching centers:", error);
    res.status(500).json({ message: "Failed to fetch centers", error: error.message });
  }
};

const updateSubCenterAccess: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can update sub-center access" });
    return;
  }
  try {
    const { id } = req.params;
    const { subCenterAccess } = req.body;

    if (typeof subCenterAccess !== "boolean") {
      res.status(400).json({ message: "subCenterAccess must be a boolean" });
      return;
    }

    const updatedCenter = await Center.findByIdAndUpdate(
      id,
      { subCenterAccess },
      { new: true, runValidators: true }
    );

    if (!updatedCenter) {
      res.status(404).json({ message: "Center not found" });
      return;
    }

    res.status(200).json(updatedCenter);
  } catch (error: any) {
    console.error("Error updating sub-center access:", error);
    res.status(400).json({ message: "Failed to update sub-center access", error: error.message });
  }
};

const updateStatus: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can update status" });
    return;
  }
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== "boolean") {
      res.status(400).json({ message: "status must be a boolean" });
      return;
    }

    const updatedCenter = await Center.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedCenter) {
      res.status(404).json({ message: "Center not found" });
      return;
    }

    res.status(200).json(updatedCenter);
  } catch (error: any) {
    console.error("Error updating status:", error);
    res.status(400).json({ message: "Failed to update status", error: error.message });
  }
};

// Assign handlers to routes
router.post("/", createCenter);
router.get("/", getCenters);
router.patch("/:id/subCenterAccess", updateSubCenterAccess);
router.patch("/:id/status", updateStatus);

export default router;