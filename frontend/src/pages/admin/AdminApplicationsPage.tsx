import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, referenceApi } from '../../services/api';

const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [statusFilter, departmentFilter]);

  const loadDepartments = async () => {
    try {
      const data = await referenceApi.getDepartments();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminApi.getApplications(params);
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; dot: string; label: string }> = {
      draft: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400', label: 'Draft' },
      submitted: { bg: 'bg-[#0075ff]/15 text-[#0075ff] border-[#0075ff]/30', dot: 'bg-[#0075ff] animate-ping', label: 'Submitted' },
      under_review: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', label: 'In Review' },
      correction_required: { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', label: 'Action Needed' },
      approved: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Approved' },
      rejected: { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400', label: 'Rejected' },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`}></span>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Application Dossiers Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review, verify candidate certificates, and process admission decisions
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-xs backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Filter and Search Bar in Vision UI Glass Card */}
      <div className="vision-card p-5 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Search Applicants
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="Search by name, email, or application #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 vision-input rounded-l-xl text-xs placeholder:text-slate-500 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0075ff] text-white rounded-r-xl text-xs font-bold hover:bg-[#0060df] shadow-lg shadow-blue-500/30 transition"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 vision-input rounded-xl text-xs font-medium cursor-pointer"
            >
              <option value="all" className="bg-[#0b1437]">All Statuses</option>
              <option value="submitted" className="bg-[#0b1437]">Submitted (Needs Review)</option>
              <option value="under_review" className="bg-[#0b1437]">Under Review</option>
              <option value="approved" className="bg-[#0b1437]">Approved</option>
              <option value="correction_required" className="bg-[#0b1437]">Correction Required</option>
              <option value="rejected" className="bg-[#0b1437]">Rejected</option>
              <option value="draft" className="bg-[#0b1437]">Draft (Not submitted)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2.5 vision-input rounded-xl text-xs font-medium cursor-pointer"
            >
              <option value="" className="bg-[#0b1437]">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0b1437]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Applications Table */}
      <div className="vision-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300">
            Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={loadApplications}
            className="text-xs text-[#0075ff] hover:text-[#00d8d6] font-bold transition flex items-center space-x-1"
          >
            <span>↻ Refresh Pipeline</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0075ff] border-t-transparent mx-auto"></div>
            <p className="mt-3 text-xs text-slate-400">Loading candidate applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Application #</th>
                  <th className="px-6 py-3.5">Applicant</th>
                  <th className="px-6 py-3.5">Program & Level</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-white">
                      {app.application_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-white">{app.applicant.full_name}</div>
                      <div className="text-[11px] text-slate-400">{app.applicant.email}</div>
                      {app.applicant.phone && (
                        <div className="text-[11px] text-slate-400">📞 {app.applicant.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{app.department?.name || '-'}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.occupation?.name} • <span className="font-semibold text-[#00d8d6]">{app.qualification_level?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : 'Not submitted'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#0075ff]/20 hover:bg-[#0075ff] text-[#0075ff] hover:text-white font-bold transition text-[11px] border border-[#0075ff]/30"
                      >
                        Review Dossier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
