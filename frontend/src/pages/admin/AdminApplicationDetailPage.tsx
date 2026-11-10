import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:               { label: 'Draft',              color: 'text-slate-300',   bg: 'bg-slate-500/20',   border: 'border-slate-500/30' },
  submitted:           { label: 'Submitted',          color: 'text-blue-300',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30' },
  under_review:        { label: 'Under Review',       color: 'text-yellow-300',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500/30' },
  correction_required: { label: 'Correction Needed',  color: 'text-orange-300',  bg: 'bg-orange-500/20',  border: 'border-orange-500/30' },
  approved:            { label: 'Approved',           color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  rejected:            { label: 'Rejected',           color: 'text-rose-300',    bg: 'bg-rose-500/20',    border: 'border-rose-500/30' },
};

const AdminApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'correction' | null>(null);
  const [modalNotes, setModalNotes] = useState('');

  useEffect(() => { if (id) loadApplicationDetail(); }, [id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getApplication(parseInt(id!));
      setApplication(data.application);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    status: 'under_review' | 'approved' | 'rejected' | 'correction_required',
    notesText?: string
  ) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const payload: any = { status };
      if (status === 'approved') payload.notes = notesText || 'Application approved by staff';
      else if (status === 'rejected') { payload.rejection_reason = notesText; payload.notes = notesText; }
      else if (status === 'correction_required') { payload.correction_notes = notesText; payload.notes = notesText; }
      else if (status === 'under_review') payload.notes = 'Application taken under review by staff';
      const res = await adminApi.updateApplicationStatus(parseInt(id!), payload);
      setSuccess(res.message || 'Status updated successfully.');
      setModalType(null);
      setModalNotes('');
      await loadApplicationDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading application dossier...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-slate-400">Application #{id} not found.</p>
        <Link to="/admin/applications" className="inline-block px-4 py-2 bg-[#0075ff] text-white rounded-xl text-sm font-bold">
          ← Back to Applications
        </Link>
      </div>
    );
  }

  const profile = application.applicant?.profile;
  const st = statusConfig[application.status] || statusConfig.draft;

  const InfoPair = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
      <span className="text-sm font-semibold text-white mt-0.5 block">{value || '—'}</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Link to="/admin/applications" className="hover:text-white transition">Applications</Link>
            <span>/</span>
            <span className="text-white font-semibold">{application.application_number}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-black text-white">Application Review</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border ${st.bg} ${st.color} ${st.border}`}>
              {st.label}
            </span>
            {application.student && (
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                ID: {application.student.student_id}
              </span>
            )}
          </div>
        </div>
        <Link to="/admin/applications" className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          <span>All Applications</span>
        </Link>
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

      {/* Action Panel */}
      <div className="vision-card-glow rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-white">Review Actions</span>
          <p className="text-xs text-slate-400 mt-0.5">Make a formal admission decision for this application</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {application.status === 'submitted' && (
            <button
              onClick={() => handleStatusChange('under_review')}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-bold rounded-xl border border-yellow-500/30 transition disabled:opacity-50"
            >
              Start Review
            </button>
          )}
          <button
            onClick={() => setModalType('approve')}
            disabled={actionLoading || application.status === 'approved'}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition disabled:opacity-50"
          >
            ✓ Approve & Matriculate
          </button>
          <button
            onClick={() => setModalType('correction')}
            disabled={actionLoading}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold rounded-xl border border-orange-500/30 transition disabled:opacity-50"
          >
            ✎ Request Correction
          </button>
          <button
            onClick={() => setModalType('reject')}
            disabled={actionLoading || application.status === 'rejected'}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition disabled:opacity-50"
          >
            ✕ Reject
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Info */}
          <div className="vision-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Academic Program Selected</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoPair label="Department" value={application.program?.department?.name} />
              <InfoPair label="Occupation / Trade" value={application.program?.occupation?.name} />
              <InfoPair label="TVET Qualification Level" value={application.program?.qualification_level?.name} />
              <InfoPair label="Admission Period" value={`${application.program?.admission_period?.name || ''} (${application.program?.admission_period?.academic_year || ''})`} />
            </div>
          </div>

          {/* Educational Background */}
          <div className="vision-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Prior Education & Qualifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <InfoPair label="Previous School" value={application.qualifications?.previous_school_name} />
                {application.qualifications?.previous_school_address && (
                  <span className="text-xs text-slate-500 mt-0.5 block">{application.qualifications.previous_school_address}</span>
                )}
              </div>
              <InfoPair label="Grade 10 Exam Result" value={application.qualifications?.grade_10_result != null ? `${application.qualifications.grade_10_result}%` : 'Not provided'} />
              <InfoPair label="Grade 12 Exam Result" value={application.qualifications?.grade_12_result != null ? `${application.qualifications.grade_12_result}%` : 'Not provided'} />
              <div className="sm:col-span-2">
                <InfoPair label="Disability Support Required" value={application.qualifications?.has_disability ? 'Yes' : 'No'} />
                {application.qualifications?.has_disability && (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                    {application.qualifications.disability_description}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="vision-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
              Submitted Documents ({application.documents?.length || 0})
            </h3>
            {!application.documents?.length ? (
              <p className="text-sm text-slate-500 italic">No documents attached to this application.</p>
            ) : (
              <div className="space-y-3">
                {application.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white capitalize">{doc.document_type.replace('_', ' ')}</p>
                        <p className="text-[11px] text-slate-400">{doc.file_name} · {(doc.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#0075ff]/10 hover:bg-[#0075ff]/20 text-[#0075ff] text-xs font-semibold border border-[#0075ff]/20 transition"
                    >
                      Open ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile + Timeline */}
        <div className="space-y-6">
          {/* Applicant Profile */}
          <div className="vision-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Applicant Profile</h3>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0075ff] via-[#102a71] to-[#7551ff] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/30 shrink-0">
                    {profile.first_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{profile.full_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{profile.gender}</p>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white/5" />
                <div className="space-y-3">
                  <InfoPair label="Phone" value={profile.phone} />
                  <InfoPair label="Email" value={application.applicant?.email} />
                  <InfoPair label="Date of Birth" value={profile.date_of_birth} />
                  <InfoPair label="Nationality" value={profile.nationality} />
                </div>
                <div className="h-[1px] w-full bg-white/5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Address</span>
                  <p className="text-xs text-slate-300">
                    {profile.region && `${profile.region} Region, `}
                    {profile.zone && `${profile.zone} Zone, `}
                    {profile.woreda && `Woreda ${profile.woreda}, `}
                    {profile.kebele && `Kebele ${profile.kebele}`}
                    {profile.house_number && `, House ${profile.house_number}`}
                  </p>
                </div>
                <div className="h-[1px] w-full bg-white/5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Emergency Contact</span>
                  <p className="text-xs text-white font-semibold">{profile.emergency_contact_name}</p>
                  <p className="text-xs text-slate-400">{profile.emergency_contact_relationship} · {profile.emergency_contact_phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Applicant has not completed their profile yet.</p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="vision-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Status Audit Trail</h3>
            {!application.status_history?.length ? (
              <p className="text-xs text-slate-500 italic">No status changes recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {application.status_history.map((hist: any) => {
                  const hst = statusConfig[hist.new_status] || statusConfig.draft;
                  return (
                    <div key={hist.id} className="relative pl-4 border-l-2 border-[#0075ff]/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase ${hst.color}`}>{hist.new_status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-500">{new Date(hist.created_at).toLocaleString()}</span>
                      </div>
                      {hist.notes && <p className="text-xs text-slate-300">{hist.notes}</p>}
                      <p className="text-[10px] text-slate-500">By: {hist.changed_by || 'System'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="vision-card rounded-3xl max-w-md w-full p-6 space-y-5 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent" />
            <h3 className="text-base font-black text-white">
              {modalType === 'approve' && '✓ Confirm Approval'}
              {modalType === 'reject' && '✕ Reject Application'}
              {modalType === 'correction' && '✎ Request Correction'}
            </h3>
            <p className="text-xs text-slate-400">
              {modalType === 'approve' && 'Approving will generate a Student ID and officially matriculate this applicant.'}
              {modalType === 'reject' && 'Please state the reason for rejecting this admission application.'}
              {modalType === 'correction' && 'Specify what information or documents the applicant needs to fix or resubmit.'}
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {modalType === 'approve' ? 'Optional Remarks:' : 'Remarks / Reason (Required):'}
              </label>
              <textarea
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Enter details..."
                className="w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setModalType(null); setModalNotes(''); }}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalType === 'approve') handleStatusChange('approved', modalNotes);
                  if (modalType === 'reject') handleStatusChange('rejected', modalNotes);
                  if (modalType === 'correction') handleStatusChange('correction_required', modalNotes);
                }}
                disabled={actionLoading || (modalType !== 'approve' && !modalNotes.trim())}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 ${
                  modalType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  modalType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationDetailPage;
