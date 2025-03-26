import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import EditModal from "../../components/EditModal";
import { showConfirm } from "../../components/Alert";

type StudentData = {
  _id: string;
  center: string; // 4-digit code from Applyfresh
  centerName: string; // Fetched name from Applyfresh
  admissionSession: string;
  admissionType: string;
  course: string;
  fatherName: string;
  studentName: string;
  dob: string;
  mobileNumber: string;
  apaarAbcId: string;
  email: string;
  year?: string;
  debId?: string;
  applicationNumber?: string;
  enrollmentNumber?: string;
  processedOn?: string;
  studentStatus?: string;
  applicationStatus?: string;
  referenceId: string;
  admDate: string;
  photo?: string;
  studentSignature?: string;
  addressIdProof?: string;
};

const Allstudents: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState<{ studentId: string; field: keyof StudentData } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view students");
          setLoading(false);
          return;
        }
      }

      try {
        const url = user.role === "admin" 
          ? `${API_URL}/api/students?center=${user.centerId}` 
          : `${API_URL}/api/students`;
        const response = await fetch(url, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch students");
        }

        const data: StudentData[] = await response.json();
        setStudents(data);
      } catch (error: any) {
        setError(error.message || "Error fetching students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, checkAuth]);

  const downloadDocuments = async (student: StudentData) => {
    const zip = new JSZip();
    const documentFields = [
      { url: student.photo, name: "photo" },
      { url: student.studentSignature, name: "signature" },
      { url: student.addressIdProof, name: "address_id_proof" },
    ].filter((doc) => doc.url);

    try {
      await Promise.all(
        documentFields.map(async (doc) => {
          const response = await fetch(doc.url || "", {
            credentials: "include",
            headers: { "Authorization": `Bearer ${user?.token}` },
          });
          if (!response.ok) throw new Error(`Failed to fetch ${doc.name}`);
          const blob = await response.blob();
          const fileExtension = doc.url?.split(".").pop();
          zip.file(`${doc.name}.${fileExtension}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${student.studentName}_documents.zip`);
    } catch (error) {
      console.error("Error downloading documents:", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!showConfirm(`Are you sure you want to delete the student with ID: ${studentId}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student");
      }

      setStudents(students.filter((student) => student._id !== studentId));
      window.alert("Student deleted successfully");
    } catch (error: any) {
      setError(error.message || "Error deleting student");
    }
  };

  const updateStudentField = async () => {
    if (!editField || !editValue) return;

    try {
      const response = await fetch(`${API_URL}/api/students/${editField.studentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [editField.field]: editValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student");
      }

      const updatedStudent = await response.json();
      setStudents(students.map((student) => (student._id === editField.studentId ? { ...student, ...updatedStudent } : student)));
      setIsModalOpen(false);
      setEditValue("");
      setEditField(null);
      window.alert("Field updated successfully");
    } catch (error: any) {
      setError(error.message || "Error updating student field");
    }
  };

  const openEditModal = (studentId: string, field: keyof StudentData, currentValue?: string) => {
    if (user?.role !== "superadmin") {
      window.alert("Only superadmins can edit this field");
      return;
    }
    setEditField({ studentId, field });
    setEditValue(currentValue || "");
    setIsModalOpen(true);
  };

  if (loading) return <Placeholder type="loading" />;
  if (error) return <Placeholder type="error" message={error} />;
  if (students.length === 0) return <Placeholder type="empty" message="No students found." />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Actions</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Application Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Processed On</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Reference ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Application Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Enrollment Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Doc Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Adm Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Session</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Student Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Father Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Current Year</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">DOB</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Center Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Center Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Adm Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">ABC ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">DEB ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700 flex space-x-2">
                  <button
                    onClick={() => downloadDocuments(student)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download Docs
                  </button>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
                <td
                  className={`px-6 py-4 text-sm text-gray-700 ${user?.role === "superadmin" ? "cursor-pointer" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "applicationStatus", student.applicationStatus)}
                >
                  {student.applicationStatus || "N/A"}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-gray-700 ${user?.role === "superadmin" ? "cursor-pointer" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "processedOn", student.processedOn)}
                >
                  {student.processedOn || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.referenceId}</td>
                <td
                  className={`px-6 py-4 text-sm text-gray-700 ${user?.role === "superadmin" ? "cursor-pointer" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "applicationNumber", student.applicationNumber)}
                >
                  {student.applicationNumber || "N/A"}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-gray-700 ${user?.role === "superadmin" ? "cursor-pointer" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "enrollmentNumber", student.enrollmentNumber)}
                >
                  {student.enrollmentNumber || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {student.photo && student.studentSignature && student.addressIdProof ? "Complete" : "Incomplete"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.admissionType || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.admissionSession || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.studentStatus || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.studentName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.fatherName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.course}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.year || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(student.dob).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.center || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.centerName || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(student.admDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.apaarAbcId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.debId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateStudentField}
        value={editValue}
        onChange={setEditValue}
      />
    </div>
  );
};

export default Allstudents;