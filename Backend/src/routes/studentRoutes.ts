import express, { Request, Response } from "express";
import multer from "multer";
import Student from "../models/Student";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory (moved to main app level, but kept here for clarity)
router.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png) and PDFs are allowed"));
  },
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let students;
    if (user.role === "superadmin") {
      students = await Student.find();
    } else {
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
    res.status(500).json({ message: error.message });
  }
});

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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (user.role === "admin") {
        req.body.centerId = user.centerId;
        req.body.university = user.university; // Restrict to admin's university
      }
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const studentData = {
        ...req.body,
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
        photo: files?.photo?.[0] ? files.photo[0].filename : "",
        studentSignature: files?.studentSignature?.[0] ? files.studentSignature[0].filename : "",
        addressIdProof: files?.addressIdProof?.[0] ? files.addressIdProof[0].filename : "",
        otherDocument: files?.otherDocument?.[0] ? files.otherDocument[0].filename : "",
        abcDebScreenshot: files?.abcDebScreenshot?.[0] ? files.abcDebScreenshot[0].filename : "",
        highSchoolMarksheet: files?.highSchoolMarksheet?.[0] ? files.highSchoolMarksheet[0].filename : "",
        intermediateMarksheet: files?.intermediateMarksheet?.[0] ? files.intermediateMarksheet[0].filename : "",
        graduationMarksheet: files?.graduationMarksheet?.[0] ? files.graduationMarksheet[0].filename : "",
        otherMarksheet: files?.otherMarksheet?.[0] ? files.otherMarksheet[0].filename : "",
      };

      const student = new Student(studentData);
      await student.save();
      res.status(201).json({ message: "Student application submitted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;