import React, { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";
import Placeholder from "../../components/Placeholder";
import { useAlert } from "../../components/Alert";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  AcademicCapIcon, 
  ArrowDownTrayIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

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
  semester?: number;
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
  pendencyRemarks?: string;
  pendencyDate?: string;
  reRegistrationStatus?: string;
  lastReRegistrationDate?: string;
  nextReRegistrationEligible?: string;
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
        ) : field === "semester" ? (
          <input
            type="number"
            min="1"
            max="8"
            value={value || "1"}
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
  const { showAlert, showConfirm } = useAlert();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [pendingDocs, setPendingDocs] = useState<string[]>([]);
  const [remark, setRemark] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState<{ studentId: string; field: keyof StudentData } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const navigate = useNavigate();

  // Filter states
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");
  const [universityFilter, setUniversityFilter] = useState<string>("All");
  const [centerSearch, setCenterSearch] = useState<string>("");
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
          docStatus: student.docStatus || "Pending",
        }));
        setStudents(updatedData);
        setFilteredStudents(updatedData);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Error fetching students";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, checkAuth]);

  useEffect(() => {
    let filtered = [...students];

    // Apply dropdown filters first
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

    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quick filters
    if (activeFilter === "Documentation") {
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
    } else if (activeFilter === "Pendencies") {
      filtered = filtered.filter((student) => 
        student.docStatus === "Pendency"
      );
    } else if (activeFilter === "Verified") {
      filtered = filtered.filter((student) => student.docStatus === "Verified");
    } else if (activeFilter === "Total Processed") {
      filtered = filtered.filter((student) => student.processedOn);
    } else if (activeFilter === "Total Enrolled") {
      filtered = filtered.filter((student) => student.enrollmentNumber);
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
    const loadingToast = toast.loading('Preparing documents for download...');
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
          // Don't convert to HTTPS for localhost
          const documentUrl = doc.url || "";
          const response = await fetch(documentUrl, {
            method: 'GET',
            credentials: "include",
            headers: { 
              "Authorization": `Bearer ${user?.token}`,
              "Content-Type": "application/json"
            },
          });
          if (!response.ok) {
            console.warn(`Failed to fetch ${doc.name}: ${response.status}`);
            return; // Skip this document instead of throwing
          }
          const blob = await response.blob();
          const fileExtension = doc.url?.split(".").pop() || "jpg";
          zip.file(`${doc.name}.${fileExtension}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${student.studentName}_documents.zip`);
      toast.dismiss(loadingToast);
      toast.success('Documents downloaded successfully!');
    } catch (error) {
      console.error("Error downloading documents:", error);
      toast.dismiss(loadingToast);
      toast.error('Failed to download some documents. Please try again.');
    }
  };

  const downloadSelectedDocuments = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to download documents.");
      return;
    }

    const loadingToast = toast.loading('Preparing selected documents for download...');
    const zip = new JSZip();
    const selectedStudentsData = students.filter((student) =>
      selectedStudents.includes(student._id)
    );

    try {
      await Promise.all(
        selectedStudentsData.map(async (student) => {
          const studentFolder = zip.folder(student.studentName)!;
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
              // Don't convert to HTTPS for localhost
              const documentUrl = doc.url || "";
              const response = await fetch(documentUrl, {
                method: 'GET',
                credentials: "include",
                headers: { 
                  "Authorization": `Bearer ${user?.token}`,
                  "Content-Type": "application/json"
                },
              });
              if (!response.ok) {
                console.warn(`Failed to fetch ${doc.name} for ${student.studentName}: ${response.status}`);
                return; // Skip this document instead of throwing
              }
              const blob = await response.blob();
              const fileExtension = doc.url?.split(".").pop() || "jpg";
              studentFolder.file(`${doc.name}.${fileExtension}`, blob);
            })
          );
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "selected_students_documents.zip");
      toast.dismiss(loadingToast);
      toast.success('Selected documents downloaded successfully!');
    } catch (error) {
      console.error("Error downloading selected documents:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to download some documents. Please try again.");
    }
  };

  const deleteStudent = async (studentId: string) => {
    const confirmed = await showConfirm(`Are you sure you want to delete the student with ID: ${studentId}?`);
    if (!confirmed) return;

    const loadingToast = toast.loading('Deleting student...');
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
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
      toast.dismiss(loadingToast);
      toast.success("Student deleted successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error deleting student";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const updateStudentField = async (studentId: string, updates: Partial<StudentData>) => {
    const loadingToast = toast.loading('Updating student...');
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
      
      // Update both students arrays immediately
      const updateStudentInArray = (studentArray: StudentData[]) =>
        studentArray.map((student) => 
          student._id === studentId ? { ...student, ...updatedStudent } : student
        );
      
      setStudents(updateStudentInArray);
      setFilteredStudents(updateStudentInArray);
      
      toast.dismiss(loadingToast);
      toast.success("Field updated successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error updating student field";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    }
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
      toast.error("Only superadmins can view document details or admins can view pendency");
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
      showAlert("Please select at least one document to mark as pending.");
      return;
    }

    await updateStudentField(selectedStudent._id, {
      docStatus: "Pendency",
      pendingDocuments: pendingDocs,
      pendencyRemarks: remark,
      pendencyDate: new Date().toISOString(),
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
    setActiveFilter("Documentation");
  };

  const handlePendenciesClick = () => {
    setActiveFilter("Pendencies");
  };

  const handleVerifiedClick = () => {
    setActiveFilter("Verified");
  };

  const handleTotalProcessedClick = () => {
    setActiveFilter("Total Processed");
  };

  const handleTotalEnrolledClick = () => {
    setActiveFilter("Total Enrolled");
  };

  const handleEditField = (studentId: string, field: keyof StudentData, value: string) => {
    setEditField({ studentId, field });
    setEditValue(value || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editField) {
      const value = editField.field === "semester" ? parseInt(editValue) || 1 : editValue;
      updateStudentField(editField.studentId, { [editField.field]: value });
      setIsEditModalOpen(false);
      setEditField(null);
      setEditValue("");
    }
  };

  if (loading) return <Placeholder type="loading" />;
  if (error) return <Placeholder type="error" message={error} />;
  if (students.length === 0) return <Placeholder type="empty" message="No students found." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Student Management</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage and monitor all student applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="stats-card cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={handleTotalApplicationsClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-white">{students.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div 
            className="stats-card stats-card-warning cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={handleDocumentsClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Documentation</p>
                <p className="text-3xl font-bold text-white">
                  {students.filter(
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
                  ).length}
                </p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div 
            className="stats-card stats-card-secondary cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={handleTotalProcessedClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Processed</p>
                <p className="text-3xl font-bold text-white">{students.filter((s) => s.processedOn).length}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div 
            className="stats-card stats-card-success cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={handleTotalEnrolledClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Enrolled</p>
                <p className="text-3xl font-bold text-white">{students.filter((s) => s.enrollmentNumber).length}</p>
              </div>
              <AcademicCapIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-col gap-6">
              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10 w-full"
                  />
                </div>
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by center code..."
                    value={centerSearch}
                    onChange={(e) => setCenterSearch(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Status</label>
                  <select
                    value={applicationStatusFilter}
                    onChange={(e) => setApplicationStatusFilter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="All">All Status</option>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                  <select
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="All">All Sessions</option>
                    <option value="Jan-2025">Jan-2025</option>
                    <option value="Jan-2024">Jan-2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  <select
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="All">All Universities</option>
                    <option value="Mangalayatan University- Online">Mangalayatan University- Online</option>
                    <option value="Mangalayatan University- Distance">Mangalayatan University- Distance</option>
                    <option value="Subharti University">Subharti University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entries per page</label>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="form-select w-full"
                  >
                    <option value={10}>10 entries</option>
                    <option value={25}>25 entries</option>
                    <option value={50}>50 entries</option>
                    <option value={100}>100 entries</option>
                  </select>
                </div>
              </div>

              {/* Quick Filters Section */}
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Quick Filters:</span>
                  <button
                    onClick={handleTotalApplicationsClick}
                    className={`btn btn-sm ${activeFilter === "All" ? "btn-primary" : "btn-secondary"}`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={handlePendenciesClick}
                    className={`btn btn-sm ${activeFilter === "Pendencies" ? "btn-warning" : "btn-secondary"}`}
                  >
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    Pendencies ({students.filter((s) => s.docStatus === "Pendency").length})
                  </button>
                  <button
                    onClick={handleVerifiedClick}
                    className={`btn btn-sm ${activeFilter === "Verified" ? "btn-success" : "btn-secondary"}`}
                  >
                    <ShieldCheckIcon className="w-4 h-4 mr-1" />
                    Verified ({students.filter((s) => s.docStatus === "Verified").length})
                  </button>
                  <button
                    onClick={handleTotalProcessedClick}
                    className={`btn btn-sm ${activeFilter === "Total Processed" ? "btn-secondary" : "btn-secondary"}`}
                  >
                    Processed ({students.filter((s) => s.processedOn).length})
                  </button>
                  <button
                    onClick={handleTotalEnrolledClick}
                    className={`btn btn-sm ${activeFilter === "Total Enrolled" ? "btn-success" : "btn-secondary"}`}
                  >
                    Enrolled ({students.filter((s) => s.enrollmentNumber).length})
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadSelectedDocuments}
                    className="btn btn-primary"
                    disabled={selectedStudents.length === 0}
                    title="Download selected students' documents"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Selected ({selectedStudents.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table - Simplified for Better Readability */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th>Student Details</th>
                  <th>Academic Info</th>
                  <th>Application Status</th>
                  <th>Documents & IDs</th>
                  <th>Contact & Center</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => handleStudentSelection(student._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    {/* Student Details */}
                    <td>
                      <div className="flex items-center space-x-3">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt="Student"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                            onClick={() => openImageModal(student.photo!)}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{student.studentName}</div>
                          <div className="text-xs text-gray-500">Father: {student.fatherName}</div>
                          <div className="text-xs text-gray-400">DOB: {new Date(student.dob).toLocaleDateString()}</div>
                          <div className="text-xs text-blue-600">Ref: {student.referenceId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Academic Info */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-gray-900">{student.course}</div>
                        <div className="text-xs text-gray-600">{student.admissionType}</div>
                        <div className="text-xs text-blue-600 font-medium">{student.admissionSession}</div>
                        <div className="text-xs text-gray-500">
                          Year: {student.year ? (
                            user?.role === "superadmin" ? (
                              <span 
                                className="cursor-pointer hover:text-blue-600"
                                onClick={() => handleEditField(student._id, "year", student.year || "")}
                              >
                                {student.year}
                              </span>
                            ) : (
                              student.year
                            )
                          ) : user?.role === "superadmin" ? (
                            <span 
                              className="text-gray-400 cursor-pointer hover:text-blue-600"
                              onClick={() => handleEditField(student._id, "year", "")}
                            >
                              + Set year
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Semester: {user?.role === "superadmin" ? (
                            <span 
                              className="cursor-pointer hover:text-green-800"
                              onClick={() => handleEditField(student._id, "semester", (student.semester || 1).toString())}
                            >
                              {student.semester || 1}
                            </span>
                          ) : (
                            student.semester || 1
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Application Status */}
                    <td>
                      <div className="space-y-2">
                        {user?.role === "superadmin" ? (
                          <select
                            value={student.applicationStatus || "New"}
                            onChange={(e) => updateStudentField(student._id, { applicationStatus: e.target.value })}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${getApplicationStatusColor(student.applicationStatus)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Payment Received">Payment Received</option>
                            <option value="Enrolled">Enrolled</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApplicationStatusColor(student.applicationStatus)}`}>
                            {student.applicationStatus || "New"}
                          </span>
                        )}
                        
                        {student.processedOn ? (
                          <div 
                            className={`text-xs text-green-600 ${user?.role === "superadmin" ? "cursor-pointer hover:text-green-800" : ""}`}
                            onClick={() => user?.role === "superadmin" && handleEditField(student._id, "processedOn", student.processedOn || "")}
                          >
                            ✓ Processed: {new Date(student.processedOn).toLocaleDateString()}
                          </div>
                        ) : user?.role === "superadmin" && (
                          <div 
                            className="text-xs text-gray-400 cursor-pointer hover:text-blue-600"
                            onClick={() => handleEditField(student._id, "processedOn", "")}
                          >
                            + Set processed date
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Documents & IDs */}
                    <td>
                      <div className="space-y-2">
                        <button
                          onClick={() => openDocModal(student)}
                          className={`text-xs px-2 py-1 rounded-full ${getDocStatusColor(student.docStatus)} hover:bg-opacity-20 transition-colors`}
                        >
                          {student.docStatus || "Pending"}
                        </button>
                        
                        <div className="space-y-1">
                          {student.applicationNumber ? (
                            <div 
                              className={`text-xs text-gray-600 ${user?.role === "superadmin" ? "cursor-pointer hover:text-blue-600" : ""}`}
                              onClick={() => user?.role === "superadmin" && handleEditField(student._id, "applicationNumber", student.applicationNumber || "")}
                            >
                              App: {student.applicationNumber}
                            </div>
                          ) : user?.role === "superadmin" && (
                            <div 
                              className="text-xs text-gray-400 cursor-pointer hover:text-blue-600"
                              onClick={() => handleEditField(student._id, "applicationNumber", "")}
                            >
                              + Set application number
                            </div>
                          )}
                          
                          {student.enrollmentNumber ? (
                            <div 
                              className={`text-xs text-green-600 ${user?.role === "superadmin" ? "cursor-pointer hover:text-green-800" : ""}`}
                              onClick={() => user?.role === "superadmin" && handleEditField(student._id, "enrollmentNumber", student.enrollmentNumber || "")}
                            >
                              Enroll: {student.enrollmentNumber}
                            </div>
                          ) : user?.role === "superadmin" && (
                            <div 
                              className="text-xs text-gray-400 cursor-pointer hover:text-blue-600"
                              onClick={() => handleEditField(student._id, "enrollmentNumber", "")}
                            >
                              + Set enrollment number
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 pt-1 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            ABC: {student.apaarAbcId}
                          </div>
                          <div className="text-xs text-gray-500">
                            DEB: {student.debId || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Center */}
                    <td>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{student.centerName || "N/A"}</div>
                        <div className="text-xs text-gray-500">Code: {student.center}</div>
                        <div className="text-xs text-gray-400">{student.university}</div>
                        
                        <div className="pt-1 border-t border-gray-100 space-y-1">
                          <div className="text-xs text-gray-600">{student.email}</div>
                          <div className="text-xs text-gray-500">{student.mobileNumber}</div>
                          <div className="text-xs text-gray-400">
                            Adm: {new Date(student.admDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadDocuments(student)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Download documents"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStudent(student._id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete student"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
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