import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useAuth } from "../../context/AuthContext";

type StudentData = {
  _id: string;
  centerId: string; // Changed from 'center' to 'centerId' to match backend model
  admissionSession: string;
  admissionType: string;
  course: string;
  fatherName: string;
  studentName: string;
  dob: string;
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
  __v: number;
};

const Allstudents: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.token) {
        setError("You must be logged in to view students");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/students`, {
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch students: ${response.status}`);
        }

        const data: StudentData[] = await response.json();
        setStudents(data);
      } catch (error: any) {
        setError(error.message || "Error fetching students");
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]); // Depend on user to refetch if token/role changes

  const downloadDocuments = async (student: StudentData) => {
    const zip = new JSZip();
    const documentFields = [
      { url: student.photo, name: 'photo' },
      { url: student.studentSignature, name: 'signature' },
      { url: student.addressIdProof, name: 'address_id_proof' },
      { url: student.otherDocument, name: 'other_document' },
      { url: student.abcDebScreenshot, name: 'abc_deb_screenshot' },
      { url: student.highSchoolMarksheet, name: 'high_school_marksheet' },
      { url: student.intermediateMarksheet, name: 'intermediate_marksheet' },
      { url: student.graduationMarksheet, name: 'graduation_marksheet' },
      { url: student.otherMarksheet, name: 'other_marksheet' },
    ].filter(doc => doc.url);

    try {
      await Promise.all(
        documentFields.map(async (doc) => {
          try {
            const response = await fetch(doc.url, {
              headers: {
                "Authorization": `Bearer ${user?.token}`, // Add token if required by backend
              },
            });
            if (!response.ok) throw new Error(`Failed to fetch ${doc.name}`);
            const blob = await response.blob();
            const fileExtension = doc.url.split('.').pop();
            zip.file(`${doc.name}.${fileExtension}`, blob);
          } catch (error) {
            console.error(`Error fetching ${doc.name}:`, error);
          }
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${student.studentName}_documents.zip`);
    } catch (error) {
      console.error('Error downloading documents:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No students found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Father Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Mobile Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{student.studentName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.fatherName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.course}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.mobileNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <button
                    onClick={() => downloadDocuments(student)}
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Allstudents;