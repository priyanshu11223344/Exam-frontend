import React, { useState, useEffect, useCallback } from "react";

const ResourceCard = ({ resource }) => {
  const [showModal, setShowModal] = useState(false);

  // Derived content
  const title = resource.topic?.name
    ? `${resource.topic.name} Paper ${resource.paperNumber}`
    : `Paper ${resource.paperNumber}`;

  const topicName = resource.topic?.name || resource.topicId || "Topic";

  // 🔥 Now questionPaper is an ARRAY
  const questionFiles = resource.questionPaper || [];
  console.log(questionFiles)
  const markSchemeUrl = resource.markScheme?.url;
  const explanationUrl = resource.explanation?.url;
  const commentsUrl = resource.specialComment?.url;

  // ESC key handler
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setShowModal(false);
    };

    if (showModal) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const toggleModal = useCallback(() => {
    setShowModal((prev) => !prev);
  }, []);

  return (
    <>
      {/* ================= CARD ================= */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group relative flex flex-col h-full">
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-indigo-100">
              {resource.year} • {resource.season}
            </span>
            <span className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-slate-100">
              P{resource.paperNumber} / V{resource.variant}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-700 transition-colors duration-300">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mb-8 flex-grow">
            Master {topicName} concepts with curated previous year papers and expert solutions.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            {/* QUESTION BUTTON */}
            <button
              onClick={toggleModal}
              className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white py-3 rounded-xl border border-slate-100 hover:border-indigo-600 transition-all duration-300 text-xs font-bold shadow-sm"
            >
              <i className="fas fa-expand-alt"></i>
              Question
            </button>

            {/* MARK SCHEME */}
            {markSchemeUrl ? (
              <a
                href={markSchemeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white py-3 rounded-xl border border-slate-100 hover:border-emerald-600 transition-all duration-300 text-xs font-bold shadow-sm"
              >
                <i className="fas fa-check-circle"></i>
                Mark Scheme
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-slate-50/50 text-slate-300 py-3 rounded-xl border border-slate-50 text-xs font-bold">
                N/A
              </div>
            )}

            {/* EXPLANATION */}
            {explanationUrl ? (
              <a
                href={explanationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-amber-500 text-slate-700 hover:text-white py-3 rounded-xl border border-slate-100 hover:border-amber-500 transition-all duration-300 text-xs font-bold shadow-sm"
              >
                <i className="fas fa-video"></i>
                Solution
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-slate-50/50 text-slate-300 py-3 rounded-xl border border-slate-50 text-xs font-bold">
                N/A
              </div>
            )}

            {/* COMMENTS */}
            {commentsUrl ? (
              <a
                href={commentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-purple-600 text-slate-700 hover:text-white py-3 rounded-xl border border-slate-100 hover:border-purple-600 transition-all duration-300 text-xs font-bold shadow-sm"
              >
                <i className="fas fa-comment-dots"></i>
                Comments
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-slate-50/50 text-slate-300 py-3 rounded-xl border border-slate-50 text-xs font-bold">
                N/A
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />

          <div
            className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h4 className="font-bold text-lg">{title}</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* MULTI IMAGE AREA */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
              {questionFiles.length === 0 ? (
                <div className="text-center text-gray-400">
                  No question files available
                </div>
              ) : (
                questionFiles.map((file, index) => (
                  <div key={index} className="mb-8">
                    <div className="text-center text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Page {index + 1}
                    </div>

                    {file.fileType === "image" ? (
                      <img
                        src={file.url}
                        alt={`Question page ${index + 1}`}
                        className="w-full rounded-xl shadow-md"
                        onError={() =>
                          console.log("Failed to load:", file.url)
                        }
                      />
                    ) : file.fileType === "pdf" ? (
                      <iframe
                        src={file.url}
                        title={`PDF page ${index + 1}`}
                        className="w-full h-[600px] rounded-xl border"
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline"
                      >
                        Open File
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Print
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceCard;
