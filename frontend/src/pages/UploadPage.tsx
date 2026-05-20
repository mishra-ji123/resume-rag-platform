import React, { useState, useEffect, useRef } from "react";
import { api, DocumentItem } from "../api/client";
import { ResumeDetailModal } from "../components/ResumeDetailModal";

interface UploadResponse {
  message: string;
  document_id: number;
  filename: string;
  extracted_chars: number;
  chunk_count: number;
  embedding_dimension: number;
  status: string;
  sample_chunks: string[];
}

export const UploadPage: React.FC = () => {
  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadAlert, setUploadAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Documents List States
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [resyncingId, setResyncingId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Fetch documents for the list
  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Poll for document updates
  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setUploadAlert({ message: "Only PDF files are supported.", type: "error" });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadAlert(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        setUploadAlert({ message: "Only PDF files are supported.", type: "error" });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadAlert(null);
      setUploadResult(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadAlert(null);
    setUploadResult(null);

    try {
      setUploadProgress(50);
      const data = await api.uploadDocument(selectedFile);
      setUploadProgress(80);
      setUploadResult(data);
      setUploadProgress(100);
      setUploadAlert({ message: `Successfully uploaded and indexed "${selectedFile.name}".`, type: "success" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Refresh the database table
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to process PDF.";
      setUploadAlert({ message: `Index Error: ${errMsg}`, type: "error" });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleResync = async (docId: number) => {
    setResyncingId(docId);
    try {
      await api.resyncDocument(docId);
      window.alert("Document re-sync has been triggered successfully!");
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to trigger re-sync.";
      window.alert(`Re-sync Failed: ${errMsg}`);
    } finally {
      setResyncingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Upload Documents</h2>
        <p className="text-sm text-slate-500 font-medium">Index candidate PDF files and monitor parsing processes across the database.</p>
      </div>

      {/* Upload and Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Upload Box Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate PDF Indexer</h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500/70 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/40 relative group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="space-y-2 group-hover:scale-[1.01] transition-transform">
                <div className="text-3xl">📤</div>
                <div className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : "Select Candidate PDF File"}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Drag PDF here or click to browse files"}
                </div>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>Uploading to Pipeline...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Alerts Log */}
            {uploadAlert && (
              <div
                className={`text-xs px-4 py-3 rounded-xl border leading-relaxed font-semibold flex items-center space-x-2 ${
                  uploadAlert.type === "success"
                    ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                    : "bg-red-50 border-red-250 text-red-700"
                }`}
              >
                <span>{uploadAlert.type === "success" ? "✅" : "⚠️"}</span>
                <span>{uploadAlert.message}</span>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-white">⚙️</span>
                    <span>Extracting PDF Data...</span>
                  </>
                ) : (
                  <span>Index Candidate Resume</span>
                )}
              </button>
            )}

          </form>
        </div>

        {/* Upload Result Metadata (Visible on successful upload) */}
        {uploadResult && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Extraction Metrics</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Parsed text vector metadata</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Filename</span>
                <span className="text-xs font-bold text-slate-800 truncate block mt-0.5" title={uploadResult.filename}>
                  {uploadResult.filename}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                  SUCCESS
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Extracted Chars</span>
                <span className="text-xs font-bold text-slate-800 font-mono block mt-0.5">
                  {uploadResult.extracted_chars} characters
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Chunk Count</span>
                <span className="text-xs font-bold text-indigo-600 font-mono block mt-0.5">
                  {uploadResult.chunk_count} chunks
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 col-span-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Embedding Dimension</span>
                <span className="text-xs font-bold text-slate-800 font-mono block mt-0.5">
                  {uploadResult.embedding_dimension}-dimensional dense vector arrays
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Documents List Section (Below Upload Box) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-bold text-slate-800">Candidates Database</h3>
            <p className="text-xs text-slate-500 font-medium">Monitoring log rows of all candidate resume indexes</p>
          </div>
          <button
            onClick={fetchDocuments}
            className="flex items-center space-x-1.5 py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-850 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>🔄</span>
            <span>Refresh Table</span>
          </button>
        </div>

        {/* Database Table Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider select-none">
                  <th className="py-4 px-6 text-center w-20">ID</th>
                  <th className="py-4 px-6">File Name</th>
                  <th className="py-4 px-6 text-center w-24">Chunks</th>
                  <th className="py-4 px-6 w-32">Status</th>
                  <th className="py-4 px-6">Uploaded At</th>
                  <th className="py-4 px-6 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoadingList && documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold select-none">
                      Connecting to candidate database...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold select-none">
                      No documents found in database. Please upload a PDF resume.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/40 transition-all">
                      {/* ID */}
                      <td className="py-4 px-6 text-center font-mono font-semibold text-slate-400">
                        #{doc.id}
                      </td>

                      {/* File Name */}
                      <td className="py-4 px-6 font-bold text-slate-800 break-all" title={doc.file_name}>
                        {doc.file_name}
                      </td>

                      {/* Total Chunks */}
                      <td className="py-4 px-6 text-center font-mono font-bold text-indigo-650">
                        {doc.processing_status === "SUCCESS" ? doc.total_chunks : "-"}
                      </td>

                      {/* Processing Status badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.processing_status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                            : doc.processing_status === "PROCESSING"
                            ? "bg-blue-50 text-blue-700 border border-blue-250 animate-pulse"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {doc.processing_status}
                        </span>
                        {doc.processing_status === "FAILED" && doc.error_message && (
                          <div className="text-[10px] text-red-500 font-medium truncate max-w-[150px] mt-1" title={doc.error_message}>
                            ⚠️ {doc.error_message}
                          </div>
                        )}
                      </td>

                      {/* Uploaded At */}
                      <td className="py-4 px-6 text-slate-500 font-mono">
                        {new Date(doc.uploaded_at).toLocaleString()}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                        
                        {doc.processing_status === "FAILED" && (
                          <button
                            onClick={() => handleResync(doc.id)}
                            disabled={resyncingId === doc.id}
                            className="py-1 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold transition-all disabled:opacity-55 cursor-pointer flex items-center space-x-1"
                          >
                            {resyncingId === doc.id ? (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full border border-red-700 border-t-transparent animate-spin inline-block"></span>
                                <span>Syncing...</span>
                              </>
                            ) : (
                              <span>Re-sync</span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details modal popup */}
      <ResumeDetailModal 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
      />

    </div>
  );
};
