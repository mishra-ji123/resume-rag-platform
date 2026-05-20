import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RestrictedPage } from "../pages/RestrictedPage";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { UploadPage } from "../pages/UploadPage";
import { SearchPage } from "../pages/SearchPage";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/restricted" element={<RestrictedPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Redirect index of dashboard to upload since Home tab is removed */}
          <Route index element={<Navigate to="/dashboard/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
