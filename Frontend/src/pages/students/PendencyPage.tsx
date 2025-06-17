// PendencyPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

interface User {
  role: string;
  centerId?: string;
  token?: string;
}

type StudentData = {
  _id: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  admissionSession: string;
  course: string;
  pendingDocuments?: string[];
  pendencyRemarks?: string;
  pendencyDate?: string;
  photo?: string;
  studentSignature?: string;
  addressIdProof?: string;
  otherDocument?: string;
  abcDebScreenshot?: string;
  highSchoolMarksheet?: string;
  intermediateMarksheet?: string;
  graduationMarksheet?: string;
  otherMarksheet?: string;
  referenceId: string;
  center: string;
  centerName: string;
  university?: string;
  docStatus?: string;
};

const documentLabels: Record<string, string> = {
  photo: "Student Photo",
  studentSignature: "Student Signature",
  addressIdProof: "Address ID Proof",
  otherDocument: "Other Document",
  abcDebScreenshot: "ABC DEB Screenshot",
  highSchoolMarksheet: "High School Marksheet",
  intermediateMarksheet: "Intermediate Marksheet",
  graduationMarksheet: "Graduation Marksheet",
  otherMarksheet: "Other Marksheet"
};

const PendencyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth() as { user: User | null };
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchStudent = async () => {
      if (!user || !id) {
        setError("You must be logged in to view this page");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/students`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch student");
        }

        const students: StudentData[] = await response.json();
        const selectedStudent = students.find((s) => s._id === id);
        if (!selectedStudent) {
          throw new Error("Student not found");
        }

        setStudent(selectedStudent);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching student data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user]);

  const handleFileChange = (docField: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [docField]: file,
    }));

    // Create preview URL for images
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [docField]: url
      }));
    } else {
      setPreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[docField];
        return newUrls;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !id) return;

    const selectedFiles = Object.values(files).filter(file => file !== null);
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading documents...');

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/students/${id}/reupload`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to re-upload documents");
      }

      toast.dismiss(loadingToast);
      toast.success("Documents uploaded successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/students");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error re-uploading documents";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Loading Student Data</h1>
          <p className="text-gray-600">Please wait while we fetch the student information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Error Loading Student</h1>
            <div className="alert alert-error">{error}</div>
            <button
              onClick={() => navigate("/students")}
              className="btn btn-secondary mt-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Student Not Found</h1>
            <p className="text-gray-600 mb-4">The requested student could not be found.</p>
            <button
              onClick={() => navigate("/students")}
              className="btn btn-secondary"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/students")}
              className="btn btn-secondary mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <div>
              <div className="flex items-center mb-2">
                <SparklesIcon className="w-6 h-6 text-orange-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Document Pendency</h1>
              </div>
              <p className="text-gray-600">Re-upload required documents for verification</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Reference ID</div>
            <div className="text-lg font-bold text-gray-900">{student.referenceId}</div>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-3 text-blue-600" />
              Student Information
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{student.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father's Name</label>
                  <p className="text-gray-700">{student.fatherName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                  <p className="text-gray-700">{student.motherName}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Course</label>
                  <p className="text-gray-700">{student.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Session</label>
                  <p className="text-gray-700">{student.admissionSession}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University</label>
                  <p className="text-gray-700">{student.university || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Center</label>
                  <p className="text-gray-700">{student.centerName || student.center}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Document Status</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {student.docStatus || "Pendency"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pendency Information */}
        {student.pendencyRemarks && (
          <div className="card mb-6">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-orange-600" />
                Pendency Comments from Superadmin
              </h3>
              {student.pendencyDate && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {new Date(student.pendencyDate).toLocaleDateString()} at {new Date(student.pendencyDate).toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{student.pendencyRemarks}</p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-3 text-red-600" />
              Required Documents
            </h3>
            <p className="text-gray-600 mt-1">Please upload the following documents that need to be corrected</p>
          </div>
          <div className="card-body">
            {student.pendingDocuments && student.pendingDocuments.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {student.pendingDocuments.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-3">
                        <PhotoIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <label className="text-sm font-medium text-gray-700">
                          {documentLabels[doc] || doc}
                        </label>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(doc, file);
                        }}
                        className="form-input mb-3"
                        required
                      />
                      
                      {previewUrls[doc] && (
                        <div className="mt-3">
                          <img
                            src={previewUrls[doc]}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      {files[doc] && (
                        <div className="mt-2 text-xs text-green-600 flex items-center">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          File selected: {files[doc]?.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={uploading || Object.values(files).every(file => file === null)}
                    className="btn btn-primary btn-lg min-w-48"
                  >
                    {uploading ? (
                      <>
                        <div className="spinner w-5 h-5" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-5 h-5" />
                        Upload Documents
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Documents</h3>
                <p className="text-gray-500">All documents have been verified successfully.</p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="card mt-6">
          <div className="card-body">
            <h4 className="font-semibold text-gray-900 mb-3">Upload Guidelines:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: JPG, PNG, PDF</li>
              <li>• Maximum file size: 5MB per document</li>
              <li>• Ensure documents are clear and readable</li>
              <li>• All required documents must be uploaded before submission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendencyPage;