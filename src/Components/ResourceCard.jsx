import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Shuffle,
  Heart,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  MessageSquare,
  Printer,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
/* ================= MOCK DATA ================= */

// const resourceArray = Array.from({ length: 20 }).map((_, i) => ({
//   id: `res-${i}`,
//   year: "2017",
//   season: "Winter",
//   paperNumber: "23",
//   variant: "1",
//   topic: { name: "Surds, indices, log" },
//   questionPaper: [
//     {
//       url: `https://picsum.photos/seed/${i + 100}/800/1000`,
//       fileType: "image"
//     }
//   ],
//   markScheme: { url: "#" },
//   explanation: { url: "#" },
//   specialComment: { url: "#" }
// }));

/* ================= MAIN COMPONENT ================= */

export default function QuestionExplorer({ resource, board, subject, topic }) {
  const resourceArray = resource
  console.log(resourceArray)
  const [selectedId, setSelectedId] = useState(resourceArray[0]._id);
  // console.log("id is",resourceArray[0]._id)
  const [viewMode, setViewMode] = useState("question");
  const [showAnswer, setShowAnswer] = useState(false);
  const selectedResource = useMemo(() => {
    return resourceArray.find(r => r._id === selectedId);
  }, [selectedId]);
  // ✅ PDF STATES
  const [pdfMode, setPdfMode] = useState(false);
  const [selectedForPDF, setSelectedForPDF] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  // const convertDriveUrl = (url) => {
  //   const id = url.split("/d/")[1];
  //   return `https://drive.google.com/uc?export=view&id=${id}`;
  // };
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoRef = useRef(null);

  // Close popup when clicking anywhere else
  useEffect(() => {
    function handleClickOutside(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfoPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const getBase64FromUrl = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handlePDFSelect = (resource) => {
    if (selectedForPDF.includes(resource)) {
      setSelectedForPDF(selectedForPDF.filter(r => r !== resource));
    } else {
      setSelectedForPDF([...selectedForPDF, resource]);
    }
  };

  const downloadPDF = async () => {
    if (selectedForPDF.length === 0) {
      alert("Select at least one question");
      return;
    }

    setPdfLoading(true);
    // Initialize PDF (Standard A4: 210mm x 297mm)
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 4; // Space for header and padding

    try {
      let isFirstImageOverall = true;

      for (let i = 0; i < selectedForPDF.length; i++) {
        const q = selectedForPDF[i];
        const metaText = `Q${i + 1} (${q.year} ${q.season} P${q.paperNumber} V${q.variant})`;

        // --- 1. PROCESS QUESTION IMAGES ---
        for (let imgObj of q.questionPaper) {
          // If it's NOT the first image of the entire PDF, we must add a new page.
          // This prevents the "First Page Blank" issue.
          if (!isFirstImageOverall) {
            doc.addPage();
          }
          isFirstImageOverall = false;

          // Draw Header for Question
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(metaText, margin, margin);
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, margin + 2, pageWidth - margin, margin + 2);

          const imgData = await getBase64FromUrl(imgObj.cloudinaryUrl);
          if (imgData) {
            const props = doc.getImageProperties(imgData);
            const ratio = props.width / props.height;
            let width = maxW;
            let height = maxW / ratio;

            if (height > maxH) {
              height = maxH;
              width = height * ratio;
            }

            const xOffset = (pageWidth - width) / 2;
            // Position image below the header (margin + 10)
            doc.addImage(imgData, "JPEG", xOffset, margin + 10, width, height);
          }
        }

        // --- 2. PROCESS ANSWER IMAGES ---
        // Ensure markScheme exists and is an array
        const markSchemeArr = Array.isArray(q.markScheme) ? q.markScheme : [];

        for (let imgObj of markSchemeArr) {
          // Always add a new page for an answer image
          doc.addPage();

          // Draw Header for Answer
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(16, 185, 129); // Emerald Green for answers
          doc.text(`ANSWER: ${metaText}`, margin, margin);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, margin + 2, pageWidth - margin, margin + 2);

          const imgData = await getBase64FromUrl(imgObj.cloudinaryUrl);
          if (imgData) {
            const props = doc.getImageProperties(imgData);
            const ratio = props.width / props.height;
            let width = maxW;
            let height = maxW / ratio;

            if (height > maxH) {
              height = maxH;
              width = height * ratio;
            }

            const xOffset = (pageWidth - width) / 2;
            doc.addImage(imgData, "JPEG", xOffset, margin + 10, width, height);
          }
        }
      }

      doc.save(`Exam_Export_${Date.now()}.pdf`);
      setPdfMode(false);
      setSelectedForPDF([]);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Error generating PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

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
  useEffect(() => {
    setShowAnswer(false);
  }, [selectedId]);
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">

      {/* ================= LEFT SIDEBAR ================= */}

      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">

        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-lg tracking-tight text-indigo-600">
              ExamMaster
            </h1>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <SidebarAction icon={<ArrowUpDown size={14} />} label="Asc" />
            <SidebarAction icon={<Filter size={14} />} label="1060" active />
            <SidebarAction icon={<Eye size={14} />} label="1-25" />
            <SidebarAction icon={<Shuffle size={14} />} label="Random" />
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {resourceArray.map((resource) => (
            <div key={resource._id} className="flex items-center">

              {/* ✅ SHOW CHECKBOX ONLY IN PDF MODE */}
              {pdfMode && (
                <input
                  type="checkbox"
                  checked={selectedForPDF.includes(resource)}
                  onChange={() => handlePDFSelect(resource)}
                  className="ml-2"
                />
              )}

              <button
                onClick={() => setSelectedId(resource._id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-center justify-between group transition-all duration-200 ${selectedId === resource._id
                  ? "bg-indigo-50/50 border-l-4 border-l-indigo-500"
                  : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${selectedId === resource._id
                      ? "text-indigo-600"
                      : "text-slate-400"
                      }`}
                  >
                    {subject}/{resource.paperNumber}{resource.variant}_{resource.season}_{resource.year}_Q{resource.questionNumber}
                  </span>
                </div>
              </button>

            </div>
          ))}
        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-grow flex flex-col bg-[#F1F5F9] relative overflow-hidden">

        {/* Toolbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">

          {/* Left side: Add to / Share */}
          <div className="flex items-center gap-4">
            <ToolbarButton icon={<Plus size={18} />} label="Add to" />
            <ToolbarButton icon={<Share2 size={18} />} label="Share" />
          </div>

          {/* CENTER/RIGHT: PDF Controls Grouped Closely */}
          <div className="flex items-center gap-2">

            {/* --- PDF BUTTON & INFO ICON GROUP --- */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                onClick={() => {
                  setPdfMode(!pdfMode);
                  setSelectedForPDF([]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${pdfMode
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                  }`}
              >
                <Printer size={16} />
                {pdfMode ? "Cancel PDF" : "Custom PDF"}
              </button>

              {/* Info Icon and Popup */}
              <div className="relative" ref={infoRef}>
                <button
                  onClick={() => setShowInfoPopup(!showInfoPopup)}
                  className={`p-1.5 rounded-lg transition-colors ${showInfoPopup ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Info size={18} />
                </button>

                <AnimatePresence>
                  {showInfoPopup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50"
                    >
                      <div className="flex flex-col gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">How to use Custom PDF:</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Click <span className="font-semibold text-purple-600">"Custom PDF"</span> to enable selection mode.
                          Check the boxes in the sidebar for the questions you want, then click
                          <span className="font-semibold text-indigo-600"> "Download PDF"</span> to generate a
                          structured document with one question per page.
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 italic">
                            Tip: Answers are automatically included on separate pages.
                          </p>
                        </div>
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* --- END PDF & INFO GROUP --- */}

            {/* ✅ DOWNLOAD BUTTON (Only shows when mode is active) */}
            {pdfMode && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300"
              >
                <Printer size={16} />
                {pdfLoading ? "Generating..." : "Download PDF"}
              </motion.button>
            )}
          </div>

          {/* Right side: View Mode & Nav */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-4">
              <button
                onClick={() => setViewMode("question")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold ${viewMode === "question" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                  }`}
              >
                Question
              </button>
              <button
                onClick={() => setViewMode("answer")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold ${viewMode === "answer" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                  }`}
              >
                Answer
              </button>
            </div>
            <button onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={handleNext} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar relative">

          <AnimatePresence mode="wait">
            {selectedResource ? (
              <motion.div
                key={selectedResource._id + viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >

                <div className="mb-6 flex items-center gap-2 text-xs">
                  <span className="text-red-500 font-bold uppercase tracking-wider">
                    Topic(s):
                  </span>
                  <span className="text-slate-500 italic font-medium">
                    {selectedResource.topicName || topic}
                  </span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-8 md:p-12">

                    {viewMode === "question" ? (
                      <div className="space-y-12">
                        {selectedResource.questionPaper.map((file, idx) => (
                          <div
                            key={idx}
                            className="min-h-screen flex flex-col items-center justify-start bg-white rounded-xl shadow-md p-6"
                          >
                            {/* Page Label */}
                            <div className="text-sm font-semibold text-slate-400 mb-4">
                              Page {idx + 1}
                            </div>

                            {/* Image */}
                            <img
                              src={file.cloudinaryUrl}
                              alt={`Question ${idx + 1}`}
                              className="max-w-full h-auto rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </div>
                    ) : !showAnswer ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <CheckCircle2 size={32} />
                        <h3 className="text-xl font-bold">
                          Mark Scheme Available
                        </h3>
                        <p className="text-slate-500 max-w-sm">
                          The official mark scheme and expert explanations are ready for review.
                        </p>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => setShowAnswer(true)}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                          >
                            View PDF
                          </button>

                          <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                            Video Solution
                          </button>
                        </div>
                      </div>
                    ) : selectedResource.markScheme?.length > 0 ? (
                      <div className="space-y-12">
                        {/* Back Button */}
                        <button
                          onClick={() => setShowAnswer(false)}
                          className="text-sm text-indigo-600 mb-4"
                        >
                          ← Back
                        </button>

                        {selectedResource.markScheme.map((file, idx) => (
                          <div
                            key={idx}
                            className="min-h-screen flex flex-col items-center justify-start bg-white rounded-xl shadow-md p-6"
                          >
                            <div className="text-sm font-semibold text-slate-400 mb-4">
                              Page {idx + 1}
                            </div>

                            {file.cloudinaryUrl?.toLowerCase().includes(".pdf") ? (
                              <iframe
                                src={file.cloudinaryUrl}
                                title={`PDF ${idx + 1}`}
                                className="w-full h-[800px] rounded-lg border"
                              />
                            ) : (
                              <img
                                src={file.cloudinaryUrl}
                                alt={`Answer ${idx + 1}`}
                                className="max-w-full h-auto rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center py-20 text-slate-500">
                        No Mark Scheme Available
                      </div>
                    )}

                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <FileText size={40} />
                <p>Select a question from the sidebar</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </main>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function SidebarAction({ icon, label, active = false }) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${active
        ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
        : "hover:bg-slate-50 text-slate-400"
        }`}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase">{label}</span>
    </button>
  );
}

function ToolbarButton({ icon, label }) {
  return (
    <button className="flex flex-col items-center text-slate-400 hover:text-indigo-600">
      <div className="p-1.5">{icon}</div>
      <span className="text-[9px] font-bold uppercase">{label}</span>
    </button>
  );
}