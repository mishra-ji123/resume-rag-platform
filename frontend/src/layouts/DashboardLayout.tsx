import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(true);

  // Check auth and role on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    const userRole = localStorage.getItem("user_role");
    
    if (!isLoggedIn) {
      navigate("/login");
    } else if (userRole !== "admin") {
      navigate("/restricted");
    }
  }, [navigate]);

  // Check system status (backend connection check)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await axios.get("http://127.0.0.1:8000/api/v1/resume/");
        setIsSystemOnline(true);
      } catch (err) {
        setIsSystemOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  // Only exactly these two navigation links for Admin
  const navLinks = [
    { path: "/dashboard/upload", label: "Upload Documents", icon: "📤" },
    { path: "/dashboard/search", label: "Semantic Search", icon: "🔍" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-64 bg-slate-900 text-slate-350 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
        
        {/* Sidebar Header Brand */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/25">
            R
          </div>
          <div>
            <h1 className="text-md font-bold text-slate-100 leading-tight">RAG Platform</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-red-950/30 hover:text-red-400 text-slate-400 border border-slate-700/50 hover:border-red-900/35 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Console Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar Panel */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
          {/* Path Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span className="text-slate-400">Dashboard</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold uppercase tracking-wider">
              {location.pathname.split("/").pop()?.replace("-", " ")}
            </span>
          </div>

          {/* User details and system status */}
          <div className="flex items-center space-x-6">
            
            {/* System Connection Badge */}
            <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-1 select-none">
              <span className={`w-2 h-2 rounded-full inline-block ${isSystemOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="font-semibold text-slate-600">
                System: {isSystemOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs text-center shadow-inner">
                AD
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">Admin Recruiter</span>
                <span className="text-[10px] text-slate-400 font-medium">Platform Manager</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dashboard Main Content Container */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
