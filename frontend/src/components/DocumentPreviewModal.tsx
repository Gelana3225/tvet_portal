import React, { useEffect } from 'react';

interface DocumentPreviewModalProps {
  doc: {
    id?: number;
    file_name: string;
    file_url: string;
    document_type?: string;
    file_size?: number;
  } | null;
  title?: string;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  doc,
  title,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!doc) return null;

  const backendRoot = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  const fileUrl = doc.file_url?.startsWith('http://') || doc.file_url?.startsWith('https://')
    ? doc.file_url
    : `${backendRoot}${doc.file_url?.startsWith('/') ? '' : '/'}${doc.file_url || ''}`;

  const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.file_name || '');
  const sizeFormatted = doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col vision-card rounded-3xl border border-white/15 shadow-2xl overflow-hidden bg-[#0d1430]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#0075ff]/20 text-[#0075ff] flex items-center justify-center font-bold text-base shrink-0">
              {isPdf ? '📄' : isImage ? '🖼️' : '📁'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {title || doc.file_name}
              </h3>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                <span className="truncate">{doc.file_name}</span>
                {sizeFormatted && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-semibold">{sizeFormatted}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Open in new tab */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
              title="Open in new window"
            >
              <span>Open in Tab</span>
              <span>↗</span>
            </a>

            {/* Download */}
            <a
              href={fileUrl}
              download={doc.file_name}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0075ff]/15 hover:bg-[#0075ff]/25 text-[#0075ff] border border-[#0075ff]/30 transition"
              title="Download file"
            >
              <span>Download</span>
              <span>⬇</span>
            </a>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center font-bold transition text-base"
              title="Close viewer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 p-3 sm:p-5 overflow-auto flex items-center justify-center bg-slate-950/40 min-h-[350px]">
          {isPdf ? (
            <div className="w-full h-[68vh] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner flex flex-col">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                title={doc.file_name}
                className="w-full h-full border-0"
              />
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center w-full max-h-[68vh] p-2">
              <img
                src={fileUrl}
                alt={doc.file_name}
                className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="text-4xl">📎</div>
              <p className="text-sm text-slate-300">Preview not available for this file type.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#0075ff] text-white text-xs font-bold rounded-xl"
              >
                Download or Open File ↗
              </a>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-500">
          <span>Press ESC or click outside to close preview</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white underline underline-offset-2"
          >
            Direct File Link ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;

