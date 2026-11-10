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

const periodStatusConfig = {
  open:   { label: 'Open',   color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  closed: { label: 'Closed', color: 'text-rose-300',    bg: 'bg-rose-500/20',    border: 'border-rose-500/30' },
  draft:  { label: 'Draft',  color: 'text-slate-300',   bg: 'bg-slate-500/20',   border: 'border-slate-500/30' },
};

const inputCls = "w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium";
const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

const AdminAdmissionPeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<AdmissionPeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AdmissionPeriodItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    opening_date: '',
    closing_date: '',
    status: 'draft' as 'draft' | 'open' | 'closed',
    description: '',
  });

  useEffect(() => { loadPeriods(); }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getAdmissionPeriods();
      setPeriods(data.admission_periods || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admission periods.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPeriod(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const y = new Date().getFullYear();
    setFormData({ name: `Admission Period ${y}`, academic_year: `${y}/${y + 1}`, opening_date: today, closing_date: nextMonth, status: 'open', description: '' });
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

  const closeModal = () => { setIsModalOpen(false); setEditingPeriod(null); setModalError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!formData.name.trim() || !formData.academic_year.trim()) {
      setModalError('Please fill in both the name and academic year.'); return;
    }
    if (!formData.opening_date || !formData.closing_date) {
      setModalError('Please specify opening and closing dates.'); return;
    }
    if (new Date(formData.closing_date) <= new Date(formData.opening_date)) {
      setModalError('Closing date must be after the opening date.'); return;
    }
    try {
      setSubmitting(true);
      if (editingPeriod) {
        await adminApi.updateAdmissionPeriod(editingPeriod.id, formData);
        setSuccessMessage(`Period "${formData.name}" updated successfully.`);
      } else {
        await adminApi.createAdmissionPeriod(formData);
        setSuccessMessage(`Period "${formData.name}" created successfully.`);
      }
      closeModal();
      loadPeriods();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to save admission period.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (period: AdmissionPeriodItem, newStatus: 'draft' | 'open' | 'closed') => {
    try {
      await adminApi.updateAdmissionPeriod(period.id, { status: newStatus });
      setSuccessMessage(`"${period.name}" status changed to ${newStatus}.`);
      loadPeriods();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Admission Periods</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure academic years, application windows, and intake status for TVET programs.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Admission Period</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <span className="flex items-center space-x-2"><span>✅</span><span>{successMessage}</span></span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <span className="flex items-center space-x-2"><span>⚠️</span><span>{error}</span></span>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="vision-card rounded-3xl p-12 flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading admission periods...</span>
        </div>
      ) : periods.length === 0 ? (
        <div className="vision-card rounded-3xl p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[#0075ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">No Admission Periods Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">Create an admission period so prospective students can submit applications.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Your First Period</span>
          </button>
        </div>
      ) : (
        <div className="vision-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{periods.length} Period{periods.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Period Details', 'Academic Year', 'Timeline', 'Status', 'Applications', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, idx) => {
                  const st = periodStatusConfig[period.status] || periodStatusConfig.draft;
                  return (
                    <tr key={period.id} className={`border-b border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{period.name}</p>
                        {period.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">{period.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-bold bg-[#0075ff]/10 text-[#0075ff] rounded-lg border border-[#0075ff]/20">
                          {period.academic_year}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 space-y-1">
                        <div><span className="text-slate-500">Open:</span> {period.opening_date}</div>
                        <div><span className="text-slate-500">Close:</span> {period.closing_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${st.bg} ${st.color} ${st.border}`}>
                            {st.label}
                          </span>
                          {period.status === 'open' && period.is_active && (
                            <div className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              <span className="text-[10px] text-emerald-400 font-semibold">Live & Accepting</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-white">{period.applications_count}</span>
                        <span className="text-xs text-slate-400 ml-1">submissions</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(period)}
                            className="px-3 py-1.5 rounded-lg bg-[#0075ff]/10 hover:bg-[#0075ff]/20 text-[#0075ff] text-xs font-semibold border border-[#0075ff]/20 transition"
                          >
                            Edit
                          </button>
                          {period.status !== 'open' && (
                            <button
                              onClick={() => handleQuickStatusChange(period, 'open')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition"
                            >
                              Open
                            </button>
                          )}
                          {period.status === 'open' && (
                            <button
                              onClick={() => handleQuickStatusChange(period, 'closed')}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vision-card rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent" />
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                {editingPeriod ? `Edit "${editingPeriod.name}"` : 'Create New Admission Period'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className={labelCls}>Period Name <span className="text-rose-400">*</span></label>
                <input
                  type="text" required
                  placeholder="e.g. 2026 Regular Intake"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Academic Year <span className="text-rose-400">*</span></label>
                <input
                  type="text" required
                  placeholder="e.g. 2026/2027"
                  value={formData.academic_year}
                  onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Opening Date <span className="text-rose-400">*</span></label>
                  <input
                    type="date" required
                    value={formData.opening_date}
                    onChange={e => setFormData({ ...formData, opening_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Closing Date <span className="text-rose-400">*</span></label>
                  <input
                    type="date" required
                    value={formData.closing_date}
                    onChange={e => setFormData({ ...formData, closing_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Status <span className="text-rose-400">*</span></label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'draft' | 'open' | 'closed' })}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0f1735] border border-white/10 text-white focus:border-[#0075ff] focus:outline-none"
                >
                  <option value="draft">Draft (Hidden from applicants)</option>
                  <option value="open">Open (Publicly accepts applications)</option>
                  <option value="closed">Closed (Submissions closed)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Description / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Notes for applicants about eligibility, entry criteria, or batches..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#0075ff] hover:bg-[#0060df] rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
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
