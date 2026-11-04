import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data.stats);
      setRecentApplications(data.recent_applications || []);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
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
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Period Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Portal Overview</h2>
          <p className="text-sm text-gray-600">
            Admissions, review pipeline, and student records for Hawagalan TVET College
          </p>
        </div>
        {stats?.active_period ? (
          <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            Active Period: <strong className="ml-1">{stats.active_period.name} ({stats.active_period.academic_year})</strong>
          </div>
        ) : (
          <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
            No active admission period open currently.
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Applications</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats?.total_applications ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">Across all admission periods</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase font-bold text-blue-600 tracking-wider">Pending Review</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {(stats?.submitted ?? 0) + (stats?.under_review ?? 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.submitted ?? 0} submitted, {stats?.under_review ?? 0} in progress
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase font-bold text-green-600 tracking-wider">Approved & Enrolled</div>
          <div className="text-3xl font-extrabold text-green-600 mt-2">{stats?.approved ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">{stats?.total_students ?? 0} student records created</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase font-bold text-orange-600 tracking-wider">Corrections / Rejected</div>
          <div className="text-3xl font-extrabold text-orange-600 mt-2">
            {(stats?.correction_required ?? 0) + (stats?.rejected ?? 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.correction_required ?? 0} corrections, {stats?.rejected ?? 0} rejected
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Recent Applications Received</h3>
          <Link
            to="/admin/applications"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View All Applications →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No applications received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department / Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {app.application_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{app.applicant_name}</div>
                      <div className="text-xs text-gray-500">{app.applicant_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{app.department}</div>
                      <div className="text-xs text-gray-500">{app.occupation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                      >
                        Review
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

export default AdminDashboardPage;

