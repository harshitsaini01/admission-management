import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import InputField from "../../components/InputField";
import FileUpload from "../../components/FileUpload";
import AcademicSection from "../../components/AcademicSection";
import toast from 'react-hot-toast';
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HomeIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string; // Add the token property
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "University, Center & Course Details",
    icon: UserIcon
  },
  {
    id: 2,
    title: "Personal Details",
    description: "Student & Family Information",
    icon: UserIcon
  },
  {
    id: 3,
    title: "Address Information",
    description: "Contact & Location Details",
    icon: HomeIcon
  },
  {
    id: 4,
    title: "Academic Records",
    description: "Educational Background",
    icon: AcademicCapIcon
  },
  {
    id: 5,
    title: "Document Upload",
    description: "Required Documents & Files",
    icon: DocumentTextIcon
  }
];

const Applyfresh: React.FC = () => {
  // Type the useAuth hook to return a user with the User type
  const { user } = useAuth() as { user: User | null };
  const [currentStep, setCurrentStep] = useState(1);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load center details. Please contact support.";
      setErrorMessage(errorMessage);
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Invalid center code. Please check and try again.";
        setFormData((prev) => ({ ...prev, centerName: "" }));
        setErrorMessage(errorMessage);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const step1Fields = {
          university: "University",
          center: "Center Code",
          centerName: "Center Name",
          course: "Course",
          specialization: "Specialization",
          year: "Year",
          admissionSession: "Admission Session"
        };
        
        for (const [field, label] of Object.entries(step1Fields)) {
          if (!formData[field as keyof typeof formData]) {
            toast.error(`Please fill in the ${label} field`);
            return false;
          }
        }
        return true;

      case 2:
        const step2Fields = {
          studentName: "Student Name",
          fatherName: "Father's Name",
          motherName: "Mother's Name",
          gender: "Gender",
          dob: "Date of Birth",
          email: "Email",
          mobileNumber: "Mobile Number",
          debId: "DEB ID",
          apaarAbcId: "APAAR/ABC ID",
          maritalStatus: "Marital Status",
          employmentType: "Employment Type",
          religion: "Religion",
          category: "Category"
        };
        
        for (const [field, label] of Object.entries(step2Fields)) {
          const value = formData[field as keyof typeof formData];
          // Special handling for mobile number
          if (field === 'mobileNumber') {
            if (!value) {
              toast.error('Please enter a mobile number');
              return false;
            }
            const mobileValue = value.toString().trim();
            if (mobileValue === '') {
              toast.error('Please enter a mobile number');
              return false;
            }
            const digitsOnly = mobileValue.replace(/\D/g, '');
            if (digitsOnly.length !== 10) {
              toast.error('Please enter a valid 10-digit mobile number');
              return false;
            }
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(digitsOnly)) {
              toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
              return false;
            }
            continue;
          }
          // For all other fields
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            toast.error(`Please fill in the ${label} field`);
            return false;
          }
        }
        return true;

      case 3:
        const step3Fields = {
          address: "Address",
          pincode: "Pincode",
          postOffice: "Post Office",
          district: "District",
          state: "State"
        };
        
        for (const [field, label] of Object.entries(step3Fields)) {
          if (!formData[field as keyof typeof formData]) {
            toast.error(`Please fill in the ${label} field`);
            return false;
          }
        }
        return true;

      case 4:
        const step4Fields = {
          highSchoolSubject: "High School Subject",
          highSchoolYear: "High School Year",
          highSchoolBoard: "High School Board",
          intermediateSubject: "Intermediate Subject",
          intermediateYear: "Intermediate Year",
          intermediateBoard: "Intermediate Board"
        };
        
        for (const [field, label] of Object.entries(step4Fields)) {
          if (!formData[field as keyof typeof formData]) {
            toast.error(`Please fill in the ${label} field`);
            return false;
          }
        }
        return true;

      case 5:
        const step5Fields = {
          photo: "Photo",
          studentSignature: "Student Signature",
          addressIdProof: "Address ID Proof",
          abcDebScreenshot: "ABC/DEB Screenshot",
          highSchoolMarksheet: "High School Marksheet",
          intermediateMarksheet: "Intermediate Marksheet"
        };
        
        for (const [field, label] of Object.entries(step5Fields)) {
          if (!files[field as keyof typeof files]) {
            toast.error(`Please upload the ${label}`);
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      toast.success('Step completed successfully!');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to register a student.");
      return;
    }
    if (!formData.center || !formData.centerName) {
      toast.error("Please enter a valid center code.");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const loadingToast = toast.loading('Submitting application...');

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file);
    });

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
      toast.dismiss(loadingToast);
      toast.success(data.message || "Student registered successfully!");
      setSuccessMessage(data.message || "Student registered successfully!");
      resetForm();
      setCurrentStep(1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setErrorMessage(errorMessage);
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
      university: "",
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="University"
                name="university"
                value={formData.university}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField 
                label="Course" 
                name="course" 
                value={formData.course} 
                onChange={handleChange} 
                type="text"
                placeholder="Course" 
                required 
              />
              <InputField 
                label="Specialization" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange} 
                type="text"
                placeholder="Specialization" 
                required 
              />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Admission Session"
                name="admissionSession"
                value={formData.admissionSession}
                onChange={handleChange}
                placeholder="Jan-2025"
                required
              />
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Student Name" required />
              <InputField label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father Name" required />
              <InputField label="Mother Name" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother Name" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" required />
              <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} type="tel" placeholder="Enter Correct WhatsApp Number" required />
              <InputField label="Alternative Mobile" name="alternativeMobile" value={formData.alternativeMobile} onChange={handleChange} type="tel" placeholder="Alternative WhatsApp Number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="DEB ID" name="debId" value={formData.debId} onChange={handleChange} placeholder="DEB ID" required />
              <InputField label="APAAR / ABC ID" name="apaarAbcId" value={formData.apaarAbcId} onChange={handleChange} placeholder="APAAR / ABC ID" required />
              <InputField label="Aadhar Card Number" name="aadharcard" value={formData.aadharcard} onChange={handleChange} placeholder="Aadhar Card Number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                type="select"
                options={[{ value: "General", label: "General" }, { value: "OBC", label: "OBC" }, { value: "SC", label: "SC" }, { value: "ST", label: "ST" }]}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Alternate Email" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} type="email" placeholder="Alternate Email" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <InputField label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Complete Address" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="PINCODE" required />
              <InputField label="Post Office" name="postOffice" value={formData.postOffice} onChange={handleChange} placeholder="Post Office" required />
              <InputField label="District" name="district" value={formData.district} onChange={handleChange} placeholder="District" required />
              <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="STATE" required />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <AcademicSection title="Highschool" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} required />
            <AcademicSection title="Intermediate" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} required />
            <AcademicSection title="Graduation" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} />
            <AcademicSection title="Other" formData={formData} files={files} onChange={handleChange} onFileChange={handleFileChange} />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FileUpload label="Photo" name="photo" file={files.photo} onChange={handleFileChange} required />
              <FileUpload label="Student Signature" name="studentSignature" file={files.studentSignature} onChange={handleFileChange} required />
              <FileUpload label="Address ID Proof" name="addressIdProof" file={files.addressIdProof} onChange={handleFileChange} required />
              <FileUpload label="Other Document" name="otherDocument" file={files.otherDocument} onChange={handleFileChange} />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <FileUpload label="ABC and DEB ID Screenshot" name="abcDebScreenshot" file={files.abcDebScreenshot} onChange={handleFileChange} required />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Student Registration</h1>
          </div>
          <p className="text-gray-600 text-lg">Complete the form step by step to register a new student</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="card animate-fade-in">
          <div className="card-header">
            <h2 className="text-2xl font-bold text-gray-900">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600 mt-1">{steps[currentStep - 1]?.description}</p>
          </div>

          <div className="card-body">
            {successMessage && <Placeholder type="success" message={successMessage} />}
            {errorMessage && <Placeholder type="error" message={errorMessage} />}
            
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Applyfresh;