import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

interface AdmissionPeriodItem {
  id: number;
  name: string;
  academic_year: string;
  opening_date: string;
  closing_date: string;
  status: 'draft' | 'open' | 'closed';
  description?: string;
  applications_count: number;
  is_active: boolean;
  created_at: string;
}

const AdminAdmissionPeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<AdmissionPeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AdmissionPeriodItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    opening_date: '',
    closing_date: '',
    status: 'draft' as 'draft' | 'open' | 'closed',
    description: '',
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getAdmissionPeriods();
      setPeriods(data.admission_periods || []);
    } catch (err: any) {
      console.error('Failed to load admission periods:', err);
      setError(err.response?.data?.message || 'Failed to load admission periods.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPeriod(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    setFormData({
      name: `Admission Period ${currentYear}`,
      academic_year: `${currentYear}/${currentYear + 1}`,
      opening_date: today,
      closing_date: nextMonth,
      status: 'open',
      description: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (period: AdmissionPeriodItem) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      academic_year: period.academic_year,
      opening_date: period.opening_date ? period.opening_date.slice(0, 10) : '',
      closing_date: period.closing_date ? period.closing_date.slice(0, 10) : '',
      status: period.status,
      description: period.description || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPeriod(null);
    setModalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.academic_year.trim()) {
      setModalError('Please fill in both the name and academic year.');
      return;
    }

    if (!formData.opening_date || !formData.closing_date) {
      setModalError('Please specify opening and closing dates.');
      return;
    }

    if (new Date(formData.closing_date) <= new Date(formData.opening_date)) {
      setModalError('Closing date must be strictly after the opening date.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPeriod) {
        await adminApi.updateAdmissionPeriod(editingPeriod.id, formData);
        setSuccessMessage(`Admission period "${formData.name}" updated successfully.`);
      } else {
        await adminApi.createAdmissionPeriod(formData);
        setSuccessMessage(`Admission period "${formData.name}" created successfully.`);
      }
      closeModal();
      loadPeriods();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Failed to save admission period:', err);
      setModalError(err.response?.data?.message || 'Failed to save admission period.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (period: AdmissionPeriodItem, newStatus: 'draft' | 'open' | 'closed') => {
    try {
      await adminApi.updateAdmissionPeriod(period.id, { status: newStatus });
      setSuccessMessage(`Period "${period.name}" status changed to ${newStatus}.`);
      loadPeriods();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'open') {
      return (
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Open
          </span>
          {isActive ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live & Accepting
            </span>
          ) : (
            <span className="text-xs text-gray-400">(Date Window Inactive)</span>
          )}
        </div>
      );
    }
    if (status === 'closed') {
      return (
        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Closed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
        Draft
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission Periods</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure academic years, application windows, and intake intake status for TVET programs.
          </p>
        </div>
        <div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Admission Period
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-500 hover:text-green-700 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading admission periods...</p>
        </div>
      ) : periods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-lg font-medium text-gray-900">No Admission Periods Found</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Get started by creating an admission period so prospective students can submit applications for upcoming batches.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Create Your First Period
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Period Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{period.name}</div>
                    {period.description && (
                      <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">{period.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-md">
                      {period.academic_year}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div><span className="text-xs font-semibold text-gray-400">Open:</span> {period.opening_date}</div>
                    <div><span className="text-xs font-semibold text-gray-400">Close:</span> {period.closing_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(period.status, period.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {period.applications_count} submissions
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(period)}
                      className="text-blue-600 hover:text-blue-900 font-semibold text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    {period.status !== 'open' && (
                      <button
                        onClick={() => handleQuickStatusChange(period, 'open')}
                        className="text-emerald-600 hover:text-emerald-900 font-semibold text-xs px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100"
                      >
                        Set Open
                      </button>
                    )}

                    {period.status === 'open' && (
                      <button
                        onClick={() => handleQuickStatusChange(period, 'closed')}
                        className="text-red-600 hover:text-red-900 font-semibold text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-lg w-full shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPeriod ? `Edit "${editingPeriod.name}"` : 'Create New Admission Period'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Period Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Regular Intake"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026/2027"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Opening Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.opening_date}
                    onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'draft' | 'open' | 'closed' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="draft">Draft (Hidden from applicants)</option>
                  <option value="open">Open (Publicly accepts applications)</option>
                  <option value="closed">Closed (Submissions closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes for applicants or staff about eligibility, entry criteria, or batches..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPeriod ? 'Save Changes' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmissionPeriodsPage;

