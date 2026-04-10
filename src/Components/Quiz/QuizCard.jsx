import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Shuffle,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Trophy,
  XCircle,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= MAIN COMPONENT ================= */

export default function QuizCard({ resource, subject }) {
  const resourceArray = resource;
  const [selectedId, setSelectedId] = useState(resourceArray[0]?._id);
  const [viewMode, setViewMode] = useState("question");
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  // Scoring States
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState({ score: 0, correct: 0, wrong: 0, total: 0 });

  const selectedResource = useMemo(() => {
    return resourceArray.find(r => r._id === selectedId);
  }, [selectedId, resourceArray]);

  const [pdfMode, setPdfMode] = useState(false);
  const [selectedForPDF, setSelectedForPDF] = useState([]);

  // --- Handlers ---

  const handleNext = () => {
    const currentIndex = resourceArray.findIndex(r => r._id === selectedId);
    if (currentIndex < resourceArray.length - 1) {
      setSelectedId(resourceArray[currentIndex + 1]._id);
    }
  };

  const handlePrev = () => {
    const currentIndex = resourceArray.findIndex(r => r._id === selectedId);
    if (currentIndex > 0) {
      setSelectedId(resourceArray[currentIndex - 1]._id);
    }
  };

  const handleOptionSelect = (resourceId, option) => {
    if (reviewMode) return;// Prevent clicking during review

    setSelectedOptions((prev) => {
      if (prev[resourceId] === option) {
        const updated = { ...prev };
        delete updated[resourceId];
        return updated;
      }
      return { ...prev, [resourceId]: option };
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    const total = resourceArray.length;

    resourceArray.forEach((q) => {
      const userAns = selectedOptions[q._id];
      // Compare user choice with correctAnswer from API
      if (userAns === q.correctAnswer) {
        correct++;
      } else if (userAns) {
        wrong++;
      }
    });

    const score = Math.round((correct / total) * 100);
    setResultsData({ score, correct, wrong, total });
    setShowResults(true);
setReviewMode(true); // ✅ ADD THIS LINE
  };

  const handleRestart = () => {
    setSelectedOptions({});
    setShowResults(false);
    setSelectedId(resourceArray[0]._id);
    setViewMode("question");
    setReviewMode(false); // ✅ ADD THIS
  };

  useEffect(() => {
    setShowAnswer(false);
  }, [selectedId]);

  const getPaperNumber = (name) => {
    const match = name?.match(/\d+/);
    return match ? match[0] : "";
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-lg tracking-tight text-indigo-600">Aurethia Quiz</h1>
            <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
              <Search size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <SidebarAction icon={<ArrowUpDown size={14} />} label="Asc" />
            <SidebarAction icon={<Filter size={14} />} label="Filter" active />
            <SidebarAction icon={<Eye size={14} />} label="View" />
            <SidebarAction icon={<Shuffle size={14} />} label="Random" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {resourceArray.map((res) => {
            // Logic for feedback icons
            const isCorrect = selectedOptions[res._id] === res.correctAnswer;
            const hasAnswered = !!selectedOptions[res._id];

            return (
              <button
                key={res._id}
                onClick={() => setSelectedId(res._id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 flex flex-col transition-all duration-200 ${selectedId === res._id ? "bg-indigo-50/50 border-l-4 border-l-indigo-500" : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedId === res._id ? "text-indigo-600" : "text-slate-400"}`}>
                    {subject} / {getPaperNumber(res.paperName?.name)}{res.variant} / Q{res.questionNumber}
                  </span>

                  {/* Render status icons only after submission */}
                  {reviewMode && (
                    hasAnswered ? (
                      isCorrect ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />
                    ) : <span className="text-[9px] text-slate-300 font-bold uppercase">Skipped</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {!showResults && hasAnswered && <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />}
                  <span className="text-xs text-slate-500 truncate font-medium">
                    {hasAnswered ? `Selected: ${selectedOptions[res._id]}` : "Not answered"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow flex flex-col bg-[#F1F5F9] relative overflow-hidden">

        {/* Toolbar */}
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-slate-200 grid grid-cols-3 items-center px-6 shadow-sm z-20">

          {/* Left Section: Add & Share */}
          <div className="flex items-center gap-6">
            <ToolbarButton icon={<Plus size={18} />} label="Add to" />
            <ToolbarButton icon={<Share2 size={18} />} label="Share" />
          </div>

          {/* Center Section: SUBMIT BUTTON */}
          {/* Center Section: SUBMIT BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={reviewMode} // Disable after submit
              className={`flex flex-col items-center group ${showResults ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm border border-emerald-100 group-hover:border-emerald-600">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase mt-1 text-emerald-600 tracking-wider">
                {showResults ? "Submitted" : "Submit"}
              </span>
            </button>
          </div>

          {/* Right Section: View Mode & Nav */}
          <div className="flex items-center justify-end gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
              <button
                onClick={() => setViewMode("question")}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "question" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Question
              </button>
              <button
                onClick={() => setViewMode("answer")}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "answer" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Answer
              </button>
            </div>
            <div className="flex items-center border-l border-slate-200 pl-4 gap-1">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ChevronLeft size={20} /></button>
              <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ChevronRight size={20} /></button>
            </div>
            {reviewMode && (
    <button
      onClick={handleRestart}
      className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
    >
      Restart
    </button>
  )}
          </div>
        </header>
        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedResource ? (
              <motion.div
                key={selectedResource._id + viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                  <div className="p-8 md:p-12 relative flex-grow">

                    {viewMode === "question" ? (
                      <div className="flex relative h-full">
                        {/* Question Side */}
                        <div className="flex-1 pr-24">
                          <div className="mb-6 flex items-center justify-between">
                            <span className="text-red-700 italic font-bold text-sm bg-red-50 px-3 py-1 rounded-full">

                            </span>
                          </div>

                          {selectedResource.questionPaper.map((file, idx) => (
                            <div key={idx} className="mb-8 flex flex-col items-center">
                              <img
                                src={file.cloudinaryUrl}
                                alt="Question"
                                className="max-w-full h-auto rounded-xl shadow-sm border border-slate-100"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Floating Options Bar */}
                        <div className="absolute right-0 top-0 h-full flex flex-col items-center justify-start gap-6 pt-10 border-l border-slate-50 pl-8">
                          {["A", "B", "C", "D"].map((option) => {
                            const isSelected = selectedOptions[selectedResource._id] === option;
                            const isCorrect = selectedResource.correctAnswer === option;

                            // Logic for dynamic coloring
                            let styleClass = "bg-white border-slate-200 text-slate-400 hover:border-indigo-300";

                            if (reviewMode) {
                              if (isCorrect) {
                                styleClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 scale-110";
                              } else if (isSelected) {
                                styleClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100";
                              } else {
                                styleClass = "bg-white border-slate-100 text-slate-200 opacity-60";
                              }
                            } else if (isSelected) {
                              styleClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110";
                            }

                            return (
                              <label key={option} className={`flex flex-col items-center gap-1 group ${showResults ? "cursor-default" : "cursor-pointer"}`}>
                                <input
                                  type="radio"
                                  className="hidden"
                                  disabled={reviewMode} // Lock input after submit
                                  checked={isSelected}
                                  onChange={() => handleOptionSelect(selectedResource._id, option)}
                                />
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all border-2 ${styleClass}`}>
                                  {option}
                                </div>
                              </label>
                            );
                          })}

                          <div className="mt-auto pb-10 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-300 mb-1 tracking-widest uppercase">
                              {reviewMode ? "Status" : "Result"}
                            </span>
                            <div className={`w-12 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${reviewMode
                              ? (selectedOptions[selectedResource._id] === selectedResource.correctAnswer ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")
                              : "bg-slate-100 text-slate-400"
                              }`}>
                              {reviewMode ? (selectedOptions[selectedResource._id] === selectedResource.correctAnswer ? "✓" : "✕") : "?"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Marking Scheme</h3>
                        {selectedResource.markScheme.map((file, idx) => (
                          <img key={idx} src={file.cloudinaryUrl} className="w-full rounded-xl border shadow-sm" alt="Answer" />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Bottom Info Bar */}
                  <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex justify-between text-[11px] font-mono text-slate-400">
                    <span className="uppercase tracking-widest">{selectedResource.year} | {selectedResource.season} | P{selectedResource.variant}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-40">
                <FileText size={64} strokeWidth={1} />
                <p className="mt-4 font-medium">Select a challenge to begin</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* RESULTS MODAL */}
      <AnimatePresence>
        {showResults && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-indigo-600 p-10 text-center text-white relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-black">Nice Work!</h2>
                <p className="text-indigo-100 mt-2 font-medium">Practice makes perfect.</p>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-3 gap-4 mb-10 text-center">
                  <div className="p-4 bg-indigo-50 rounded-3xl">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Score</p>
                    <p className="text-3xl font-black text-indigo-600">{resultsData.score}%</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-3xl">
                    <p className="text-[10px] uppercase font-bold text-emerald-500/70 mb-1">Correct</p>
                    <p className="text-3xl font-black text-emerald-600">{resultsData.correct}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-3xl">
                    <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Wrong</p>
                    <p className="text-3xl font-black text-red-500">{resultsData.wrong}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRestart}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} /> Restart Session
                  </button>
                  <button
                    onClick={() => setShowResults(false)} // This "closes" the popup to reveal the UI below
                    className="w-full py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> Review Answers
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function SidebarAction({ icon, label, active = false }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all ${active ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "hover:bg-slate-50 text-slate-400"}`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}

function ToolbarButton({ icon, label }) {
  return (
    <button className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
      <div className="p-2 bg-slate-50 rounded-lg mb-1">{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}