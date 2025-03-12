// backend/src/models/Student.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IStudent extends Document {
  center: string;
  centerId: string;
  admissionSession: string;
  admissionType: string;
  course: string;
  fatherName: string;
  studentName: string;
  dob: Date;
  mobileNumber: string;
  apaarAbcId: string;
  religion: string;
  websiteName: string;
  email: string;
  motherName: string;
  category: string;
  addressCodeNumber: string;
  medicalStatus: string;
  alternateEmail: string;
  dataId: string;
  employmentStatus: string;
  alternativeMobile: string;
  specialization: string;
  gender: string;
  aadharcard: string;
  debId: string;
  maritalStatus: string;
  employmentType: string;
  address: string;
  pincode: string;
  postOffice: string;
  district: string;
  state: string;
  year: string;
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
  graduationSubject: string;
  graduationYear: string;
  graduationBoard: string;
  graduationObtainedMarks: number;
  graduationMaximumMarks: number;
  graduationPercentage: number;
  otherSubject: string;
  otherYear: string;
  otherBoard: string;
  otherObtainedMarks: number;
  otherMaximumMarks: number;
  otherPercentage: number;
  photo: string;
  studentSignature: string;
  addressIdProof: string;
  otherDocument: string;
  abcDebScreenshot: string;
  highSchoolMarksheet: string;
  intermediateMarksheet: string;
  graduationMarksheet: string;
  otherMarksheet: string;
}

const StudentSchema: Schema = new Schema({
  center: { type: String, required: true },
  centerId: { type: Schema.Types.ObjectId, ref: "Center", required: true },
  admissionSession: { type: String, required: true },
  admissionType: { type: String, required: true },
  course: { type: String, required: true },
  fatherName: { type: String, required: true },
  studentName: { type: String, required: true },
  dob: { type: Date, required: true },
  mobileNumber: { type: String, required: true },
  apaarAbcId: { type: String, required: true },
  religion: { type: String, required: true },
  websiteName: { type: String },
  email: { type: String, required: true },
  motherName: { type: String, required: true },
  category: { type: String, required: true },
  addressCodeNumber: { type: String },
  medicalStatus: { type: String },
  alternateEmail: { type: String },
  dataId: { type: String },
  employmentStatus: { type: String },
  alternativeMobile: { type: String },
  specialization: { type: String, required: true },
  gender: { type: String, required: true },
  aadharcard: { type: String },
  debId: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  employmentType: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  postOffice: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  year: { type: String, required: true },
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
  graduationSubject: { type: String },
  graduationYear: { type: String },
  graduationBoard: { type: String },
  graduationObtainedMarks: { type: Number },
  graduationMaximumMarks: { type: Number },
  graduationPercentage: { type: Number },
  otherSubject: { type: String },
  otherYear: { type: String },
  otherBoard: { type: String },
  otherObtainedMarks: { type: Number },
  otherMaximumMarks: { type: Number },
  otherPercentage: { type: Number },
  photo: { type: String },
  studentSignature: { type: String },
  addressIdProof: { type: String },
  otherDocument: { type: String },
  abcDebScreenshot: { type: String },
  highSchoolMarksheet: { type: String },
  intermediateMarksheet: { type: String },
  graduationMarksheet: { type: String },
  otherMarksheet: { type: String },
  
},
{ timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);