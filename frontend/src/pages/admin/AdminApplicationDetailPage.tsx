import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';

const AdminApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Decision Modal State
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'correction' | null>(null);
  const [modalNotes, setModalNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadApplicationDetail();
    }
  }, [id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getApplication(parseInt(id!));
      setApplication(data.application);
    } catch (err: any) {
      console.error('Failed to load application:', err);
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
      if (status === 'approved') {
        payload.notes = notesText || 'Application approved by staff';
      } else if (status === 'rejected') {
        payload.rejection_reason = notesText;
        payload.notes = notesText;
      } else if (status === 'correction_required') {
        payload.correction_notes = notesText;
        payload.notes = notesText;
      } else if (status === 'under_review') {
        payload.notes = 'Application taken under review by staff';
      }

      const res = await adminApi.updateApplicationStatus(parseInt(id!), payload);
      setSuccess(res.message || 'Status updated successfully.');
      setModalType(null);
      setModalNotes('');
      await loadApplicationDetail();
    } catch (err: any) {
      console.error('Status update failed:', err);
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      correction_required: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading application dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-700">Application #{id} not found.</p>
        <Link to="/admin/applications" className="mt-4 inline-block text-blue-600 font-semibold">
          ← Back to applications
        </Link>
      </div>
    );
  }

  const profile = application.applicant?.profile;

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link to="/admin/applications" className="text-sm font-semibold text-gray-500 hover:text-gray-700">
              Applications
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-semibold text-gray-900">{application.application_number}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
            Application Review #{application.application_number}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1.5 inline-flex text-xs font-extrabold rounded-full ${getStatusColor(application.status)}`}>
            {application.status.replace('_', ' ').toUpperCase()}
          </span>

          {application.student && (
            <span className="px-3 py-1.5 inline-flex text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800">
              Student ID: {application.student.student_id}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Action Buttons Panel */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-gray-700">Review Actions:</span>
          <p className="text-xs text-gray-500">
            Submit a formal admission decision or request adjustments from applicant
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {application.status === 'submitted' && (
            <button
              onClick={() => handleStatusChange('under_review')}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition"
            >
              Start Review
            </button>
          )}

          <button
            onClick={() => setModalType('approve')}
            disabled={actionLoading || application.status === 'approved'}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
          >
            ✓ Approve & Matriculate
          </button>

          <button
            onClick={() => setModalType('correction')}
            disabled={actionLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
          >
            ✎ Request Correction
          </button>

          <button
            onClick={() => setModalType('reject')}
            disabled={actionLoading || application.status === 'rejected'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
          >
            ✕ Reject
          </button>
        </div>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant & Program */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 mb-4">
              Academic Program Selected
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Department</span>
                <span className="font-semibold text-gray-900">{application.program?.department?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Occupation / Trade</span>
                <span className="font-semibold text-gray-900">{application.program?.occupation?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">TVET Qualification Level</span>
                <span className="font-semibold text-blue-600">{application.program?.qualification_level?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Admission Period</span>
                <span className="font-semibold text-gray-900">
                  {application.program?.admission_period?.name} ({application.program?.admission_period?.academic_year})
                </span>
              </div>
            </div>
          </div>

          {/* Educational Background & Disability */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 mb-4">
              Prior Education & Qualifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-xs">Previous School</span>
                <span className="font-semibold text-gray-900">{application.qualifications?.previous_school_name || '-'}</span>
                {application.qualifications?.previous_school_address && (
                  <span className="text-xs text-gray-500 block">{application.qualifications.previous_school_address}</span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Grade 10 National Exam Result</span>
                <span className="font-semibold text-gray-900">
                  {application.qualifications?.grade_10_result !== null
                    ? `${application.qualifications.grade_10_result}`
                    : 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Grade 12 National Exam Result</span>
                <span className="font-semibold text-gray-900">
                  {application.qualifications?.grade_12_result !== null
                    ? `${application.qualifications.grade_12_result}`
                    : 'Not provided'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-xs">Disability Support Required</span>
                <span className="font-semibold text-gray-900">
                  {application.qualifications?.has_disability ? 'Yes' : 'No'}
                </span>
                {application.qualifications?.has_disability && (
                  <p className="mt-1 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                    {application.qualifications.disability_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 mb-4">
              Submitted Verification Documents ({application.documents?.length || 0})
            </h3>
            {application.documents?.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No documents attached to this application.</p>
            ) : (
              <div className="space-y-3">
                {application.documents.map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 text-sm">
                    <div>
                      <div className="font-bold text-gray-900 capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                      >
                        Open File ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Applicant Profile Card & Audit History */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 mb-4">
              Applicant Profile
            </h3>
            {profile ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Full Name</span>
                  <span className="font-bold text-gray-900 text-base">{profile.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Contact Info</span>
                  <span className="text-gray-800 font-medium block">📞 {profile.phone}</span>
                  <span className="text-gray-600 text-xs block">{application.applicant?.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Gender</span>
                    <span className="font-medium text-gray-800 capitalize">{profile.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Date of Birth</span>
                    <span className="font-medium text-gray-800">{profile.date_of_birth}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-gray-500 block text-xs font-bold">Address</span>
                  <div className="text-xs text-gray-700 mt-1">
                    Region: <strong className="font-medium">{profile.region}</strong>, Zone: <strong className="font-medium">{profile.zone}</strong>
                    <br />
                    Woreda: <strong className="font-medium">{profile.woreda}</strong>, Kebele: <strong className="font-medium">{profile.kebele}</strong>
                    {profile.house_number && `, House: ${profile.house_number}`}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-gray-500 block text-xs font-bold">Emergency Contact</span>
                  <div className="text-xs text-gray-700 mt-1">
                    <span className="font-medium">{profile.emergency_contact_name}</span> ({profile.emergency_contact_relationship})
                    <br />
                    📞 {profile.emergency_contact_phone}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Applicant has not completed their profile profile yet.</p>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 mb-4">
              Status Audit Trail
            </h3>
            {application.status_history?.length === 0 ? (
              <p className="text-xs text-gray-500">No status changes recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {application.status_history.map((hist: any) => (
                  <div key={hist.id} className="relative pl-4 border-l-2 border-blue-500 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span className="uppercase text-blue-700">{hist.new_status.replace('_', ' ')}</span>
                      <span className="text-gray-400 font-normal">
                        {new Date(hist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-600">{hist.notes}</div>
                    <div className="text-gray-400 text-[10px]">By: {hist.changed_by}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Notes Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {modalType === 'approve' && 'Confirm Admission Approval'}
              {modalType === 'reject' && 'Reject Application'}
              {modalType === 'correction' && 'Request Document / Info Correction'}
            </h3>

            <p className="text-xs text-gray-600">
              {modalType === 'approve' &&
                'Approving this application will generate an official Student Record with student ID and matriculate the student.'}
              {modalType === 'reject' && 'Please state the reason for rejecting this admission application.'}
              {modalType === 'correction' &&
                'Specify the missing information or incorrect documents so the applicant can revise and resubmit.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {modalType === 'approve' ? 'Optional Approval Remarks:' : 'Remarks / Reason (Required):'}
              </label>
              <textarea
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Enter details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setModalType(null);
                  setModalNotes('');
                }}
                className="px-4 py-2 border rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
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
                className={`px-4 py-2 text-white text-xs font-bold rounded-md disabled:opacity-50 ${
                  modalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : modalType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
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
