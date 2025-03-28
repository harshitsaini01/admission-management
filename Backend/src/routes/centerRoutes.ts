import express from "express";
import Center from "../models/Center";
import Student from "../models/Student";
import mongoose from "mongoose";
import { generateUniqueCode } from "../utils/generateUniqueCode";

const router = express.Router();

const createCenter = async (req: express.Request, res: express.Response) => {
  const user = (req as any).user;
  if (user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can create centers" });
    return;
  }

  try {
    const code = await generateUniqueCode();
    const centerData = { ...req.body, code };
    const center = new Center(centerData);
    await center.save();
    res.status(201).json({ message: "Center created successfully", center });
  } catch (error: any) {
    console.error("Error creating center:", error);
    res.status(400).json({ message: "Failed to create center", error: error.message });
  }
};

const getCenters = async (req: express.Request, res: express.Response) => {
  const user = (req as any).user;
  try {
    let centers;
    if (user.role === "superadmin") {
      centers = await Center.find();
    } else {
      centers = await Center.find({ _id: user.centerId });
    }
    res.status(200).json(centers.length ? centers : []);
  } catch (error: any) {
    console.error("Error fetching centers:", error);
    res.status(500).json({ message: "Failed to fetch centers", error: error.message });
  }
};

const getCenterByCode = async (req: express.Request, res: express.Response) => {
  const { code } = req.params;
  try {
    const center = await Center.findOne({ code });
    if (!center) {
      res.status(404).json({ message: "Center not found" });
      return;
    }
    res.status(200).json({ name: center.name });
  } catch (error: any) {
    console.error("Error fetching center by code:", error);
    res.status(500).json({ message: "Failed to fetch center", error: error.message });
  }
};

const getCenterById = async (req: express.Request, res: express.Response) => {
  const { centerId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      res.status(400).json({ message: "Invalid center ID" });
      return;
    }
    const center = await Center.findById(centerId);
    if (!center) {
      res.status(404).json({ message: "Center not found" });
      return;
    }
    res.status(200).json(center);
  } catch (error: any) {
    console.error("Error fetching center by ID:", error);
    res.status(500).json({ message: "Failed to fetch center", error: error.message });
  }
};

const updateSubCenterAccess = async (req: express.Request, res: express.Response) => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can update sub-center access" });
    return;
  }

  try {
    const { id } = req.params;
    const { subCenterAccess } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid center ID" });
      return;
    }
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

const updateStatus = async (req: express.Request, res: express.Response) => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can update status" });
    return;
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid center ID" });
      return;
    }
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

const deleteCenter = async (req: express.Request, res: express.Response) => {
  if ((req as any).user.role !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can delete centers" });
    return;
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid center ID" });
      return;
    }

    const deletedCenter = await Center.findByIdAndDelete(id);

    if (!deletedCenter) {
      res.status(404).json({ message: "Center not found" });
      return;
    }

    res.status(200).json({ message: "Center deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting center:", error);
    res.status(400).json({ message: "Failed to delete center", error: error.message });
  }
};

const getDashboardStats = async (req: express.Request, res: express.Response) => {
  const user = (req as any).user;

  try {
    const sessions = ["Jan-2024", "Jan-2025"];
    const stats: { [key: string]: { totalApplications: number; totalEnrolled: number; totalProcessed: number; totalPending: number; totalCenters: number } } = {};

    for (const session of sessions) {
      let studentsQuery = Student.find({ admissionSession: session });
      if (user.role === "admin" && user.centerId) {
        studentsQuery = studentsQuery.where("centerId").equals(user.centerId);
      }

      const students = await studentsQuery.exec();

      const totalApplications = students.length;
      const totalEnrolled = students.filter((student: any) => student.enrollmentNumber).length;
      const totalProcessed = students.filter((student: any) => student.processedOn).length;
      const totalPending = students.filter((student: any) => !student.processedOn && !student.enrollmentNumber).length;

      let totalCenters;
      if (user.role === "superadmin") {
        totalCenters = await Center.countDocuments();
      } else {
        totalCenters = user.centerId ? 1 : 0;
      }

      stats[session] = {
        totalApplications,
        totalEnrolled,
        totalProcessed,
        totalPending,
        totalCenters,
      };
    }

    res.status(200).json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

router.get("/dashboard/stats", getDashboardStats);
router.post("/", createCenter);
router.get("/", getCenters);
router.get("/code/:code", getCenterByCode);
router.get("/:centerId", getCenterById);
router.patch("/:id/subCenterAccess", updateSubCenterAccess);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteCenter);

export default router;