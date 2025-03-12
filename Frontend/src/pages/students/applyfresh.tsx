import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Applyfresh: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    center: "",
    centerId: user?.centerId || "",
    admissionSession: "",
    admissionType: "",
    course: "",
    fatherName: "",
    studentName: "",
    dob: "",
    mobileNumber: "",
    apaarAbcId: "",
    religion: "",
    websiteName: "",
    email: "",
    motherName: "",
    category: "",
    addressCodeNumber: "",
    medicalStatus: "",
    alternateEmail: "",
    dataId: "",
    employmentStatus: "",
    alternativeMobile: "",
    specialization: "",
    gender: "",
    aadharcard: "",
    debId: "",
    maritalStatus: "",
    employmentType: "",
    address: "",
    pincode: "",
    postOffice: "",
    district: "",
    state: "",
    year: "",
    highSchoolSubject: "",
    highSchoolYear: "",
    highSchoolBoard: "",
    highSchoolObtainedMarks: "",
    highSchoolMaximumMarks: "",
    highSchoolPercentage: "",
    intermediateSubject: "",
    intermediateYear: "",
    intermediateBoard: "",
    intermediateObtainedMarks: "",
    intermediateMaximumMarks: "",
    intermediatePercentage: "",
    graduationSubject: "",
    graduationYear: "",
    graduationBoard: "",
    graduationObtainedMarks: "",
    graduationMaximumMarks: "",
    graduationPercentage: "",
    otherSubject: "",
    otherYear: "",
    otherBoard: "",
    otherObtainedMarks: "",
    otherMaximumMarks: "",
    otherPercentage: "",
  });

  const [files, setFiles] = useState({
    photo: null as File | null,
    studentSignature: null as File | null,
    addressIdProof: null as File | null,
    otherDocument: null as File | null,
    abcDebScreenshot: null as File | null,
    highSchoolMarksheet: null as File | null,
    intermediateMarksheet: null as File | null,
    graduationMarksheet: null as File | null,
    otherMarksheet: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: selectedFiles[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    

    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formDataToSend.append(key, file);
      }
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const response = await fetch(`${API_URL}/api/students`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${user?.token}` },
      body: formDataToSend,
    });

      if (response.ok) {
        setSuccessMessage("Student registered successfully!");
        // Reset form after successful submission
        setFormData({
          center: "",
          centerId: user?.centerId || "",
          admissionSession: "",
          admissionType: "",
          course: "",
          fatherName: "",
          studentName: "",
          dob: "",
          mobileNumber: "",
          apaarAbcId: "",
          religion: "",
          websiteName: "",
          email: "",
          motherName: "",
          category: "",
          addressCodeNumber: "",
          medicalStatus: "",
          alternateEmail: "",
          dataId: "",
          employmentStatus: "",
          alternativeMobile: "",
          specialization: "",
          gender: "",
          aadharcard: "",
          debId: "",
          maritalStatus: "",
          employmentType: "",
          address: "",
          pincode: "",
          postOffice: "",
          district: "",
          state: "",
          year: "",
          highSchoolSubject: "",
          highSchoolYear: "",
          highSchoolBoard: "",
          highSchoolObtainedMarks: "",
          highSchoolMaximumMarks: "",
          highSchoolPercentage: "",
          intermediateSubject: "",
          intermediateYear: "",
          intermediateBoard: "",
          intermediateObtainedMarks: "",
          intermediateMaximumMarks: "",
          intermediatePercentage: "",
          graduationSubject: "",
          graduationYear: "",
          graduationBoard: "",
          graduationObtainedMarks: "",
          graduationMaximumMarks: "",
          graduationPercentage: "",
          otherSubject: "",
          otherYear: "",
          otherBoard: "",
          otherObtainedMarks: "",
          otherMaximumMarks: "",
          otherPercentage: "",
        });
        setFiles({
          photo: null,
          studentSignature: null,
          addressIdProof: null,
          otherDocument: null,
          abcDebScreenshot: null,
          highSchoolMarksheet: null,
          intermediateMarksheet: null,
          graduationMarksheet: null,
          otherMarksheet: null,
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to register student. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Register Student</h1>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {/* Center Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Center*</label>
            <select
              name="center"
              value={formData.center}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose</option>
              <option value="Center1">Center1</option>
              <option value="center2">center2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admission Session*</label>
            <input
              type="text"
              name="admissionSession"
              value={formData.admissionSession}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jan-2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admission Type*</label>
            <select
              name="admissionType"
              value={formData.admissionType}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose</option>
              <option value="Fresh">Fresh</option>
            </select>
          </div>
        </div>

        {/* Course Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course*</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose</option>
              <option value="Graduation">Graduation</option>
              <option value="Post Graduate Diploma">Post Graduate Diploma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specialization*</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specialization"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year*</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>

        {/* Student Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name*</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="STUDENT NAME"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Father Name*</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="FATHER NAME"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mother Name*</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="MOTHER NAME"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Choose</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number*</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Correct WhatsApp Number of Student"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhar Card Number</label>
            <input
              type="text"
              name="aadharcard"
              value={formData.aadharcard}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Aadhar Card Number"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">DEB ID*</label>
            <input
              type="text"
              name="debId"
              value={formData.debId}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="DEB ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">APAAR / ABC ID*</label>
            <input
              type="text"
              name="apaarAbcId"
              value={formData.apaarAbcId}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="APAAR / ABC ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status*</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Choose</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employment Type*</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Choose</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Self-Employed">Self-Employed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Religion*</label>
            <input
              type="text"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Religion"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alternate Email</label>
            <input
              type="email"
              name="alternateEmail"
              value={formData.alternateEmail}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Alternate Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alternative Mobile</label>
            <input
              type="tel"
              name="alternativeMobile"
              value={formData.alternativeMobile}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="WhatsApp Number"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mt-15 mb-6">
          <h2 className="text-xl font-semibold mb-5">Address</h2>
          <label className="block text-sm font-medium text-gray-700">Address*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Pincode*</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="PINCODE"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Post Office*</label>
            <input
              type="text"
              name="postOffice"
              value={formData.postOffice}
              onChange={handleChange}
              placeholder="Post Office"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">District*</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Select"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">State*</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="STATE"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        </div>

        {/* Academic Details Section */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold mb-8">Academic Details</h2>

          {/* High School */}
          <div className="grid grid-cols-8 gap-5 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Examination</label>
              <h2 className="block text-sm mt-7 font-medium text-gray-700">Highschool*</h2>
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Subject*</label>
              <input
                type="text"
                name="highSchoolSubject"
                value={formData.highSchoolSubject}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Subjects"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Year*</label>
              <select
                name="highSchoolYear"
                value={formData.highSchoolYear}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select Year</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Board/University*</label>
              <input
                type="text"
                name="highSchoolBoard"
                value={formData.highSchoolBoard}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="BOARD/UNIVERSITY"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Obtained Marks*</label>
              <input
                type="text"
                name="highSchoolObtainedMarks"
                value={formData.highSchoolObtainedMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Maximum Marks*</label>
              <input
                type="text"
                name="highSchoolMaximumMarks"
                value={formData.highSchoolMaximumMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-5 font-medium text-gray-700">Percentage/Grade*</label>
              <input
                type="text"
                name="highSchoolPercentage"
                value={formData.highSchoolPercentage}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="%"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marksheet*</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="highSchoolMarksheet"
                  onChange={handleFileChange}
                  className="hidden"
                  id="highSchoolMarksheetInput"
                  required
                />
                <label
                  htmlFor="highSchoolMarksheetInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.highSchoolMarksheet ? files.highSchoolMarksheet.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Intermediate */}
          <div className="grid grid-cols-8 gap-5 mb-4">
            <div>
              <h2 className="block text-sm mt-3 font-medium text-gray-700">Intermediate*</h2>
            </div>
            <div>
              <input
                type="text"
                name="intermediateSubject"
                value={formData.intermediateSubject}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Subjects"
                required
              />
            </div>
            <div>
              <select
                name="intermediateYear"
                value={formData.intermediateYear}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select Year</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                name="intermediateBoard"
                value={formData.intermediateBoard}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="BOARD/UNIVERSITY"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="intermediateObtainedMarks"
                value={formData.intermediateObtainedMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="intermediateMaximumMarks"
                value={formData.intermediateMaximumMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="intermediatePercentage"
                value={formData.intermediatePercentage}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="%"
                required
              />
            </div>
            <div>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="intermediateMarksheet"
                  onChange={handleFileChange}
                  className="hidden"
                  id="intermediateMarksheetInput"
                  required
                />
                <label
                  htmlFor="intermediateMarksheetInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.intermediateMarksheet ? files.intermediateMarksheet.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Graduation */}
          <div className="grid grid-cols-8 gap-5 mb-4">
            <div>
              <h2 className="block text-sm mt-3 font-medium text-gray-700">Graduation</h2>
            </div>
            <div>
              <input
                type="text"
                name="graduationSubject"
                value={formData.graduationSubject}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Subjects"
              />
            </div>
            <div>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Year</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                name="graduationBoard"
                value={formData.graduationBoard}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="BOARD/UNIVERSITY"
              />
            </div>
            <div>
              <input
                type="text"
                name="graduationObtainedMarks"
                value={formData.graduationObtainedMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
              />
            </div>
            <div>
              <input
                type="text"
                name="graduationMaximumMarks"
                value={formData.graduationMaximumMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
              />
            </div>
            <div>
              <input
                type="text"
                name="graduationPercentage"
                value={formData.graduationPercentage}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="%"
              />
            </div>
            <div>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="graduationMarksheet"
                  onChange={handleFileChange}
                  className="hidden"
                  id="graduationMarksheetInput"
                />
                <label
                  htmlFor="graduationMarksheetInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.graduationMarksheet ? files.graduationMarksheet.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Other */}
          <div className="grid grid-cols-8 gap-5 mb-4">
            <div>
              <h2 className="block text-sm mt-3 font-medium text-gray-700">Other</h2>
            </div>
            <div>
              <input
                type="text"
                name="otherSubject"
                value={formData.otherSubject}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Course"
              />
            </div>
            <div>
              <select
                name="otherYear"
                value={formData.otherYear}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Year</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                name="otherBoard"
                value={formData.otherBoard}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="BOARD/UNIVERSITY"
              />
            </div>
            <div>
              <input
                type="text"
                name="otherObtainedMarks"
                value={formData.otherObtainedMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
              />
            </div>
            <div>
              <input
                type="text"
                name="otherMaximumMarks"
                value={formData.otherMaximumMarks}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder=""
              />
            </div>
            <div>
              <input
                type="text"
                name="otherPercentage"
                value={formData.otherPercentage}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="%"
              />
            </div>
            <div>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="otherMarksheet"
                  onChange={handleFileChange}
                  className="hidden"
                  id="otherMarksheetInput"
                />
                <label
                  htmlFor="otherMarksheetInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.otherMarksheet ? files.otherMarksheet.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-5">Upload Documents</h2>
          <div className="grid grid-cols-4 gap-6 mb-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Photo*</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photoInput"
                  required
                />
                <label
                  htmlFor="photoInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.photo ? files.photo.name : "No file chosen"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Student Signature*</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="studentSignature"
                  onChange={handleFileChange}
                  className="hidden"
                  id="signatureInput"
                  required
                />
                <label
                  htmlFor="signatureInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.studentSignature ? files.studentSignature.name : "No file chosen"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Address ID Proof*</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="addressIdProof"
                  onChange={handleFileChange}
                  className="hidden"
                  id="addressIdInput"
                  required
                />
                <label
                  htmlFor="addressIdInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.addressIdProof ? files.addressIdProof.name : "No file chosen"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Other Document</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="otherDocument"
                  onChange={handleFileChange}
                  className="hidden"
                  id="otherDocumentInput"
                />
                <label
                  htmlFor="otherDocumentInput"
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-500">
                  {files.otherDocument ? files.otherDocument.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ABC and DEB ID Screenshot*</label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                name="abcDebScreenshot"
                onChange={handleFileChange}
                className="hidden"
                id="abcDebInput"
                required
              />
              <label
                htmlFor="abcDebInput"
                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
              >
                Choose File
              </label>
              <span className="text-sm text-gray-500">
                {files.abcDebScreenshot ? files.abcDebScreenshot.name : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 md:w-1/4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Applyfresh;