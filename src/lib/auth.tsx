import React, { createContext, useContext, useState, useEffect } from "react";
import { User, db, Role } from "./db";

interface AuthContextType {
  user: User | null;
  login: (emailOrRoll: string, password: string, role: Role) => Promise<User | null>;
  logout: () => void;
  register: (userData: Omit<User, "id">) => Promise<User>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stickyUser = localStorage.getItem("cdlu_auth_user");
    return stickyUser ? JSON.parse(stickyUser) : null;
  });

  const login = async (emailOrRoll: string, password: string, role: Role) => {
    const loggedInUser = await db.login(emailOrRoll, password, role);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem("cdlu_auth_user", JSON.stringify(loggedInUser));
    }
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cdlu_auth_user");
  };

  const register = async (userData: Omit<User, "id">) => {
    const newUser = await db.createUser(userData);
    setUser(newUser);
    localStorage.setItem("cdlu_auth_user", JSON.stringify(newUser));
    return newUser;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await db.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      localStorage.setItem("cdlu_auth_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
