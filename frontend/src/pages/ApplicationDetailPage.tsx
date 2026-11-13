import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:               { label: 'Draft',              color: 'text-slate-300',   bg: 'bg-slate-500/20',   border: 'border-slate-500/30' },
  submitted:           { label: 'Submitted',          color: 'text-blue-300',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30' },
  under_review:        { label: 'Under Review',       color: 'text-yellow-300',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500/30' },
  correction_required: { label: 'Correction Needed',  color: 'text-orange-300',  bg: 'bg-orange-500/20',  border: 'border-orange-500/30' },
  approved:            { label: 'Approved ✓',         color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  rejected:            { label: 'Rejected',           color: 'text-rose-300',    bg: 'bg-rose-500/20',    border: 'border-rose-500/30' },
};

const docTypes = ['transcript', 'certificate', 'id_card', 'birth_certificate', 'photo'];
const docLabels: Record<string, string> = {
  transcript: 'Academic Transcript',
  certificate: 'Grade 10/12 Certificate',
  id_card: 'National ID Card',
  birth_certificate: 'Birth Certificate',
  photo: 'Passport Photo',
};

// 2 MB Maximum File Size Constraint
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = '2 MB';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Per-document error state (for size, type, or upload issues)
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  // Document modal viewer state
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const backendRoot = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

  const getDocumentUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `${backendRoot}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  useEffect(() => { if (id) loadApplication(); }, [id]);

  const loadApplication = async () => {
    try {
      const data = await applicationApi.getApplication(parseInt(id!));
      setApplication(data.application);
    } catch {
      setError('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error for this specific document
    setDocErrors(prev => ({ ...prev, [documentType]: '' }));
    setError('');
    setSuccess('');

    // 1. Client-Side Size Validation (Immediate warning without network delay)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File "${file.name}" is ${fileSizeMB} MB, which exceeds the maximum allowed limit of ${MAX_FILE_SIZE_LABEL}. Please compress or minimize your file and re-upload.`;
      
      setDocErrors(prev => ({ ...prev, [documentType]: errorMsg }));
      setError(errorMsg);
      e.target.value = ''; // Reset input to let user select a new compressed file
      return;
    }

    // 2. Client-Side Format Validation
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      const errorMsg = `File "${file.name}" has an unsupported format. Only PDF, JPG, and PNG files are accepted.`;
      setDocErrors(prev => ({ ...prev, [documentType]: errorMsg }));
      setError(errorMsg);
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      await applicationApi.uploadDocument(parseInt(id!), documentType, file);
      setSuccess(`"${docLabels[documentType] || documentType}" uploaded successfully!`);
      // Clear error for this doc
      setDocErrors(prev => ({ ...prev, [documentType]: '' }));
      await loadApplication();
    } catch (err: any) {
      let msg = 'Failed to upload document.';
      if (err.response?.data?.errors?.file) {
        msg = Array.isArray(err.response.data.errors.file)
          ? err.response.data.errors.file.join(' ')
          : String(err.response.data.errors.file);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.status === 413) {
        msg = `File is too large for the server. Maximum allowed size is ${MAX_FILE_SIZE_LABEL}. Please minimize or compress your file and re-upload.`;
      }
      setDocErrors(prev => ({ ...prev, [documentType]: msg }));
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset so the user can re-upload if needed
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit application? You cannot edit it after submission.')) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await applicationApi.submitApplication(parseInt(id!));
      setSuccess('Application submitted successfully!');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await applicationApi.deleteDocument(parseInt(id!), documentId);
      setSuccess('Document removed.');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading application...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-rose-300">Application not found.</p>
        <button onClick={() => navigate('/dashboard/applications')} className="mt-4 px-4 py-2 bg-[#0075ff] text-white rounded-xl text-sm font-bold">Back to Applications</button>
      </div>
    );
  }

  const st = statusConfig[application.status] || statusConfig.draft;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">Application Details</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border ${st.bg} ${st.color} ${st.border}`}>
              {st.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {application.application_number || `APP-${String(application.id).padStart(4, '0')}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs flex items-start space-x-3 animate-fade-in">
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <div className="space-y-1">
            <span className="font-bold block">Upload / Action Notice</span>
            <span className="leading-relaxed block">{error}</span>
          </div>
        </div>
      )}

      {/* Global Success Banner */}
      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs flex items-center space-x-3 animate-fade-in">
          <span className="text-base shrink-0">✅</span>
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* Program Info Card */}
      <div className="vision-card rounded-3xl p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Program Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: 'Admission Period', value: application.admission_period?.name },
            { label: 'Academic Year', value: application.admission_period?.academic_year },
            { label: 'Department', value: application.department?.name },
            { label: 'Occupation', value: application.occupation?.name },
            { label: 'Qualification Level', value: application.qualification_level?.name },
            { label: 'Submitted', value: application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('en-GB') : 'Not yet submitted' },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="vision-card rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Documents</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Please upload all 5 required documents to enable final submission.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#0075ff]/15 text-[#00d8d6] border border-[#0075ff]/30">
            Max Size: 2 MB per file
          </span>
        </div>

        {/* Informative Guidance & Compression Helper Card */}
        <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs mb-5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
            ℹ
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-bold text-white flex flex-wrap items-center gap-2">
              <span>File Size Limit & Format Standards</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                Limit: 2 MB (2,048 KB)
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Accepted formats: <strong>PDF, JPG, PNG</strong>. Every file must be under <strong>2 MB</strong>. If your document or scan is larger than 2 MB, please minimize or compress it (e.g. using an online PDF compressor or image resizer) before uploading.
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {docTypes.map((docType) => {
            const doc = application.documents?.find((d: any) => d.document_type === docType);
            const uploaded = !!doc;
            const docError = docErrors[docType];

            return (
              <div key={docType} className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                      {uploaded ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{docLabels[docType] || docType}</p>
                      {doc ? (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {doc.file_name} · {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500">Not uploaded yet (Max 2 MB)</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {doc ? (
                      <>
                        {/* Functional View Button -> Opens Document Preview Modal */}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ ...doc, title: docLabels[docType] || docType })}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0075ff]/15 hover:bg-[#0075ff]/25 text-[#0075ff] hover:text-white text-xs font-semibold border border-[#0075ff]/30 transition cursor-pointer"
                          title="Preview this document"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>

                        {/* Open in new tab link */}
                        <a
                          href={getDocumentUrl(doc.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open directly in new browser tab"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs border border-white/10 transition"
                        >
                          ↗
                        </a>

                        {application.can_edit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </>
                    ) : application.can_edit ? (
                      <label className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, docType)}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Missing</span>
                    )}
                  </div>
                </div>

                {/* Specific Document Error Display (Size or Format issue) */}
                {docError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-3 animate-fade-in">
                    <div className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5 text-sm">⚠️</span>
                      <div className="space-y-1">
                        <span className="font-semibold block">{docError}</span>
                        <p className="text-[11px] text-rose-200/80 leading-relaxed">
                          💡 <strong>How to fix:</strong> Use a free online PDF compressor (e.g. iLovePDF, SmallPDF) or reduce the scanning resolution to 150-200 DPI to minimize the file size under 2 MB, then re-upload.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocErrors(prev => ({ ...prev, [docType]: '' }))}
                      className="text-rose-400 hover:text-white text-xs font-bold shrink-0 p-1 rounded hover:bg-rose-500/20"
                      title="Dismiss error"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Action */}
      {application.can_edit && (
        <div className="vision-card-glow rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Ready to Submit?</h3>
            <p className="text-xs text-slate-400 mt-0.5">Make sure all documents are uploaded before submitting. You cannot edit after submission.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="shrink-0 flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* In-Portal Document Preview Modal */}
      <DocumentPreviewModal
        doc={previewDoc}
        title={previewDoc?.title}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};

export default ApplicationDetailPage;
