


// students.ts
import express, { Request, Response, RequestHandler, NextFunction } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Student from "../models/Student";
import Center from "../models/Center";
import ICenter from "../models/Center";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

router.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only images (jpeg, jpg, png) and PDFs are allowed"));
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

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ message: "Only admins can perform this action" });
    return;
  }
  next();
};

const generateReferenceId = async (): Promise<string> => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = () =>
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];
  const randomDigits = () => Math.floor(1000 + Math.random() * 9000).toString();

  let referenceId: string;
  let isUnique = false;

  do {
    referenceId = `${randomLetters()}${randomDigits()}`;
    const existingStudent = await Student.findOne({ referenceId });
    isUnique = !existingStudent;
  } while (!isUnique);

  return referenceId;
};

const getStudents: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      console.error("No user found in request");
      res.status(401).json({ message: "Unauthorized: No user authenticated" });
      return;
    }

    console.log("Fetching students for user:", { username: user.username, role: user.role, centerId: user.centerId });

    let students;
    if (user.role === "superadmin") {
      students = await Student.find();
    } else {
      if (!mongoose.Types.ObjectId.isValid(user.centerId)) {
        console.error("Invalid centerId:", user.centerId);
        res.status(400).json({ message: "Invalid centerId" });
        return;
      }
      students = await Student.find({ centerId: user.centerId });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const studentsWithFullPaths = students.map((student) => ({
      ...student.toJSON(),
      photo: student.photo ? `${baseUrl}/uploads/${student.photo}` : "",
      studentSignature: student.studentSignature ? `${baseUrl}/uploads/${student.studentSignature}` : "",
      addressIdProof: student.addressIdProof ? `${baseUrl}/uploads/${student.addressIdProof}` : "",
      otherDocument: student.otherDocument ? `${baseUrl}/uploads/${student.otherDocument}` : "",
      abcDebScreenshot: student.abcDebScreenshot ? `${baseUrl}/uploads/${student.abcDebScreenshot}` : "",
      highSchoolMarksheet: student.highSchoolMarksheet ? `${baseUrl}/uploads/${student.highSchoolMarksheet}` : "",
      intermediateMarksheet: student.intermediateMarksheet ? `${baseUrl}/uploads/${student.intermediateMarksheet}` : "",
      graduationMarksheet: student.graduationMarksheet ? `${baseUrl}/uploads/${student.graduationMarksheet}` : "",
      otherMarksheet: student.otherMarksheet ? `${baseUrl}/uploads/${student.otherMarksheet}` : "",
    }));

    res.status(200).json(studentsWithFullPaths);
  } catch (error: any) {
    console.error("Error in GET /api/students:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const updateStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid student ID:", id);
      res.status(400).json({ message: "Invalid student ID" });
      return;
    }

    const updates = req.body;
    const student = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const updatedStudent = {
      ...student.toJSON(),
      photo: student.photo ? `${baseUrl}/uploads/${student.photo}` : "",
      studentSignature: student.studentSignature ? `${baseUrl}/uploads/${student.studentSignature}` : "",
      addressIdProof: student.addressIdProof ? `${baseUrl}/uploads/${student.addressIdProof}` : "",
      otherDocument: student.otherDocument ? `${baseUrl}/uploads/${student.otherDocument}` : "",
      abcDebScreenshot: student.abcDebScreenshot ? `${baseUrl}/uploads/${student.abcDebScreenshot}` : "",
      highSchoolMarksheet: student.highSchoolMarksheet ? `${baseUrl}/uploads/${student.highSchoolMarksheet}` : "",
      intermediateMarksheet: student.intermediateMarksheet ? `${baseUrl}/uploads/${student.intermediateMarksheet}` : "",
      graduationMarksheet: student.graduationMarksheet ? `${baseUrl}/uploads/${student.graduationMarksheet}` : "",
      otherMarksheet: student.otherMarksheet ? `${baseUrl}/uploads/${student.otherMarksheet}` : "",
    };

    res.status(200).json(updatedStudent);
  } catch (error: any) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Failed to update student", error: error.message });
  }
};

