import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileWarning, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfPage = ({ document, pageNumber }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let renderTask;
    let cancelled = false;

    document.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = page.render({ canvasContext: context, viewport });
      return renderTask.promise;
    }).catch(() => {});

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [document, pageNumber]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Question paper page ${pageNumber}`}
      className="h-auto max-w-full bg-white shadow-2xl"
      onContextMenu={(event) => event.preventDefault()}
    />
  );
};

const PdfPaper = ({ data }) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument({ data: data.slice() });

    loadingTask.promise
      .then((loadedDocument) => {
        if (!cancelled) setDocument(loadedDocument);
      })
      .catch(() => {
        if (!cancelled) setError("This PDF could not be rendered.");
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [data]);

  if (error) {
    return <ViewerError message={error} />;
  }

  if (!document) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 py-6">
      {Array.from({ length: document.numPages }, (_, index) => (
        <PdfPage key={index + 1} document={document} pageNumber={index + 1} />
      ))}
    </div>
  );
};

const ImagePaper = ({ blob, title }) => {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="flex min-h-[70vh] items-start justify-center p-6">
      {url && (
        <img
          src={url}
          alt={title}
          draggable="false"
          className="max-h-full max-w-full select-none bg-white object-contain shadow-2xl"
          onContextMenu={(event) => event.preventDefault()}
        />
      )}
    </div>
  );
};

const ViewerError = ({ message }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-white">
    <FileWarning size={42} className="text-amber-400" />
    <p className="font-black">{message}</p>
  </div>
);

const PaperViewer = ({ viewer, watermark, onClose }) => {
  useEffect(() => {
    const blockProtectedShortcuts = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", blockProtectedShortcuts, true);
    return () => window.removeEventListener("keydown", blockProtectedShortcuts, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950 text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label={viewer.title}
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <header className="relative z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950 px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            <ShieldCheck size={15} /> Protected exam viewer
          </p>
          <h2 className="mt-1 font-black">{viewer.title}</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close paper">
          <X size={20} />
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto bg-slate-900">
        {viewer.loading ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
            <LoaderCircle className="animate-spin" size={34} />
            <p className="font-bold text-slate-300">Preparing protected paper...</p>
          </div>
        ) : viewer.error ? (
          <ViewerError message={viewer.error} />
        ) : viewer.mimeType === "application/pdf" ? (
          <PdfPaper data={viewer.data} />
        ) : (
          <ImagePaper blob={viewer.blob} title={viewer.title} />
        )}

        {!viewer.loading && !viewer.error && (
          <div className="pointer-events-none fixed inset-0 z-10 grid grid-cols-2 grid-rows-4 overflow-hidden pt-20 opacity-[0.08]">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="flex -rotate-12 items-center justify-center px-4 text-center text-lg font-black uppercase tracking-wider text-white">
                {watermark}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperViewer;
