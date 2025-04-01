import React, { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import { useAlert } from "../../components/Alert"; // Import the new useAlert hook
import { FaDownload, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

type StudentData = {
  _id: string;
  center: string;
  centerName: string;
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
  otherDocument?: string;
  abcDebScreenshot?: string;
  highSchoolMarksheet?: string;
  intermediateMarksheet?: string;
  graduationMarksheet?: string;
  otherMarksheet?: string;
  university?: string;
  motherName: string;
  docStatus?: string;
  pendingDocuments?: string[];
};

// Custom EditModal Component with Calendar for Processed On
const EditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  value: string;
  onChange: (value: string) => void;
  field?: keyof StudentData;
}> = ({ isOpen, onClose, onSave, value, onChange, field }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-transperent bg-opacity-75 backdrop-blur-sm transition-opacity duration-300"
       onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-md z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-800">Edit {field}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        {field === "processedOn" ? (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50"
          />
        ) : (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50"
          />
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onSave}
            className="bg-blue-500 text-white py-2 px-5 rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Allstudents: React.FC = () => {
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
  const { showAlert, showConfirm } = useAlert(); // Use the new useAlert hook
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState<{ studentId: string; field: keyof StudentData } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [pendingDocs, setPendingDocs] = useState<string[]>([]); // State for selected pending documents
  const [remark, setRemark] = useState<string>(""); // State for remarks
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // State for selected student IDs
  const navigate = useNavigate();

  // Filter states
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");
  const [universityFilter, setUniversityFilter] = useState<string>("All"); // New state for university filter
  const [centerSearch, setCenterSearch] = useState<string>(""); // New state for center search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>("All");

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
        const updatedData = data.map((student) => ({
          ...student,
          applicationStatus: student.applicationStatus || "New",
          docStatus: student.docStatus || "Pending", // Ensure default docStatus
        }));
        setStudents(updatedData);
        setFilteredStudents(updatedData);
      } catch (error: any) {
        setError(error.message || "Error fetching students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, checkAuth]);

  useEffect(() => {
    let filtered = [...students];

    if (applicationStatusFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.applicationStatus === applicationStatusFilter
      );
    }

    if (sessionFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.admissionSession === sessionFilter
      );
    }

    if (universityFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.university === universityFilter
      );
    }

    if (centerSearch) {
      filtered = filtered.filter((student) =>
        student.center.toLowerCase().includes(centerSearch.toLowerCase())
      );
    }

    if (activeFilter === "Documents") {
      filtered = filtered.filter(
        (student) =>
          !student.photo ||
          !student.studentSignature ||
          !student.addressIdProof ||
          !student.highSchoolMarksheet ||
          !student.intermediateMarksheet ||
          !student.graduationMarksheet ||
          !student.otherMarksheet ||
          !student.abcDebScreenshot ||
          !student.otherDocument
      );
    } else if (activeFilter === "Total Processed") {
      filtered = filtered.filter((student) => student.processedOn);
    } else if (activeFilter === "Total Enrolled") {
      filtered = filtered.filter((student) => student.enrollmentNumber);
    }

    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [applicationStatusFilter, sessionFilter, universityFilter, centerSearch, searchQuery, activeFilter, students]);

  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const downloadDocuments = async (student: StudentData) => {
    const zip = new JSZip();
    const documentFields = [
      { url: student.photo, name: "photo" },
      { url: student.studentSignature, name: "signature" },
      { url: student.addressIdProof, name: "address_id_proof" },
      { url: student.otherDocument, name: "other_document" },
      { url: student.abcDebScreenshot, name: "abc_deb_screenshot" },
      { url: student.highSchoolMarksheet, name: "high_school_marksheet" },
      { url: student.intermediateMarksheet, name: "intermediate_marksheet" },
      { url: student.graduationMarksheet, name: "graduation_marksheet" },
      { url: student.otherMarksheet, name: "other_marksheet" },
    ].filter((doc) => doc.url);

    try {
      await Promise.all(
        documentFields.map(async (doc) => {
          const secureUrl = doc.url?.replace("http://", "https://") || "";
          const response = await fetch(secureUrl, {
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

  const downloadSelectedDocuments = async () => {
    if (selectedStudents.length === 0) {
      showAlert("Please select at least one student to download documents."); // Updated to use showAlert
      return;
    }

    const zip = new JSZip();
    const selectedStudentsData = students.filter((student) =>
      selectedStudents.includes(student._id)
    );

    try {
      await Promise.all(
        selectedStudentsData.map(async (student) => {
          const studentFolder = zip.folder(student.studentName)!; // Create a folder for each student
          const documentFields = [
            { url: student.photo, name: "photo" },
            { url: student.studentSignature, name: "signature" },
            { url: student.addressIdProof, name: "address_id_proof" },
            { url: student.otherDocument, name: "other_document" },
            { url: student.abcDebScreenshot, name: "abc_deb_screenshot" },
            { url: student.highSchoolMarksheet, name: "high_school_marksheet" },
            { url: student.intermediateMarksheet, name: "intermediate_marksheet" },
            { url: student.graduationMarksheet, name: "graduation_marksheet" },
            { url: student.otherMarksheet, name: "other_marksheet" },
          ].filter((doc) => doc.url);

          await Promise.all(
            documentFields.map(async (doc) => {
              const secureUrl = doc.url?.replace("http://", "https://") || "";
              const response = await fetch(secureUrl, {
                credentials: "include",
                headers: { "Authorization": `Bearer ${user?.token}` },
              });
              if (!response.ok) throw new Error(`Failed to fetch ${doc.name}`);
              const blob = await response.blob();
              const fileExtension = doc.url?.split(".").pop();
              studentFolder.file(`${doc.name}.${fileExtension}`, blob);
            })
          );
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "selected_students_documents.zip");
    } catch (error) {
      console.error("Error downloading selected documents:", error);
      showAlert("Failed to download documents. Please try again."); // Updated to use showAlert
    }
  };

  const deleteStudent = async (studentId: string) => {
    const confirmed = await showConfirm(`Are you sure you want to delete the student with ID: ${studentId}?`); // Updated to use showConfirm
    if (!confirmed) return;

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
      setFilteredStudents(filteredStudents.filter((student) => student._id !== studentId));
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId)); // Remove from selected
      showAlert("Student deleted successfully"); // Updated to use showAlert
    } catch (error: any) {
      setError(error.message || "Error deleting student");
    }
  };

  const updateStudentField = async (studentId: string, updates: Partial<StudentData>) => {
    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Authorization": `Bearer ${user?.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student");
      }

      const updatedStudent = await response.json();
      setStudents(students.map((student) => (student._id === studentId ? { ...student, ...updatedStudent } : student)));
      setFilteredStudents(filteredStudents.map((student) => (student._id === studentId ? { ...student, ...updatedStudent } : student)));
      showAlert("Field updated successfully"); // Updated to use showAlert
    } catch (error: any) {
      setError(error.message || "Error updating student field");
    }
  };

  const openEditModal = (studentId: string, field: keyof StudentData, currentValue?: string) => {
    if (user?.role !== "superadmin") {
      showAlert("Only superadmins can edit this field"); // Updated to use showAlert
      return;
    }
    setEditField({ studentId, field });
    setEditValue(currentValue || "");
    setIsModalOpen(true);
  };

  const openDocModal = (student: StudentData) => {
    if (user?.role === "superadmin") {
      setSelectedStudent(student);
      setPendingDocs(student.pendingDocuments || []);
      setRemark("");
      setIsDocModalOpen(true);
    } else if (user?.role === "admin" && student.docStatus === "Pendency") {
      navigate(`/pendency/${student._id}`);
    } else {
      showAlert("Only superadmins can view document details or admins can view pendency"); // Updated to use showAlert
    }
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedStudent(null);
    setPendingDocs([]);
    setRemark("");
  };

  const openImageModal = (imageUrl: string) => {
    if (!selectedStudent) {
      setSelectedImage(imageUrl);
      setIsImageModalOpen(true);
      return;
    }

    const images = [
      selectedStudent.photo,
      selectedStudent.addressIdProof,
      selectedStudent.studentSignature,
      selectedStudent.highSchoolMarksheet,
      selectedStudent.intermediateMarksheet,
      selectedStudent.graduationMarksheet,
      selectedStudent.otherMarksheet,
      selectedStudent.abcDebScreenshot,
      selectedStudent.otherDocument,
    ].filter((doc): doc is string => !!doc);

    setImageList(images);
    setCurrentImageIndex(images.indexOf(imageUrl));
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setImageList([]);
    setCurrentImageIndex(0);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isImageModalOpen) return;

    if (event.key === "ArrowRight" && currentImageIndex < imageList.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
      setSelectedImage(imageList[currentImageIndex + 1]);
    } else if (event.key === "ArrowLeft" && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
      setSelectedImage(imageList[currentImageIndex - 1]);
    }
  }, [isImageModalOpen, currentImageIndex, imageList]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const getApplicationStatusColor = (status: string | undefined) => {
    switch (status) {
      case "New":
        return "bg-gray-200 text-gray-800";
      case "In Progress":
        return "bg-blue-200 text-blue-800";
      case "Payment Received":
        return "bg-yellow-200 text-yellow-800";
      case "Enrolled":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getDocStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Pending":
        return "text-blue-500 hover:text-blue-700";
      case "Pendency":
        return "text-red-500 hover:text-red-700";
      case "Verified":
        return "text-green-500 hover:text-green-700";
      default:
        return "text-blue-500 hover:text-blue-700";
    }
  };

  const handlePendency = async () => {
    if (!selectedStudent) return;
    if (pendingDocs.length === 0) {
      showAlert("Please select at least one document to mark as pending."); // Updated to use showAlert
      return;
    }

    await updateStudentField(selectedStudent._id, {
      docStatus: "Pendency",
      pendingDocuments: pendingDocs,
    });
    closeDocModal();
  };

  const handleVerified = async () => {
    if (!selectedStudent) return;

    await updateStudentField(selectedStudent._id, {
      docStatus: "Verified",
      pendingDocuments: [],
    });
    closeDocModal();
  };

  const handleCheckboxChange = (doc: string, checked: boolean) => {
    if (checked) {
      setPendingDocs([...pendingDocs, doc]);
    } else {
      setPendingDocs(pendingDocs.filter((d) => d !== doc));
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map((student) => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleTotalApplicationsClick = () => {
    setActiveFilter("All");
  };

  const handleDocumentsClick = () => {
    setActiveFilter("Documents");
  };

  const handleTotalProcessedClick = () => {
    setActiveFilter("Total Processed");
  };

  const handleTotalEnrolledClick = () => {
    setActiveFilter("Total Enrolled");
  };

  if (loading) return <Placeholder type="loading" />;
  if (error) return <Placeholder type="error" message={error} />;
  if (students.length === 0) return <Placeholder type="empty" message="No students found." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">Students Management</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <select
                value={applicationStatusFilter}
                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
              >
                <option value="All">Application Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Payment Received">Payment Received</option>
                <option value="Enrolled">Enrolled</option>
              </select>
            </div>
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
              >
                <option value="All">Session</option>
                <option value="Jan-2025">Jan-2025</option>
                <option value="Jan-2024">Jan-2024</option>
              </select>
            </div>
            <div>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
              >
                <option value="All">University</option>
                <option value="Mangalayatan University- Online">Mangalayatan University- Online</option>
                <option value="Mangalayatan University- Distance">Mangalayatan University- Distance</option>
                <option value="Subharti University">Subharti University</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search by center code..."
                value={centerSearch}
                onChange={(e) => setCenterSearch(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
            />
            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-5 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-[11px] font-semibold"
            >
              Processed On
            </button>
            <button
              onClick={downloadSelectedDocuments}
              className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
              title="Download selected students' documents"
            >
              <FaDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleTotalApplicationsClick}
            className={`p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 text-[11px] font-medium ${
              activeFilter === "All" ? "bg-gray-50 shadow-md" : "bg-white"
            }`}
          >
            Total Applications: {students.length}
          </button>
          <button
            onClick={handleDocumentsClick}
            className={`p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 text-[11px] font-medium ${
              activeFilter === "Documents" ? "bg-gray-50 shadow-md" : "bg-white"
            }`}
          >
            Documents: {
              students.filter(
                (s) =>
                  !s.photo ||
                  !s.studentSignature ||
                  !s.addressIdProof ||
                  !s.highSchoolMarksheet ||
                  !s.intermediateMarksheet ||
                  !s.graduationMarksheet ||
                  !s.otherMarksheet ||
                  !s.abcDebScreenshot ||
                  !s.otherDocument
              ).length
            }
          </button>
          <button
            onClick={handleTotalProcessedClick}
            className={`p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 text-[11px] font-medium ${
              activeFilter === "Total Processed" ? "bg-gray-50 shadow-md" : "bg-white"
            }`}
          >
            Total Processed: {students.filter((s) => s.processedOn).length}
          </button>
          <button
            onClick={handleTotalEnrolledClick}
            className={`p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 text-[11px] font-medium ${
              activeFilter === "Total Enrolled" ? "bg-gray-50 shadow-md" : "bg-white"
            }`}
          >
            Total Enrolled: {students.filter((s) => s.enrollmentNumber).length}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto transition-all duration-300 hover:shadow-xl">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"></th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Application Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Processed On</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Reference ID</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Application Number</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Enrollment Number</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Doc Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Adm Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Session</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Student Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Father Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Course</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Current Year</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">DOB</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Center Code</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Center Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">University</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Adm Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">ABC ID</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">DEB ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedStudents.map((student, index) => (
              <tr
                key={student._id}
                className={`transition-all duration-200 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 hover:shadow-md`}
              >
                <td className="px-4 py-3 text-[11px] text-gray-800">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => handleStudentSelection(student._id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-800 flex space-x-2">
                  <button
                    onClick={() => downloadDocuments(student)}
                    className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
                  >
                    <FaDownload className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </td>
                <td className="px-4 py-3 text-[11px] font-medium">
                  {user?.role === "superadmin" ? (
                    <select
                      value={student.applicationStatus || "New"}
                      onChange={(e) => updateStudentField(student._id, { applicationStatus: e.target.value })}
                      className={`p-1 rounded-md ${getApplicationStatusColor(student.applicationStatus)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Payment Received">Payment Received</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  ) : (
                    <span className={`${getApplicationStatusColor(student.applicationStatus)} p-1 rounded-md`}>
                      {student.applicationStatus || "N/A"}
                    </span>
                  )}
                </td>
                <td
                  className={`px-4 py-3 text-[11px] text-gray-800 font-medium ${user?.role === "superadmin" ? "cursor-pointer hover:text-blue-600" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "processedOn", student.processedOn)}
                >
                  {student.processedOn || "N/A"}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-800">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt="Student"
                      className="w-7 h-7 rounded-full object-cover border border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                      onClick={() => openImageModal(student.photo!)}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.referenceId}</td>
                <td
                  className={`px-4 py-3 text-[11px] text-gray-800 font-medium ${user?.role === "superadmin" ? "cursor-pointer hover:text-blue-600" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "applicationNumber", student.applicationNumber)}
                >
                  {student.applicationNumber || "N/A"}
                </td>
                <td
                  className={`px-4 py-3 text-[11px] text-gray-800 font-medium ${user?.role === "superadmin" ? "cursor-pointer hover:text-blue-600" : ""}`}
                  onClick={() => user?.role === "superadmin" && openEditModal(student._id, "enrollmentNumber", student.enrollmentNumber)}
                >
                  {student.enrollmentNumber || "N/A"}
                </td>
                <td
                  className={`px-4 py-3 text-[11px] font-medium cursor-pointer ${getDocStatusColor(student.docStatus)}`}
                  onClick={() => openDocModal(student)}
                >
                  {student.docStatus || "Pending"}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.admissionType || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.admissionSession || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.studentStatus || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.studentName}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.fatherName}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.course}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.year || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{new Date(student.dob).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.center || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.centerName || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.university || "N/A"}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.email}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{new Date(student.admDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.apaarAbcId}</td>
                <td className="px-4 py-3 text-[11px] text-gray-800 font-medium">{student.debId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 transition-all duration-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-[11px] text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 text-[11px]"
            >
              ←
            </button>
            <span className="text-[11px] text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 text-[11px]"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          if (editField) {
            updateStudentField(editField.studentId, { [editField.field]: editValue });
            setIsModalOpen(false);
          }
        }}
        value={editValue}
        onChange={setEditValue}
        field={editField?.field}
      />

      {/* Document Modal for Superadmin */}
      {isDocModalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={closeDocModal}></div>
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-lg z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">Document Details - {selectedStudent.studentName}</h2>
              <button onClick={closeDocModal} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Photo", url: selectedStudent.photo, field: "photo" },
                { label: "Address ID Proof", url: selectedStudent.addressIdProof, field: "addressIdProof" },
                { label: "Student Signature", url: selectedStudent.studentSignature, field: "studentSignature" },
                { label: "High School Marksheet", url: selectedStudent.highSchoolMarksheet, field: "highSchoolMarksheet" },
                { label: "Intermediate Marksheet", url: selectedStudent.intermediateMarksheet, field: "intermediateMarksheet" },
                { label: "Graduation Marksheet", url: selectedStudent.graduationMarksheet, field: "graduationMarksheet" },
                { label: "Other Marksheet", url: selectedStudent.otherMarksheet, field: "otherMarksheet" },
                { label: "ABC DEB Screenshot", url: selectedStudent.abcDebScreenshot, field: "abcDebScreenshot" },
                { label: "Other Document", url: selectedStudent.otherDocument, field: "otherDocument" },
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pendingDocs.includes(doc.field)}
                      onChange={(e) => handleCheckboxChange(doc.field, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-[11px] text-gray-800">{doc.label}:</span>
                  </div>
                  {doc.url ? (
                    <img
                      src={doc.url}
                      alt={doc.label}
                      className="w-10 h-10 object-cover rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                      onClick={() => openImageModal(doc.url!)}
                    />
                  ) : (
                    <span className="text-[11px] text-gray-500">Not Uploaded</span>
                  )}
                </div>
              ))}
              <div className="mt-4">
                <label className="text-[11px] text-gray-800">Remarks:</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[11px] bg-gray-50 mt-1"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePendency}
                className="bg-red-500 text-white py-2 px-5 rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                Pendency
              </button>
              <button
                onClick={handleVerified}
                className="bg-green-500 text-white py-2 px-5 rounded-lg hover:bg-green-600 transition-all duration-200"
              >
                Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={closeImageModal}></div>
          <div className="relative z-50">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white text-2xl bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-all duration-200"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Document"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
            />
            {imageList.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4">
                <button
                  onClick={() => {
                    if (currentImageIndex > 0) {
                      setCurrentImageIndex(currentImageIndex - 1);
                      setSelectedImage(imageList[currentImageIndex - 1]);
                    }
                  }}
                  disabled={currentImageIndex === 0}
                  className="text-white text-2xl bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    if (currentImageIndex < imageList.length - 1) {
                      setCurrentImageIndex(currentImageIndex + 1);
                      setSelectedImage(imageList[currentImageIndex + 1]);
                    }
                  }}
                  disabled={currentImageIndex === imageList.length - 1}
                  className="text-white text-2xl bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Allstudents;