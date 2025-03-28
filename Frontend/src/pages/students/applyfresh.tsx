import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import InputField from "../../components/InputField";
import FileUpload from "../../components/FileUpload";
import AcademicSection from "../../components/AcademicSection";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string; // Add the token property
}

const Applyfresh: React.FC = () => {
  // Type the useAuth hook to return a user with the User type
  const { user } = useAuth() as { user: User | null };
  const [formData, setFormData] = useState({
    center: "",
    centerName: "",
    centerId: "", // Added for admin consistency
    admissionSession: "",
    admissionType: "Fresh", // Default value to match backend
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
    highSchoolObtainedMarks: "0", // Default to "0" to avoid uncontrolled warning
    highSchoolMaximumMarks: "0", // Default to "0"
    highSchoolPercentage: "0", // Default to "0"
    intermediateSubject: "",
    intermediateYear: "",
    intermediateBoard: "",
    intermediateObtainedMarks: "0", // Default to "0"
    intermediateMaximumMarks: "0", // Default to "0"
    intermediatePercentage: "0", // Default to "0"
    graduationSubject: "",
    graduationYear: "",
    graduationBoard: "",
    graduationObtainedMarks: "0", // Default to "0"
    graduationMaximumMarks: "0", // Default to "0"
    graduationPercentage: "0", // Default to "0"
    otherSubject: "",
    otherYear: "",
    otherBoard: "",
    otherObtainedMarks: "0", // Default to "0"
    otherMaximumMarks: "0", // Default to "0"
    otherPercentage: "0", // Default to "0"
    university: "", // Changed from University to university (lowercase)
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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user?.role === "admin" && user?.centerId) {
      fetchCenterDetails(user.centerId);
    }
  }, [user]);

  const fetchCenterDetails = async (centerId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/centers/${centerId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch center details");
      }
      const centerData = await response.json();
      setFormData((prev) => ({
        ...prev,
        centerId: centerId, // Set centerId for admin
        center: centerData.code || "N/A",
        centerName: centerData.name || "Unknown Center",
      }));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load center details. Please contact support.");
      setFormData((prev) => ({
        ...prev,
        center: "N/A",
        centerName: "Unknown Center",
      }));
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "center" && value.length === 4 && user?.role === "superadmin") {
      try {
        const response = await fetch(`${API_URL}/api/centers/code/${value}`, {
          method: "GET",
          credentials: "include",
          headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid center code");
        }
        const centerData = await response.json();
        setFormData((prev) => ({ ...prev, centerName: centerData.name }));
        setErrorMessage(null);
      } catch (err: any) {
        setFormData((prev) => ({ ...prev, centerName: "" }));
        setErrorMessage(err.message || "Invalid center code. Please check and try again.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage("You must be logged in to register a student.");
      return;
    }
    if (!formData.center || !formData.centerName) {
      setErrorMessage("Please enter a valid center code.");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file);
    });

    // Debug FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch(`${API_URL}/api/students`, {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
        headers: { "Authorization": `Bearer ${user?.token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuccessMessage(data.message || "Student registered successfully!");
      resetForm();
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      center: user?.role === "admin" ? formData.center : "",
      centerName: user?.role === "admin" ? formData.centerName : "",
      centerId: user?.role === "admin" ? formData.centerId : "",
      admissionSession: "",
      admissionType: "Fresh",
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
      highSchoolObtainedMarks: "0",
      highSchoolMaximumMarks: "0",
      highSchoolPercentage: "0",
      intermediateSubject: "",
      intermediateYear: "",
      intermediateBoard: "",
      intermediateObtainedMarks: "0",
      intermediateMaximumMarks: "0",
      intermediatePercentage: "0",
      graduationSubject: "",
      graduationYear: "",
      graduationBoard: "",
      graduationObtainedMarks: "0",
      graduationMaximumMarks: "0",
      graduationPercentage: "0",
      otherSubject: "",
      otherYear: "",
      otherBoard: "",
      otherObtainedMarks: "0",
      otherMaximumMarks: "0",
      otherPercentage: "0",
      university: "", // Changed from University to university (lowercase)
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
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Register Student</h1>

        {successMessage && <Placeholder type="success" message={successMessage} />}
        {errorMessage && <Placeholder type="error" message={errorMessage} />}
        {loading && <Placeholder type="loading" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField
            label="University"
            name="university" // Changed from University to university (lowercase)
            value={formData.university} // Changed from University to university (lowercase)
            onChange={handleChange}
            type="select"
            options={[
              { value: "Mangalayatan University- Online", label: "Mangalayatan University- Online" },
              { value: "Mangalayatan University- Distance", label: "Mangalayatan University- Distance" },
              { value: "Subharti University", label: "Subharti University" },
            ]}
            required
          />
          {user?.role === "superadmin" ? (
            <>
              <InputField
                label="Center Code"
                name="center"
                value={formData.center}
                onChange={handleChange}
                placeholder="Enter 4-digit center code"
                required
              />
              <InputField
                label="Center Name"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                placeholder="Center name will appear here"
                readOnly
                required
              />
            </>
          ) : (
            <>
              <InputField
                label="Center Code"
                name="center"
                value={formData.center}
                onChange={handleChange}
                readOnly
                required
              />
              <InputField
                label="Center Name"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                readOnly
                required
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField label="Course" name="course" value={formData.course} onChange={handleChange} placeholder="Course" required />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" required />
          <InputField
            label="Year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            type="select"
            options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField
            label="Admission Session"
            name="admissionSession"
            value={formData.admissionSession}
            onChange={handleChange}
            placeholder="Jan-2025"
            required
          />
          <InputField label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Student Name " required />
          <InputField label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father Name " required />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <InputField label="Mother Name" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother Name" required />
          <InputField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            type="select"
            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
            required
          />
          <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" required />
          <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} type="tel" placeholder="Enter Correct WhatsApp Number of Student" required />
          <InputField label="Aadhar Card Number" name="aadharcard" value={formData.aadharcard} onChange={handleChange} placeholder="Aadhar Card Number" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <InputField label="DEB ID" name="debId" value={formData.debId} onChange={handleChange} placeholder="DEB ID" required />
          <InputField label="APAAR / ABC ID" name="apaarAbcId" value={formData.apaarAbcId} onChange={handleChange} placeholder="APAAR / ABC ID" required />
          <InputField
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            type="select"
            options={[{ value: "Single", label: "Single" }, { value: "Married", label: "Married" }, { value: "Divorced", label: "Divorced" }, { value: "Widowed", label: "Widowed" }]}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <InputField
            label="Employment Type"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            type="select"
            options={[{ value: "Employed", label: "Employed" }, { value: "Unemployed", label: "Unemployed" }, { value: "Self-Employed", label: "Self-Employed" }]}
            required
          />
          <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" required />
          <InputField
            label="Admission Type"
            name="admissionType"
            value={formData.admissionType}
            onChange={handleChange}
            type="select"
            options={[{ value: "Fresh", label: "Fresh" }]}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <InputField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            type="select"
            options={[{ value: "General", label: "General" }, { value: "OBC", label: "OBC" }, { value: "SC", label: "SC" }, { value: "ST", label: "ST" }]}
            required
          />
          <InputField label="Alternate Email" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} type="email" placeholder="Alternate Email" />
          <InputField label="Alternative Mobile" name="alternativeMobile" value={formData.alternativeMobile} onChange={handleChange} type="tel" placeholder="WhatsApp Number" />
        </div>

        <div className="mt-6 mb-6">
          <h2 className="text-xl font-semibold mb-5">Address</h2>
          <InputField label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
          <div className="grid grid-cols-4 gap-4 mt-4">
            <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="PINCODE" required />
            <InputField label="Post Office" name="postOffice" value={formData.postOffice} onChange={handleChange} placeholder="Post Office" required />
            <InputField label="District" name="district" value={formData.district} onChange={handleChange} placeholder="Select" required />
            <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="STATE" required />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-5">Academic Details</h2>
          <AcademicSection title="Highschool" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} required />
          <AcademicSection title="Intermediate" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} required />
          <AcademicSection title="Graduation" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} />
          <AcademicSection title="Other" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-5">Upload Documents</h2>
          <div className="grid grid-cols-4 gap-6 mb-2">
            <FileUpload label="Photo" name="photo" file={files.photo} onChange={handleFileChange} required />
            <FileUpload label="Student Signature" name="studentSignature" file={files.studentSignature} onChange={handleFileChange} required />
            <FileUpload label="Address ID Proof" name="addressIdProof" file={files.addressIdProof} onChange={handleFileChange} required />
            <FileUpload label="Other Document" name="otherDocument" file={files.otherDocument} onChange={handleFileChange} />
          </div>
          <FileUpload label="ABC and DEB ID Screenshot" name="abcDebScreenshot" file={files.abcDebScreenshot} onChange={handleFileChange} required />
        </div>

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