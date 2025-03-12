import React, { createContext, useState, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: { role: string; token: string; centerId?: string; university?: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ role: string; token: string; centerId?: string; university?: string } | null>(() => {
    const token = localStorage.getItem("token");
    // Optionally restore user from localStorage if token exists (requires backend validation)
    return token ? { role: "", token, centerId: "", university: "" } : null;
  });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const { token, role, centerId, university } = await response.json();
      const newUser = { role, token, centerId, university };
      setUser(newUser);
      localStorage.setItem("token", token);
      navigate(role === "superadmin" ? "/centers" : "/students");
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error; // Let the caller handle the error (e.g., show a message)
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};