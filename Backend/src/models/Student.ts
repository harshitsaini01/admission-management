// Student.ts
import mongoose, { Schema, Document } from "mongoose";

interface IStudent extends Document {
  center: string;
  centerId: string | mongoose.Types.ObjectId;
  centerName: string;
  admissionSession: string;
  admissionType: string;
  course: string;
  fatherName: string;
  studentName: string;
  dob: Date;
  mobileNumber: string;
  apaarAbcId: string;
  religion: string;
  websiteName?: string;
  email: string;
  motherName: string;
  category: string;
  addressCodeNumber?: string;
  medicalStatus?: string;
  alternateEmail?: string;
  dataId?: string;
  employmentStatus?: string;
  alternativeMobile?: string;
  specialization: string;
  gender: string;
  aadharcard?: string;
  debId: string;
  maritalStatus: string;
  employmentType: string;
  address: string;
  pincode: string;
  postOffice: string;
  district: string;
  state: string;
  year: string;
  semester: number;
  highSchoolSubject: string;
  highSchoolYear: string;
  highSchoolBoard: string;
  highSchoolObtainedMarks: number;
  highSchoolMaximumMarks: number;
  highSchoolPercentage: number;
  intermediateSubject: string;
  intermediateYear: string;
  intermediateBoard: string;
  intermediateObtainedMarks: number;
  intermediateMaximumMarks: number;
  intermediatePercentage: number;
  graduationSubject?: string;
  graduationYear?: string;
  graduationBoard?: string;
  graduationObtainedMarks?: number;
  graduationMaximumMarks?: number;
  graduationPercentage?: number;
  otherSubject?: string;
  otherYear?: string;
  otherBoard?: string;
  otherObtainedMarks?: number;
  otherMaximumMarks?: number;
  otherPercentage?: number;
  university: string;
  photo: string;
  studentSignature: string;
  addressIdProof: string;
  otherDocument?: string;
  abcDebScreenshot: string;
  highSchoolMarksheet: string;
  intermediateMarksheet: string;
  graduationMarksheet?: string;
  otherMarksheet?: string;
  applicationNumber?: string;
  enrollmentNumber?: string;
  processedOn?: string;
  studentStatus?: string;
  applicationStatus?: string;
  referenceId: string;
  admDate: Date;
  docStatus?: string; // New field for document status
  pendingDocuments?: string[]; // New field for pending documents
  pendencyRemarks?: string; // New field for pendency remarks from superadmin
  pendencyDate?: Date; // New field for pendency date
  reRegistrationStatus?: string; // New field for re-registration status
  lastReRegistrationDate?: Date; // New field for last re-registration date
  nextReRegistrationEligible?: Date; // New field for when student becomes eligible for next re-registration
}

const StudentSchema: Schema = new Schema(
  {
    center: { type: String, required: true, maxlength: 4 },
    centerId: { type: Schema.Types.ObjectId, ref: "Center", required: true },
    centerName: { type: String, required: true },
    admissionSession: { type: String, required: true },
    admissionType: { type: String, required: true },
    course: { type: String, required: true },
    fatherName: { type: String, required: true },
    studentName: { type: String, required: true },
    dob: { type: Date, required: true },
    mobileNumber: { type: String, required: true },
    apaarAbcId: { type: String, required: true },
    religion: { type: String, required: true },
    websiteName: { type: String, required: false },
    email: { type: String, required: true },
    motherName: { type: String, required: true },
    category: { type: String, required: true },
    addressCodeNumber: { type: String, required: false },
    medicalStatus: { type: String, required: false },
    alternateEmail: { type: String, required: false },
    dataId: { type: String, required: false },
    employmentStatus: { type: String, required: false },
    alternativeMobile: { type: String, required: false },
    specialization: { type: String, required: true },
    gender: { type: String, required: true },
    aadharcard: { type: String, required: false },
    debId: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    employmentType: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    postOffice: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: Number, required: true, default: 1 },
    highSchoolSubject: { type: String, required: true },
    highSchoolYear: { type: String, required: true },
    highSchoolBoard: { type: String, required: true },
    highSchoolObtainedMarks: { type: Number, required: true },
    highSchoolMaximumMarks: { type: Number, required: true },
    highSchoolPercentage: { type: Number, required: true },
    intermediateSubject: { type: String, required: true },
    intermediateYear: { type: String, required: true },
    intermediateBoard: { type: String, required: true },
    intermediateObtainedMarks: { type: Number, required: true },
    intermediateMaximumMarks: { type: Number, required: true },
    intermediatePercentage: { type: Number, required: true },
    graduationSubject: { type: String, required: false },
    graduationYear: { type: String, required: false },
    graduationBoard: { type: String, required: false },
    graduationObtainedMarks: { type: Number, required: false },
    graduationMaximumMarks: { type: Number, required: false },
    graduationPercentage: { type: Number, required: false },
    otherSubject: { type: String, required: false },
    otherYear: { type: String, required: false },
    otherBoard: { type: String, required: false },
    otherObtainedMarks: { type: Number, required: false },
    otherMaximumMarks: { type: Number, required: false },
    otherPercentage: { type: Number, required: false },
    university: { type: String, required: true },
    photo: { type: String, required: true },
    studentSignature: { type: String, required: true },
    addressIdProof: { type: String, required: true },
    otherDocument: { type: String, required: false },
    abcDebScreenshot: { type: String, required: true },
    highSchoolMarksheet: { type: String, required: true },
    intermediateMarksheet: { type: String, required: true },
    graduationMarksheet: { type: String, required: false },
    otherMarksheet: { type: String, required: false },
    applicationNumber: { type: String, required: false },
    enrollmentNumber: { type: String, required: false },
    processedOn: { type: String, required: false },
    studentStatus: { type: String, default: "Active" },
    applicationStatus: { type: String, default: "New" },
    referenceId: { type: String, required: true, unique: true },
    admDate: { type: Date, required: true, default: Date.now },
    docStatus: { type: String, default: "Pending" }, // New field
    pendingDocuments: { type: [String], default: [] }, // New field
    pendencyRemarks: { type: String, required: false }, // New field
    pendencyDate: { type: Date, required: false }, // New field
    reRegistrationStatus: { type: String, default: "Eligible" }, // New field: Eligible, Applied, Completed
    lastReRegistrationDate: { type: Date, required: false }, // New field
    nextReRegistrationEligible: { type: Date, required: false }, // New field
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);