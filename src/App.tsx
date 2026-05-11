/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TeacherDashboard from "./pages/TeacherDashboard";
import AuthUI from "./pages/AuthUI";

function ProtectedRoute({ children, role }: { children: React.ReactElement, role: 'teacher' }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  const Router = import.meta.env.VITE_GITHUB_PAGES === "true" ? HashRouter : BrowserRouter;

  return (
    <AuthProvider>
      <Router basename={import.meta.env.VITE_GITHUB_PAGES === "true" ? undefined : import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            <Route 
              path="teacher" 
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />

            <Route path="auth/:role/:action" element={<AuthUI />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
