import React, { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import EditModal from "../../components/EditModal";
import { showConfirm } from "../../components/Alert";
import { FaDownload, FaTrash } from "react-icons/fa"; // Importing icons from react-icons

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string; // Add the token property
}

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
  otherDocument?: string;
  abcDebScreenshot?: string;
  highSchoolMarksheet?: string;
  intermediateMarksheet?: string;
  graduationMarksheet?: string;
  otherMarksheet?: string;
  university?: string; // Added university field (lowercase)
};

const Allstudents: React.FC = () => {
  // Type the useAuth hook to return a user with the User type
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
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

  // Filter states
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>("All"); // Track which button filter is active

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
        // Ensure applicationStatus is "New" by default if not set
        const updatedData = data.map((student) => ({
          ...student,
          applicationStatus: student.applicationStatus || "New",
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

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...students];

    // Filter by Application Status
    if (applicationStatusFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.applicationStatus === applicationStatusFilter
      );
    }

    // Filter by Session
    if (sessionFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.admissionSession === sessionFilter
      );
    }

    // Filter by Button (Total Applications, Documents, Total Processed, Total Enrolled)
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

    // Filter by Search Query (Student Name)
    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applicationStatusFilter, sessionFilter, searchQuery, activeFilter, students]);

  // Pagination logic
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
      setFilteredStudents(filteredStudents.filter((student) => student._id !== studentId));
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
      setFilteredStudents(filteredStudents.map((student) => (student._id === editField.studentId ? { ...student, ...updatedStudent } : student)));
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

  const openDocModal = (student: StudentData) => {
    if (user?.role !== "superadmin") {
      window.alert("Only superadmins can view document details");
      return;
    }
    setSelectedStudent(student);
    setIsDocModalOpen(true);
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedStudent(null);
  };

  const openImageModal = (imageUrl: string) => {
    if (!selectedStudent) return;

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

  // Button filter handlers
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
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Application Status Filter */}
            <div>
              <select
                value={applicationStatusFilter}
                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Payment Received">Payment Received</option>
                <option value="Enrolled">Enrolled</option>
              </select>
            </div>

            {/* Session Filter */}
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="All">All</option>
                <option value="Jan-2025">Jan-2025</option>
                <option value="Jan-2024">Jan-2024</option>
              </select>
            </div>
          </div>

          {/* Search and Processed On Button */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded-md"
            />
            <button
              // onClick={() => window.alert("Processed On button clicked!")} // Placeholder action
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Processed On
            </button>
          </div>
        </div>

        {/* Stats Section with Buttons */}
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            onClick={handleTotalApplicationsClick}
            className={`p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors ${
              activeFilter === "All" ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            Total Applications: {students.length}
          </button>
          <button
            onClick={handleDocumentsClick}
            className={`p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors ${
              activeFilter === "Documents" ? "bg-gray-200" : "bg-gray-100"
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
            className={`p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors ${
              activeFilter === "Total Processed" ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            Total Processed: {students.filter((s) => s.processedOn).length}
          </button>
          <button
            onClick={handleTotalEnrolledClick}
            className={`p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors ${
              activeFilter === "Total Enrolled" ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            Total Enrolled: {students.filter((s) => s.enrollmentNumber).length}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase"></th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Application Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Processed On</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Photo</th>
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">University</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Adm Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">ABC ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">DEB ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedStudents.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700 flex space-x-2">
                  <button
                    onClick={() => downloadDocuments(student)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FaTrash />
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
                <td className="px-6 py-4 text-sm text-gray-700">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt="Student"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    "N/A"
                  )}
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
                <td
                  className={`px-6 py-4 text-sm text-gray-700 ${user?.role === "superadmin" ? "cursor-pointer text-blue-500" : ""}`}
                  onClick={() => openDocModal(student)}
                >
                  Pending
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
                <td className="px-6 py-4 text-sm text-gray-700">{student.university || "N/A"}</td> {/* Fixed case: University to university */}
                <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(student.admDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.apaarAbcId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.debId || "N/A"}</td>
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
              className="p-2 border rounded-md"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              ←
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal for Fields */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateStudentField}
        value={editValue}
        onChange={setEditValue}
        field={editField?.field} // Pass the field to determine input type
      />

      {/* Document Status Modal */}
      {isDocModalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={closeDocModal}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto sm:w-11/12 md:w-3/4 lg:w-1/2 z-50">
            <div className="flex justify-between items-center mb-4 pt-4">
              <h2 className="text-xl font-bold">Report Pendency</h2>
              <button onClick={closeDocModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Document Checkboxes */}
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Photo
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Address ID Proof
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Student Signature
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                High School
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Intermediate
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Graduation
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Other
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                ABC and DEB ID Screenshot
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Other Document
              </label>
            </div>

            {/* Remark Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Remark</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Enter remarks..."
              ></textarea>
            </div>

            {/* Uploaded Documents */}
            <div className="pb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Docs:</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  selectedStudent.photo,
                  selectedStudent.addressIdProof,
                  selectedStudent.studentSignature,
                  selectedStudent.highSchoolMarksheet,
                  selectedStudent.intermediateMarksheet,
                  selectedStudent.graduationMarksheet,
                  selectedStudent.otherMarksheet,
                  selectedStudent.abcDebScreenshot,
                  selectedStudent.otherDocument,
                ]
                  .filter((doc) => doc)
                  .map((doc, index) => (
                    <img
                      key={index}
                      src={doc}
                      alt="Document"
                      className="w-full h-24 object-cover rounded-md cursor-pointer"
                      onClick={() => openImageModal(doc!)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Document Preview</h2>
              <button onClick={closeImageModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="relative">
              <img
                src={selectedImage}
                alt="Document Preview"
                className="w-full max-h-[80vh] object-contain"
              />
              {currentImageIndex > 0 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => prev - 1);
                    setSelectedImage(imageList[currentImageIndex - 1]);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                  ←
                </button>
              )}
              {currentImageIndex < imageList.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => prev + 1);
                    setSelectedImage(imageList[currentImageIndex + 1]);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                  →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allstudents;