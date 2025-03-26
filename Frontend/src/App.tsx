import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Applyfresh from "./pages/students/applyfresh";
import HomePage from "./pages/homepage/homepage";
import Layout from "./components/Layout";
import Addcenter from "./pages/centers/addcenter";
import Allcenters from "./pages/centers/allcenters";
import Allstudents from "./pages/students/allstudents";
import Login from "./pages/auth/Login";
import OfflinePayments from "./wallet/OfflinePayments";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
              <ProtectedRoute allowedRoles={["superadmin"]}>
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
            path="/offline-payments"
            element={
              <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                <Layout>
                  <OfflinePayments />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;