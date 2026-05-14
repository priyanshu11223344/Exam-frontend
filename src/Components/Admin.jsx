import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Box, Book, Layers, FileSpreadsheet, LayoutList } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchBoards, createBoard } from "../features/board/boardSlice";
import { fetchSubjects, clearSubjects,createSubject } from "../features/subject/subjectSlice";
import { fetchTopics, clearTopics ,createTopic} from "../features/topic/topicSlice";
const UploadExcel = () => {
  const [activeTab, setActiveTab] = useState("manual"); // "manual" or "excel"

  // --- EXCEL UPLOAD STATE (Original) ---
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- MANUAL FORM STATE ---
  const [rows, setRows] = useState([
    { id: Date.now(), board: '', subject: '', topic: '', year: '', season: '', paperName: '', variant: '1', questionNumber: '', questionPaper: '', markScheme: '', correctAnswer: '', explanation: '', specialComment: '' }
  ]);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);
  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);
  const { topics = [] } = useSelector((state) => state.topics);
  const [activeModal, setActiveModal] = useState(null);
  const [tempData, setTempData] = useState({ name: '', link: '' });

  // --- EXCEL LOGIC (Copied Exactly From Your Code) ---
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

  const handleUploadExcel = async () => {
    if (!file) return alert("Select a file");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/upload-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(`${data.inserted} inserted, ${data.skipped} skipped ${data.updated} updated`);
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

  // --- MANUAL LOGIC (Row Handlers) ---
  const addRow = () => {
    setRows([...rows, { ...rows[0], id: Date.now(), questionNumber: '', questionPaper: '', markScheme: '', correctAnswer: '', explanation: '', specialComment: '' }]);
  };
  const deleteRow = (id) => rows.length > 1 && setRows(rows.filter(r => r.id !== id));
  const updateRow = async (id, field, value) => {

    // ✅ update current field
    setRows((prevRows) =>
      prevRows.map((row) => {

        if (row.id !== id) return row;

        // ✅ BOARD CHANGED
        if (field === "board") {
          dispatch(clearSubjects());
          dispatch(clearTopics());

          dispatch(fetchSubjects(value));

          return {
            ...row,
            board: value,
            subject: "",
            topic: "",
          };
        }

        // ✅ SUBJECT CHANGED
        if (field === "subject") {
          dispatch(clearTopics());

          dispatch(fetchTopics(value));

          return {
            ...row,
            subject: value,
            topic: "",
          };
        }

        // ✅ NORMAL FIELD
        return {
          ...row,
          [field]: value,
        };
      })
    );
  };
  const handleManualUpload = () => {
    console.log("Manual Data Payload:", rows);
    alert("Manual data payload logged to console!");
  };

  const handleAddData = async () => {

    try {

      // ✅ CREATE BOARD
      if (activeModal === "board") {

        await dispatch(
          createBoard({
            name: tempData.name,
          })
        ).unwrap();
      }
       // ✅ CREATE SUBJECT
    if (activeModal === "subject") {

      await dispatch(
        createSubject({
          name: tempData.name,
          boardId: tempData.link,
        })
      ).unwrap();

      dispatch(fetchSubjects(tempData.link));
    }

    if(activeModal==="topic"){
      await dispatch(
        createTopic({
          name:tempData.name,
          subjectId:tempData.link
        })
      ).unwrap();
      dispatch(fetchTopics(tempData.link));
    }
      // ✅ CLOSE MODAL
      setActiveModal(null);

      // ✅ RESET INPUT
      setTempData({
        name: "",
        link: "",
      });

    } catch (error) {
      console.log(error);
      alert(error?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Tab Selection Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutList size={18} /> Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("excel")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'excel' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileSpreadsheet size={18} /> Excel Upload
            </button>
          </div>
        </div>

        {/* --- TAB 1: MANUAL ENTRY --- */}
        {activeTab === "manual" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Manual Bulk Entry</h2>
                <p className="text-sm text-slate-500">Fill in the question details row by row</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveModal('board')} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-600 transition text-sm font-bold"><Box size={16} /> + Board</button>
                <button onClick={() => setActiveModal('subject')} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-600 transition text-sm font-bold"><Book size={16} /> + Subject</button>
                <button onClick={() => setActiveModal('topic')} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-purple-600 transition text-sm font-bold"><Layers size={16} /> + Topic</button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4 border-b">Category</th>
                      <th className="p-4 border-b">Paper Details</th>
                      <th className="p-4 border-b">Question & Scheme</th>
                      <th className="p-4 border-b">Analysis</th>
                      <th className="p-4 border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-indigo-50/30 transition">
                        <td className="p-3 space-y-2 align-top min-w-[180px]">
                          <select value={row.board} onChange={(e) => updateRow(row.id, 'board', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs">
                            <option value="">Select Board</option>
                            {boards.map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                          <select value={row.subject} onChange={(e) => updateRow(row.id, 'subject', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs">
                            <option value="">Select Subject</option>
                            {subjects.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <select value={row.topic} onChange={(e) => updateRow(row.id, 'topic', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs">
                            <option value="">Select Topic</option>
                            {topics.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 space-y-2 align-top min-w-[150px]">
                          <input type="number" placeholder="Year" value={row.year} onChange={(e) => updateRow(row.id, 'year', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs" />
                          <select value={row.season} onChange={(e) => updateRow(row.id, 'season', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs">
                            <option value="">Season</option>
                            <option value="Summer">Summer</option><option value="Winter">Winter</option>
                            <option value="Spring">Spring</option>
                          </select>
                          <div className="flex gap-1">
                            <input type="text" placeholder="Paper" value={row.paperName} onChange={(e) => updateRow(row.id, 'paperName', e.target.value)} className="flex-1 border border-slate-200 rounded-lg p-1.5 text-xs" />
                            <select value={row.variant} onChange={(e) => updateRow(row.id, 'variant', e.target.value)} className="w-12 border border-slate-200 rounded-lg p-1 text-xs">
                              <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-3 space-y-2 align-top min-w-[280px]">
                          <input type="number" placeholder="Q#" value={row.questionNumber} onChange={(e) => updateRow(row.id, 'questionNumber', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs font-bold" />
                          <textarea placeholder="Question Text" value={row.questionPaper} onChange={(e) => updateRow(row.id, 'questionPaper', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs h-14 resize-none" />
                          <textarea placeholder="Mark Scheme" value={row.markScheme} onChange={(e) => updateRow(row.id, 'markScheme', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs h-14 resize-none" />
                        </td>
                        <td className="p-3 space-y-2 align-top min-w-[220px]">
                          <input type="text" placeholder="Correct Ans" value={row.correctAnswer} onChange={(e) => updateRow(row.id, 'correctAnswer', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-emerald-50" />
                          <textarea placeholder="Explanation" value={row.explanation} onChange={(e) => updateRow(row.id, 'explanation', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs h-12 resize-none" />
                          <textarea placeholder="Comment" value={row.specialComment} onChange={(e) => updateRow(row.id, 'specialComment', e.target.value)} className="w-full border border-slate-200 rounded-lg p-1.5 text-xs h-12 resize-none" />
                        </td>
                        <td className="p-3 text-center align-middle">
                          <button onClick={() => deleteRow(row.id)} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                <button onClick={addRow} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm">
                  <Plus size={18} /> Add New Row
                </button>
                <button onClick={handleManualUpload} className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-10 py-3 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                  <Upload size={18} /> UPLOAD ALL DATA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: EXCEL UPLOAD (Your Original UI) --- */}
        {activeTab === "excel" && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden mt-10">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <i className="fas fa-file-excel text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Import Resources</h2>
                  <p className="text-sm text-slate-500">Upload your Excel spreadsheet (.xlsx)</p>
                </div>
              </div>

              {!file ? (
                <div
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"}`}
                >
                  <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-indigo-500 text-white scale-110" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"}`}>
                    <i className="fas fa-cloud-upload-alt text-2xl"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">Excel files up to 10MB supported</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                      <i className="fas fa-file-spreadsheet"></i>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={removeFile} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt text-sm"></i></button>
                </div>
              )}

              <button
                onClick={handleUploadExcel}
                disabled={!file || loading}
                className={`w-full mt-8 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${!file || loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]"}`}
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
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2"><i className="fas fa-shield-alt"></i> Secure Data Import</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 2.0</span>
            </div>
          </div>
        )}

        {/* MODALS FOR MANUAL ENTRY */}
        {activeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100">
              <h3 className="text-xl font-bold mb-4 capitalize text-slate-900">Add New {activeModal}</h3>
              <input type="text" placeholder={`${activeModal} Name`} className="w-full border border-slate-200 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none" value={tempData.name} onChange={(e) => setTempData({ ...tempData, name: e.target.value })} />
              {activeModal === 'subject' && (
                <select className="w-full border border-slate-200 p-3 rounded-xl mb-4 text-sm" onChange={(e) => setTempData({ ...tempData, link: e.target.value })}>
                  <option value="">Select Board</option>
                  {boards.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              {activeModal === "topic" && (
  <>

    {/* SELECT BOARD */}
    <select
      className="w-full border border-slate-200 p-3 rounded-xl mb-4 text-sm"
      value={tempData.boardId || ""}
      onChange={(e) => {

        const boardId = e.target.value;

        setTempData({
          ...tempData,
          boardId,
          link: "",
        });

        dispatch(clearSubjects());

        dispatch(fetchSubjects(boardId));
      }}
    >
      <option value="">Select Board</option>

      {boards.map((b) => (
        <option key={b._id} value={b._id}>
          {b.name}
        </option>
      ))}
    </select>

    {/* SELECT SUBJECT */}
    <select
      className="w-full border border-slate-200 p-3 rounded-xl mb-4 text-sm"
      value={tempData.link}
      onChange={(e) =>
        setTempData({
          ...tempData,
          link: e.target.value,
        })
      }
    >
      <option value="">Select Subject</option>

      {subjects.map((s) => (
        <option key={s._id} value={s._id}>
          {s.name}
        </option>
      ))}
    </select>

  </>
)}
              <div className="flex gap-2">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                <button onClick={handleAddData} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExcel;