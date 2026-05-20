import React from "react";
import { DocumentItem } from "../api/client";

interface ResumeDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const ResumeDetailModal: React.FC<ResumeDetailModalProps> = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 transform transition-all z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Resume Profile Details</h3>
            <p className="text-xs text-blue-100 font-mono">System Document ID: #{document.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all font-bold text-lg focus:outline-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Col */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File name</label>
              <div className="text-sm font-semibold text-slate-800 break-all">{document.file_name}</div>
            </div>

            {/* Right Col */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Processing Status</label>
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                  document.processing_status === "SUCCESS" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : document.processing_status === "PROCESSING"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {document.processing_status}
                </span>
              </div>
            </div>

            {/* Chunks */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Chunks Stored</label>
              <div className="text-sm font-bold text-indigo-600 font-mono">
                {document.total_chunks || 0} chunks
              </div>
            </div>

            {/* Upload status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Upload Status</label>
              <div className="text-sm font-semibold text-slate-700">{document.upload_status}</div>
            </div>

            {/* Uploaded At */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Uploaded At</label>
              <div className="text-xs text-slate-600 font-mono">
                {new Date(document.uploaded_at).toLocaleString()}
              </div>
            </div>

            {/* Processed At */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Processed At</label>
              <div className="text-xs text-slate-600 font-mono">
                {document.processed_at ? new Date(document.processed_at).toLocaleString() : "Pending/Failed"}
              </div>
            </div>

          </div>

          {/* Error Message if Failed */}
          {document.processing_status === "FAILED" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 space-y-1.5">
              <div className="flex items-center text-xs font-bold uppercase tracking-wider">
                <span className="mr-1.5 text-sm">⚠️</span> Error Message Log
              </div>
              <p className="text-xs font-mono leading-relaxed bg-white border border-red-100 rounded-lg p-3 text-red-900 overflow-x-auto whitespace-pre-wrap">
                {document.error_message || "Unknown error occurred during extraction."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
