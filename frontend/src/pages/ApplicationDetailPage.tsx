import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';

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

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await applicationApi.uploadDocument(parseInt(id!), documentType, file);
      setSuccess('Document uploaded successfully!');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
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

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
          <span>✅</span><span>{success}</span>
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

      {/* Documents */}
      <div className="vision-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Documents</h3>
          {application.can_edit && (
            <span className="text-[11px] text-[#0075ff] font-semibold">Upload PDF, JPG or PNG</span>
          )}
        </div>

        {application.can_edit && (
          <div className="bg-[#0075ff]/10 border border-[#0075ff]/20 rounded-2xl p-3 mb-5 text-xs text-blue-300">
            Please upload: Academic Transcript, Certificate, ID Card, Birth Certificate, and a Passport Photo.
          </div>
        )}

        <div className="space-y-3">
          {docTypes.map((docType) => {
            const doc = application.documents?.find((d: any) => d.document_type === docType);
            const uploaded = !!doc;
            return (
              <div key={docType} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
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
                      <p className="text-[11px] text-slate-400">{doc.file_name} · {(doc.file_size / 1024).toFixed(1)} KB</p>
                    ) : (
                      <p className="text-[11px] text-slate-500">Not uploaded</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {doc ? (
                    <>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#0075ff]/10 hover:bg-[#0075ff]/20 text-[#0075ff] text-xs font-semibold border border-[#0075ff]/20 transition"
                      >
                        View
                      </a>
                      {application.can_edit && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  ) : application.can_edit ? (
                    <label className={`px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Upload
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
            className="shrink-0 flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
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
    </div>
  );
};

export default ApplicationDetailPage;
