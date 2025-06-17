import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: { role: string; centerId?: string; university?: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/check-auth`, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = { role: data.role, centerId: data.centerId, university: data.university };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        console.log("Auth check successful, user:", newUser);
      } else {
        console.log("Auth check failed, status:", response.status);
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      const newUser = { role: data.role, centerId: data.centerId, university: data.university };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      console.log("Login successful, user:", newUser);
      navigate(data.role === "superadmin" ? "/" : "/");
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show a loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};