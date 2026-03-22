import React, { useState, useRef } from "react";

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      if (droppedFile.name.endsWith(".xlsx")) {
        setFile(droppedFile);
      } else {
        alert("Please upload an .xlsx file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch(
        "https://exam-backend-render.onrender.com/api/admin/upload-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      alert(`${data.inserted} inserted, ${data.skipped} skipped`);
      setFile(null);
    } catch (error) {
      alert("Upload failed. Please ensure the server is running.");
    }

    setLoading(false);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <i className="fas fa-file-excel text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Import Resources
            </h2>
            <p className="text-sm text-slate-500">
              Upload your Excel spreadsheet (.xlsx)
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        {!file ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              isDragging
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDragging
                  ? "bg-indigo-500 text-white scale-110"
                  : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
              }`}
            >
              <i className="fas fa-cloud-upload-alt text-2xl"></i>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Excel files up to 10MB supported
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                <i className="fas fa-file-spreadsheet"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-xs">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              onClick={removeFile}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full mt-8 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
            !file || loading
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-check"></i>
              <span>{file ? "Confirm Upload" : "Upload Spreadsheet"}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-shield-alt"></i>
          Secure Data Import
        </span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Version 2.0
        </span>
      </div>
    </div>
  );
};

export default UploadExcel;
