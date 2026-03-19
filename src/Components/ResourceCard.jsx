import React, { useState, useMemo,useEffect } from "react";
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
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function QuestionExplorer({resource,board,subject,topic}) {
  const resourceArray=resource
   console.log(resourceArray)
  const [selectedId, setSelectedId] = useState(resourceArray[0]._id);
  // console.log("id is",resourceArray[0]._id)
  const [viewMode, setViewMode] = useState("question");
  const [showAnswer, setShowAnswer] = useState(false);
  const selectedResource = useMemo(() => {
    return resourceArray.find(r => r._id === selectedId);
  }, [selectedId]);

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
            <button
              key={resource._id}
              onClick={() => setSelectedId(resource._id)}
              className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-center justify-between group transition-all duration-200 ${
                selectedId === resource._id
                  ? "bg-indigo-50/50 border-l-4 border-l-indigo-500"
                  : "hover:bg-slate-50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    selectedId === resource._id
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  {subject}/{resource.paperNumber}_{resource.season}_{resource.year}_Q{resource.variant}
                 
                </span>
              </div>
              {/* <Heart
                size={14}
                className={`${
                  selectedId === resource._id
                    ? "text-indigo-400 fill-indigo-400"
                    : "text-slate-300 group-hover:text-slate-400"
                } transition-colors`}
              /> */}
            </button>
          ))}
        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-grow flex flex-col bg-[#F1F5F9] relative overflow-hidden">

        {/* Toolbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">

          <div className="flex items-center gap-4">
            <ToolbarButton icon={<Plus size={18} />} label="Add to" />
            <ToolbarButton icon={<Share2 size={18} />} label="Share" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-4">
              <button
                onClick={() => setViewMode("question")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold ${
                  viewMode === "question"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Question
              </button>

              <button
                onClick={() => setViewMode("answer")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold ${
                  viewMode === "answer"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Answer
              </button>
            </div>

            <button onClick={handlePrev}>
              <ChevronLeft size={20} />
            </button>

            <button onClick={handleNext}>
              <ChevronRight size={20} />
            </button>

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
                            src={file.url}
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
                    
                            {file.fileType === "image" ? (
                              <img
                                src={file.url}
                                alt={`Answer ${idx + 1}`}
                                className="max-w-full h-auto rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                            ) : file.fileType === "pdf" ? (
                              <iframe
                                src={file.url}
                                title={`PDF ${idx + 1}`}
                                className="w-full h-[800px] rounded-lg border"
                              />
                            ) : (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 underline"
                              >
                                Open File
                              </a>
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
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${
        active
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