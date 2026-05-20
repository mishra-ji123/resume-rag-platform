import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RestrictedPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    const userRole = localStorage.getItem("user_role");
    if (!isLoggedIn) {
      navigate("/login");
    } else if (userRole === "admin") {
      navigate("/dashboard/upload");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 font-sans relative overflow-hidden text-white">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Access Denied Card */}
      <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-xl">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-500 animate-pulse">
          ⚠️
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Access Restricted</h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Unauthorized Role Privilege</p>
        </div>

        {/* Explanation info */}
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          You are logged in as <strong className="text-red-400">Normal User</strong>. Admin dashboard privileges are required to:
        </p>

        {/* Scope list */}
        <ul className="text-left bg-black/30 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs text-slate-355 leading-normal">
          <li className="flex items-center space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Upload resumes</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>View documents</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Re-sync failed docs</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Perform semantic candidate search</span>
          </li>
        </ul>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-slate-750"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};
