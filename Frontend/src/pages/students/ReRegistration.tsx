import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon
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
  email: string;
  year?: string;
  semester?: number;
  enrollmentNumber?: string;
  applicationStatus?: string;
  referenceId: string;
  university?: string;
  reRegistrationStatus?: string;
  lastReRegistrationDate?: string;
  nextReRegistrationEligible?: string;
  photo?: string;
};

const ReRegistration: React.FC = () => {
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
  const [students, setStudents] = useState<StudentData[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<StudentData[]>([]);
  const [appliedStudents, setAppliedStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("Jan-2025");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const sessions = ["Jan-2025", "Jan-2024", "July-2024"];
  const universities = [
    "All",
    "Mangalayatan University- Online",
    "Mangalayatan University- Distance", 
    "Subharti University"
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view re-registration");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      
      try {
        const url = user.role === "admin"
          ? `${API_URL}/api/students?center=${user.centerId}`
          : `${API_URL}/api/students`;
        
        const response = await fetch(url, {
          credentials: "include",
          headers: { 
            "Authorization": `Bearer ${user?.token}`, 
            "Content-Type": "application/json" 
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch students");
        }

        const data: StudentData[] = await response.json();
        setStudents(data);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Error fetching students";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, checkAuth]);

  // Filter students based on session and university
  useEffect(() => {
    const filtered = students.filter(student => {
      // Filter by session
      if (student.admissionSession !== selectedSession) return false;
      
      // Filter by university
      if (selectedUniversity !== "All" && student.university !== selectedUniversity) return false;
      
      // Filter by search query
      if (searchQuery && !student.studentName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    // Separate eligible and applied students
    const eligible = filtered.filter(student => 
      student.reRegistrationStatus === "Eligible" && 
      student.enrollmentNumber && // Must be enrolled
      student.semester // Must have semester info
    );
    
    const applied = filtered.filter(student => 
      student.reRegistrationStatus === "Applied"
    );

    setEligibleStudents(eligible);
    setAppliedStudents(applied);
  }, [students, selectedSession, selectedUniversity, searchQuery]);

  const handleReRegistrationApply = (student: StudentData) => {
    setSelectedStudent(student);
    setIsConfirmModalOpen(true);
  };

  const confirmReRegistration = async () => {
    if (!selectedStudent) return;

    const loadingToast = toast.loading('Processing re-registration...');
    
    try {
      const newSemester = (selectedStudent.semester || 1) + 1;
      const newYear = Math.ceil(newSemester / 2); // Calculate year based on semester (2 semesters per year)
      
      const response = await fetch(`${API_URL}/api/students/${selectedStudent._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          "Authorization": `Bearer ${user?.token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          reRegistrationStatus: "Applied",
          lastReRegistrationDate: new Date().toISOString(),
          semester: newSemester, // Increment semester
          year: newYear.toString(), // Update year based on semester
          // Set next eligibility date to 5 months from now
          nextReRegistrationEligible: new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process re-registration");
      }

      const updatedStudent = await response.json();
      
      // Update students array
      setStudents(students.map(student => 
        student._id === selectedStudent._id ? { ...student, ...updatedStudent } : student
      ));
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedStudent.studentName} has been moved to re-registration applied list! (Semester: ${newSemester}, Year: ${newYear})`);
      setIsConfirmModalOpen(false);
      setSelectedStudent(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error processing re-registration";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    }
  };

  const handleRevert = (student: StudentData) => {
    setSelectedStudent(student);
    setIsRevertModalOpen(true);
  };

  const confirmRevert = async () => {
    if (!selectedStudent) return;

    const loadingToast = toast.loading('Reverting re-registration...');
    
    try {
      const newSemester = Math.max(1, (selectedStudent.semester || 1) - 1); // Decrement semester but not below 1
      const newYear = Math.ceil(newSemester / 2); // Calculate year based on semester
      
      const response = await fetch(`${API_URL}/api/students/${selectedStudent._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          "Authorization": `Bearer ${user?.token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          reRegistrationStatus: "Eligible",
          lastReRegistrationDate: null,
          semester: newSemester,
          year: newYear.toString(), // Update year based on semester
          nextReRegistrationEligible: null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to revert re-registration");
      }

      const updatedStudent = await response.json();
      
      // Update students array
      setStudents(students.map(student => 
        student._id === selectedStudent._id ? { ...student, ...updatedStudent } : student
      ));
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedStudent.studentName} has been reverted to eligible list! (Semester: ${newSemester}, Year: ${newYear})`);
      setIsRevertModalOpen(false);
      setSelectedStudent(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error reverting re-registration";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Loading Re-Registration</h1>
          <p className="text-gray-600">Please wait while we fetch the student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <ArrowPathIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Error Loading Re-Registration</h1>
            <div className="alert alert-error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ArrowPathIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Re-Registration Management</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage student re-registrations for next semester</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Session Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Admission Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="form-select w-full"
                >
                  {sessions.map(session => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>

              {/* University Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                  University
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="form-select w-full"
                >
                  {universities.map(university => (
                    <option key={university} value={university}>{university}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                  Search Students
                </label>
                <input
                  type="text"
                  placeholder="Search by student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-white">{eligibleStudents.length + appliedStudents.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Eligible for Re-Reg</p>
                <p className="text-3xl font-bold text-white">{eligibleStudents.length}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Applied for Re-Reg</p>
                <p className="text-3xl font-bold text-white">{appliedStudents.length}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Session</p>
                <p className="text-xl font-bold text-white">{selectedSession}</p>
              </div>
              <AcademicCapIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Re-Registration List (Left) */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
                Re-Registration List ({eligibleStudents.length})
              </h3>
              <p className="text-sm text-gray-500">Students eligible for re-registration</p>
            </div>
            <div className="card-body max-h-96 overflow-y-auto">
              {eligibleStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No eligible students</h3>
                  <p className="text-gray-500">No students are currently eligible for re-registration.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibleStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt="Student"
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">{student.studentName.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{student.studentName}</div>
                          <div className="text-sm text-gray-500">{student.course}</div>
                          <div className="text-xs text-blue-600">Semester: {student.semester || 1}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReRegistrationApply(student)}
                        className="btn btn-sm btn-primary"
                        title="Apply for re-registration"
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Re-Registration Applied (Right) */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                Re-Registration Applied ({appliedStudents.length})
              </h3>
              <p className="text-sm text-gray-500">Students who have applied for re-registration</p>
            </div>
            <div className="card-body max-h-96 overflow-y-auto">
              {appliedStudents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-500">No students have applied for re-registration yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appliedStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt="Student"
                            className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-medium">{student.studentName.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{student.studentName}</div>
                          <div className="text-sm text-gray-500">{student.course}</div>
                          <div className="text-xs text-green-600">Semester: {student.semester || 1}</div>
                          {student.lastReRegistrationDate && (
                            <div className="text-xs text-gray-400">
                              Applied: {new Date(student.lastReRegistrationDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-green-600">
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        {user?.role === "superadmin" && (
                          <button
                            onClick={() => handleRevert(student)}
                            className="btn btn-sm btn-warning"
                            title="Revert re-registration (Emergency)"
                          >
                            Revert
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-50">
            <div className="text-center">
              <ArrowPathIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Re-Registration</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to apply <strong>{selectedStudent.studentName}</strong> for re-registration?
              </p>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  This will move the student to semester <strong>{(selectedStudent.semester || 1) + 1}</strong> and 
                  transfer them to the "Re-Registration Applied" list.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReRegistration}
                  className="flex-1 btn btn-primary"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revert Modal */}
      {isRevertModalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsRevertModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-50">
            <div className="text-center">
              <ArrowPathIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Revert</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to revert <strong>{selectedStudent.studentName}</strong> to eligible list?
              </p>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  This will move the student to semester <strong>{(selectedStudent.semester || 1) - 1}</strong> and 
                  revert their re-registration status.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsRevertModalOpen(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevert}
                  className="flex-1 btn btn-primary"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReRegistration; 