import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Step tracker: 'input' | 'role_select'
  const [loginStep, setLoginStep] = useState<"input" | "role_select">("input");

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") === "true") {
      const role = localStorage.getItem("user_role");
      if (role === "admin") {
        navigate("/dashboard/upload");
      } else {
        navigate("/restricted");
      }
    }
  }, [navigate]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    // Go to next step for role selection
    setLoginStep("role_select");
    setError("");
  };

  const handleRoleSelection = (selectedRole: "admin" | "user") => {
    localStorage.setItem("admin_logged_in", "true");
    localStorage.setItem("user_role", selectedRole);
    
    if (selectedRole === "admin") {
      navigate("/dashboard/upload");
    } else {
      navigate("/restricted");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 font-sans relative overflow-hidden text-slate-800">
      
      {/* Background soft glowing blur effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 transform transition-all duration-350 hover:scale-[1.005]">
        
        {/* Title Brand */}
        <div className="text-center mb-8 select-none">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg mx-auto shadow-lg shadow-blue-500/25 mb-4">
            R
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Resume RAG Engine</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Candidate Retrieval Platform</p>
        </div>

        {/* STEP 1: LOGIN CREDENTIALS */}
        {loginStep === "input" && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-855 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>

            {/* Warning Alert */}
            {error && (
              <div className="text-red-650 bg-red-50 border border-red-200 rounded-xl p-3 text-xs leading-normal font-medium">
                ⚠️ {error}
              </div>
            )}

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              💡 <strong>Demo Helper:</strong> Any email and password combination is accepted.
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all active:scale-95 hover:brightness-105 cursor-pointer"
            >
              Sign In to Platform
            </button>
          </form>
        )}

        {/* STEP 2: CHOOSE ACCESS ROLE */}
        {loginStep === "role_select" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-700">Choose Your Access Role</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Determine the dashboard navigation profile access level.
              </p>
            </div>

            {/* Role Select Options */}
            <div className="space-y-3">
              {/* Admin Button */}
              <button
                onClick={() => handleRoleSelection("admin")}
                className="w-full py-4 px-6 border-2 border-blue-50 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/70 text-blue-700 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <div className="text-left">
                  <span className="text-xs block font-extrabold text-blue-800">Login as Admin</span>
                  <span className="text-[10px] text-blue-500 font-normal mt-0.5 block">Access Document Uploads & Search</span>
                </div>
                <span className="text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              {/* Normal User Button */}
              <button
                onClick={() => handleRoleSelection("user")}
                className="w-full py-4 px-6 border-2 border-slate-100 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-100/50 text-slate-700 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <div className="text-left">
                  <span className="text-xs block font-extrabold text-slate-800">Login as Normal User</span>
                  <span className="text-[10px] text-slate-450 font-normal mt-0.5 block">Access Denied (Restricted screen)</span>
                </div>
                <span className="text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>

            {/* Back to inputs link */}
            <div className="text-center pt-2">
              <button
                onClick={() => setLoginStep("input")}
                className="text-[11px] text-slate-450 hover:text-slate-600 font-bold transition-all hover:underline cursor-pointer"
              >
                &larr; Back to Credentials Form
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
