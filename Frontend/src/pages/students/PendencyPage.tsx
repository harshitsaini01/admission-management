// PendencyPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust the path as per your project structure

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
  photo?: string;
  studentSignature?: string;
  addressIdProof?: string;
  otherDocument?: string;
  abcDebScreenshot?: string;
  highSchoolMarksheet?: string;
  intermediateMarksheet?: string;
  graduationMarksheet?: string;
  otherMarksheet?: string;
};

const PendencyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the student ID from the URL
  const { user } = useAuth() as { user: User | null };
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({}); // State to store selected files
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch student data
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
      } catch (err: any) {
        setError(err.message || "Error fetching student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user]);

  // Handle file selection
  const handleFileChange = (docField: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [docField]: file,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !id) return;

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

      window.alert("Documents re-uploaded successfully");
      navigate("/students"); // Redirect back to the Allstudents page
    } catch (err: any) {
      setError(err.message || "Error re-uploading documents");
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (!student) return <div className="text-center p-6">Student not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Document Pendency - {student.studentName}
      </h1>

      {/* Student Details */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-gray-600">
              <strong>Student Name:</strong> {student.studentName}
            </p>
            <p className="text-[11px] text-gray-600">
              <strong>Father Name:</strong> {student.fatherName}
            </p>
            <p className="text-[11px] text-gray-600">
              <strong>Mother Name:</strong> {student.motherName}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-600">
              <strong>Admission Session:</strong> {student.admissionSession}
            </p>
            <p className="text-[11px] text-gray-600">
              <strong>Course:</strong> {student.course}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Documents */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Documents</h2>
        {student.pendingDocuments && student.pendingDocuments.length > 0 ? (
          <form onSubmit={handleSubmit}>
            {student.pendingDocuments.map((doc, index) => (
              <div key={index} className="mb-4">
                <label className="text-[11px] text-gray-800">{doc}:</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(doc, file);
                  }}
                  className="block w-full p-2 border border-gray-200 rounded-lg text-[11px] bg-gray-50 mt-1"
                />
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-5 rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        ) : (
          <p className="text-[11px] text-gray-600">No pending documents found.</p>
        )}
      </div>
    </div>
  );
};

export default PendencyPage;