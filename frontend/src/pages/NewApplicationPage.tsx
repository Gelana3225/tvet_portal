import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApi, referenceApi } from '../services/api';

const selectCls = "w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0f1735] border border-white/10 text-white focus:border-[#0075ff] focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed";
const inputCls = "w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium";
const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);
  const [qualificationLevels, setQualificationLevels] = useState<any[]>([]);
  const [admissionPeriods, setAdmissionPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    admission_period_id: '',
    department_id: '',
    occupation_id: '',
    qualification_level_id: '',
    previous_school_name: '',
    previous_school_address: '',
    grade_10_result: '',
    grade_12_result: '',
    has_disability: false,
    disability_description: '',
  });

  useEffect(() => { loadReferenceData(); }, []);

  useEffect(() => {
    if (formData.department_id) {
      loadOccupations(parseInt(formData.department_id));
      setFormData(f => ({ ...f, occupation_id: '' }));
    }
  }, [formData.department_id]);

  const loadReferenceData = async () => {
    try {
      const [depts, quals, periods] = await Promise.all([
        referenceApi.getDepartments(),
        referenceApi.getQualificationLevels(),
        referenceApi.getAdmissionPeriods(),
      ]);
      setDepartments(depts.departments || []);
      setQualificationLevels(quals.qualification_levels || []);
      setAdmissionPeriods(periods.admission_periods || []);
    } catch (err) {
      setError('Failed to load reference data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const loadOccupations = async (departmentId: number) => {
    try {
      const data = await referenceApi.getOccupations(departmentId);
      setOccupations(data.occupations || []);
    } catch (err) {
      console.error('Failed to load occupations:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await applicationApi.createApplication(formData);
      navigate(`/dashboard/applications/${response.application.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading form data...</span>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center space-x-2 mb-5">
      <div className="w-5 h-5 rounded-md bg-[#0075ff]/20 flex items-center justify-center shrink-0">{icon}</div>
      <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">New Application</h2>
        <p className="text-xs text-slate-400 mt-0.5">Fill in all required fields to submit your admission application</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admission Period */}
        <div className="vision-card rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent" />
          <SectionHeader
            title="Admission Period"
            icon={<svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
          />
          <div>
            <label className={labelCls}>Select Admission Period <span className="text-rose-400">*</span></label>
            <select name="admission_period_id" required value={formData.admission_period_id} onChange={handleChange} className={selectCls}>
              <option value="">Choose an admission period...</option>
              {admissionPeriods.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.academic_year} ({p.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Program Selection */}
        <div className="vision-card rounded-3xl p-6">
          <SectionHeader
            title="Program Selection"
            icon={<svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm5.99 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department <span className="text-rose-400">*</span></label>
              <select name="department_id" required value={formData.department_id} onChange={handleChange} className={selectCls}>
                <option value="">Select Department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Occupation <span className="text-rose-400">*</span></label>
              <select name="occupation_id" required value={formData.occupation_id} onChange={handleChange} disabled={!formData.department_id} className={selectCls}>
                <option value="">{formData.department_id ? 'Select Occupation...' : 'Select department first'}</option>
                {occupations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Qualification Level <span className="text-rose-400">*</span></label>
              <select name="qualification_level_id" required value={formData.qualification_level_id} onChange={handleChange} className={selectCls}>
                <option value="">Select Level...</option>
                {qualificationLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div className="vision-card rounded-3xl p-6">
          <SectionHeader
            title="Educational Background"
            icon={<svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Previous School Name <span className="text-rose-400">*</span></label>
              <input type="text" name="previous_school_name" required value={formData.previous_school_name} onChange={handleChange} placeholder="Enter your previous school name" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Previous School Address <span className="text-rose-400">*</span></label>
              <input type="text" name="previous_school_address" required value={formData.previous_school_address} onChange={handleChange} placeholder="City, Region" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Grade 10 Result (%)</label>
              <input type="number" name="grade_10_result" min="0" max="100" step="0.01" value={formData.grade_10_result} onChange={handleChange} placeholder="e.g. 78.5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Grade 12 Result (%)</label>
              <input type="number" name="grade_12_result" min="0" max="100" step="0.01" value={formData.grade_12_result} onChange={handleChange} placeholder="e.g. 82.0" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="vision-card rounded-3xl p-6">
          <SectionHeader
            title="Additional Information"
            icon={<svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
          />
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="has_disability"
              checked={formData.has_disability}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-[#0f1735] border-white/20 text-[#0075ff]"
            />
            <span className="text-sm text-slate-300">I have a disability that requires accommodation</span>
          </label>
          {formData.has_disability && (
            <div className="mt-4">
              <label className={labelCls}>Disability Description <span className="text-rose-400">*</span></label>
              <textarea
                name="disability_description"
                required={formData.has_disability}
                rows={3}
                value={formData.disability_description}
                onChange={handleChange}
                placeholder="Please describe your disability and accommodation needs..."
                className="w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium resize-none"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Create Application</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/applications')}
            className="px-6 py-3 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewApplicationPage;
