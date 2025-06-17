// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./components/Alert"; // Import the AlertProvider
import NotificationSystem from "./components/NotificationSystem";
import ProtectedRoute from "./components/ProtectedRoute";
import Applyfresh from "./pages/students/applyfresh";
import HomePage from "./pages/homepage/homepage";
import Layout from "./components/Layout";
import Addcenter from "./pages/centers/addcenter";
import Allcenters from "./pages/centers/allcenters";
import Allstudents from "./pages/students/allstudents";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OfflinePayments from "./wallet/OfflinePayments";
import Passbook from "./wallet/Passbook";
import PendencyPage from "./pages/students/PendencyPage";
import ReRegistration from "./pages/students/ReRegistration";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider> 
          <NotificationSystem />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-application-foam"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <Applyfresh />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-center"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <Layout>
                    <Addcenter />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/centers"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <Allcenters />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <Allstudents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/re-registration"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <ReRegistration />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/offline-payments"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <OfflinePayments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/passbook"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <Layout>
                    <Passbook />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pendency/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Layout>
                    <PendencyPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;