const createStudent: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      console.error("No user found in request for POST /api/students");
      res.status(401).json({ message: "Unauthorized: No user authenticated" });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const referenceId = await generateReferenceId();
    const admDate = new Date();

    let centerId = req.body.centerId;
    let centerCode = req.body.center;
    let centerName = req.body.centerName;

    if (user.role === "admin") {
      if (!mongoose.Types.ObjectId.isValid(user.centerId)) {
        console.error("Invalid centerId for admin:", user.centerId);
        res.status(400).json({ message: "Invalid centerId" });
        return;
      }
      centerId = user.centerId;
      const center = await Center.findById(centerId);
      if (!center || center.code !== centerCode || center.name !== centerName) {
        console.error("Center mismatch for admin:", { centerId, centerCode, centerName });
        res.status(400).json({ message: "Center code or name does not match admin's center" });
        return;
      }
    } else if (user.role === "superadmin") {
      const center = await Center.findOne({ code: centerCode }) as mongoose.Document & {
        _id: mongoose.Types.ObjectId;
        code: string;
        name: string;
      } | null;
      if (!center) {
        console.error("Center not found for code:", centerCode);
        res.status(400).json({ message: "Invalid center code" });
        return;
      }
      centerId = center._id.toString();
      centerName = center.name;
    }

    const studentData = {
      ...req.body,
      centerId,
      center: centerCode,
      centerName,
      highSchoolObtainedMarks: parseFloat(req.body.highSchoolObtainedMarks) || 0,
      highSchoolMaximumMarks: parseFloat(req.body.highSchoolMaximumMarks) || 0,
      highSchoolPercentage: parseFloat(req.body.highSchoolPercentage) || 0,
      intermediateObtainedMarks: parseFloat(req.body.intermediateObtainedMarks) || 0,
      intermediateMaximumMarks: parseFloat(req.body.intermediateMaximumMarks) || 0,
      intermediatePercentage: parseFloat(req.body.intermediatePercentage) || 0,
      graduationObtainedMarks: parseFloat(req.body.graduationObtainedMarks) || 0,
      graduationMaximumMarks: parseFloat(req.body.graduationMaximumMarks) || 0,
      graduationPercentage: parseFloat(req.body.graduationPercentage) || 0,
      otherObtainedMarks: parseFloat(req.body.otherObtainedMarks) || 0,
      otherMaximumMarks: parseFloat(req.body.otherMaximumMarks) || 0,
      otherPercentage: parseFloat(req.body.otherPercentage) || 0,
      photo: files?.photo?.[0]?.filename || "",
      studentSignature: files?.studentSignature?.[0]?.filename || "",
      addressIdProof: files?.addressIdProof?.[0]?.filename || "",
      otherDocument: files?.otherDocument?.[0]?.filename || "",
      abcDebScreenshot: files?.abcDebScreenshot?.[0]?.filename || "",
      highSchoolMarksheet: files?.highSchoolMarksheet?.[0]?.filename || "",
      intermediateMarksheet: files?.intermediateMarksheet?.[0]?.filename || "",
      graduationMarksheet: files?.graduationMarksheet?.[0]?.filename || "",
      otherMarksheet: files?.otherMarksheet?.[0]?.filename || "",
      studentStatus: "Active",
      applicationStatus: "New",
      referenceId,
      admDate,
      docStatus: "Pending", // Set default
      pendingDocuments: [], // Set default
    };

    const student = new Student(studentData);
    await student.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const studentWithFullPaths = {
      ...student.toJSON(),
      photo: student.photo ? `${baseUrl}/uploads/${student.photo}` : "",
      studentSignature: student.studentSignature ? `${baseUrl}/uploads/${student.studentSignature}` : "",
      addressIdProof: student.addressIdProof ? `${baseUrl}/uploads/${student.addressIdProof}` : "",
      otherDocument: student.otherDocument ? `${baseUrl}/uploads/${student.otherDocument}` : "",
      abcDebScreenshot: student.abcDebScreenshot ? `${baseUrl}/uploads/${student.abcDebScreenshot}` : "",
      highSchoolMarksheet: student.highSchoolMarksheet ? `${baseUrl}/uploads/${student.highSchoolMarksheet}` : "",
      intermediateMarksheet: student.intermediateMarksheet ? `${baseUrl}/uploads/${student.intermediateMarksheet}` : "",
      graduationMarksheet: student.graduationMarksheet ? `${baseUrl}/uploads/${student.graduationMarksheet}` : "",
      otherMarksheet: student.otherMarksheet ? `${baseUrl}/uploads/${student.otherMarksheet}` : "",
    };

    res.status(201).json({ message: "Student application submitted successfully", student: studentWithFullPaths });
  } catch (error: any) {
    console.error("Error in POST /api/students:", error);
    res.status(500).json({ message: error.message || "Failed to create student" });
  }
};

const deleteStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid student ID:", id);
      res.status(400).json({ message: "Invalid student ID" });
      return;
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student", error: error.message });
  }
};

// New route for admins to re-upload documents
const reuploadDocuments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid student ID:", id);
      res.status(400).json({ message: "Invalid student ID" });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const updates: { [key: string]: string } = {};
    if (files?.photo?.[0]?.filename) updates.photo = files.photo[0].filename;
    if (files?.studentSignature?.[0]?.filename) updates.studentSignature = files.studentSignature[0].filename;
    if (files?.addressIdProof?.[0]?.filename) updates.addressIdProof = files.addressIdProof[0].filename;
    if (files?.otherDocument?.[0]?.filename) updates.otherDocument = files.otherDocument[0].filename;
    if (files?.abcDebScreenshot?.[0]?.filename) updates.abcDebScreenshot = files.abcDebScreenshot[0].filename;
    if (files?.highSchoolMarksheet?.[0]?.filename) updates.highSchoolMarksheet = files.highSchoolMarksheet[0].filename;
    if (files?.intermediateMarksheet?.[0]?.filename) updates.intermediateMarksheet = files.intermediateMarksheet[0].filename;
    if (files?.graduationMarksheet?.[0]?.filename) updates.graduationMarksheet = files.graduationMarksheet[0].filename;
    if (files?.otherMarksheet?.[0]?.filename) updates.otherMarksheet = files.otherMarksheet[0].filename;

    // Update the student with new files and reset docStatus to "Pending"
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { ...updates, docStatus: "Pending", pendingDocuments: [] },
      { new: true }
    );

    if (!updatedStudent) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const studentWithFullPaths = {
      ...updatedStudent.toJSON(),
      photo: updatedStudent.photo ? `${baseUrl}/uploads/${updatedStudent.photo}` : "",
      studentSignature: updatedStudent.studentSignature ? `${baseUrl}/uploads/${updatedStudent.studentSignature}` : "",
      addressIdProof: updatedStudent.addressIdProof ? `${baseUrl}/uploads/${updatedStudent.addressIdProof}` : "",
      otherDocument: updatedStudent.otherDocument ? `${baseUrl}/uploads/${updatedStudent.otherDocument}` : "",
      abcDebScreenshot: updatedStudent.abcDebScreenshot ? `${baseUrl}/uploads/${updatedStudent.abcDebScreenshot}` : "",
      highSchoolMarksheet: updatedStudent.highSchoolMarksheet ? `${baseUrl}/uploads/${updatedStudent.highSchoolMarksheet}` : "",
      intermediateMarksheet: updatedStudent.intermediateMarksheet ? `${baseUrl}/uploads/${updatedStudent.intermediateMarksheet}` : "",
      graduationMarksheet: updatedStudent.graduationMarksheet ? `${baseUrl}/uploads/${updatedStudent.graduationMarksheet}` : "",
      otherMarksheet: updatedStudent.otherMarksheet ? `${baseUrl}/uploads/${updatedStudent.otherMarksheet}` : "",
    };

    res.status(200).json({ message: "Documents re-uploaded successfully", student: studentWithFullPaths });
  } catch (error: any) {
    console.error("Error re-uploading documents:", error);
    res.status(500).json({ message: "Failed to re-upload documents", error: error.message });
  }
};

router.get("/", getStudents);
router.patch("/:id", isSuperadmin, updateStudent);
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "studentSignature", maxCount: 1 },
    { name: "addressIdProof", maxCount: 1 },
    { name: "otherDocument", maxCount: 1 },
    { name: "abcDebScreenshot", maxCount: 1 },
    { name: "highSchoolMarksheet", maxCount: 1 },
    { name: "intermediateMarksheet", maxCount: 1 },
    { name: "graduationMarksheet", maxCount: 1 },
    { name: "otherMarksheet", maxCount: 1 },
  ]),
  createStudent
);
router.delete("/:id", isSuperadmin, deleteStudent);
router.patch(
  "/:id/reupload",
  isAdmin,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "studentSignature", maxCount: 1 },
    { name: "addressIdProof", maxCount: 1 },
    { name: "otherDocument", maxCount: 1 },
    { name: "abcDebScreenshot", maxCount: 1 },
    { name: "highSchoolMarksheet", maxCount: 1 },
    { name: "intermediateMarksheet", maxCount: 1 },
    { name: "graduationMarksheet", maxCount: 1 },
    { name: "otherMarksheet", maxCount: 1 },
  ]),
  reuploadDocuments
);

export default router;