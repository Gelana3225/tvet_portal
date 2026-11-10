import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:               { label: 'Draft',              color: 'text-slate-300',   bg: 'bg-slate-500/20',   border: 'border-slate-500/30' },
  submitted:           { label: 'Submitted',          color: 'text-blue-300',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30' },
  under_review:        { label: 'Under Review',       color: 'text-yellow-300',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500/30' },
  correction_required: { label: 'Correction Needed',  color: 'text-orange-300',  bg: 'bg-orange-500/20',  border: 'border-orange-500/30' },
  approved:            { label: 'Approved',            color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  rejected:            { label: 'Rejected',            color: 'text-rose-300',    bg: 'bg-rose-500/20',    border: 'border-rose-500/30' },
};

const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationApi.getApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">My Applications</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track all your admission applications</p>
        </div>
        <Link
          to="/dashboard/applications/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Application</span>
        </Link>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="vision-card rounded-3xl p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[#0075ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">No Applications Yet</h3>
            <p className="text-slate-400 text-sm mt-1">Start your journey by submitting your first application.</p>
          </div>
          <Link
            to="/dashboard/applications/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Your First Application</span>
          </Link>
        </div>
      ) : (
        /* Applications Table */
        <div className="vision-card rounded-3xl overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {applications.length} Application{applications.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">App #</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupation</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => {
                  const st = statusConfig[app.status] || statusConfig.draft;
                  return (
                    <tr
                      key={app.id}
                      className={`border-b border-white/5 transition hover:bg-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-[#0075ff]">
                          {app.application_number || `APP-${String(app.id).padStart(4, '0')}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {app.department?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {app.occupation?.name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${st.bg} ${st.color} ${st.border}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/applications/${app.id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0075ff]/10 hover:bg-[#0075ff]/20 text-[#0075ff] text-xs font-semibold border border-[#0075ff]/20 transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
