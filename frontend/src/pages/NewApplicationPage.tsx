import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApi, referenceApi } from '../services/api';

const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);
  const [qualificationLevels, setQualificationLevels] = useState<any[]>([]);
  const [admissionPeriods, setAdmissionPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      loadOccupations(parseInt(formData.department_id));
    }
  }, [formData.department_id]);

  const loadReferenceData = async () => {
    try {
      const [depts, quals, periods] = await Promise.all([
        referenceApi.getDepartments(),
        referenceApi.getQualificationLevels(),
        referenceApi.getAdmissionPeriods(),
      ]);
      setDepartments(depts.departments);
      setQualificationLevels(quals.qualification_levels || [{ id: 1, name: 'Level III' }]);
      setAdmissionPeriods(periods.admission_periods);
    } catch (err) {
      setError('Failed to load reference data');
    } finally {
      setLoading(false);
    }
  };

  const loadOccupations = async (departmentId: number) => {
    try {
      const data = await referenceApi.getOccupations(departmentId);
      setOccupations(data.occupations);
    } catch (err) {
      console.error('Failed to load occupations:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await applicationApi.createApplication(formData);
      navigate(`/dashboard/applications/${response.application.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create application');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">New Application</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Admission Period Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Admission Period</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Admission Period *</label>
              <select
                name="admission_period_id"
                required
                value={formData.admission_period_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose an admission period</option>
                {admissionPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name} - {period.academic_year} ({period.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Program Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Program Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department *</label>
              <select
                name="department_id"
                required
                value={formData.department_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation *</label>
              <select
                name="occupation_id"
                required
                value={formData.occupation_id}
                onChange={handleChange}
                disabled={!formData.department_id}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
              >
                <option value="">Select Occupation</option>
                {occupations.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification Level *</label>
              <select
                name="qualification_level_id"
                required
                value={formData.qualification_level_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Level</option>
                {qualificationLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Educational Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Previous School Name *</label>
              <input
                type="text"
                name="previous_school_name"
                required
                value={formData.previous_school_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Previous School Address *</label>
              <input
                type="text"
                name="previous_school_address"
                required
                value={formData.previous_school_address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade 10 Result (%)</label>
              <input
                type="number"
                name="grade_10_result"
                min="0"
                max="100"
                step="0.01"
                value={formData.grade_10_result}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade 12 Result (%)</label>
              <input
                type="number"
                name="grade_12_result"
                min="0"
                max="100"
                step="0.01"
                value={formData.grade_12_result}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Disability Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_disability"
                name="has_disability"
                checked={formData.has_disability}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="has_disability" className="ml-2 block text-sm text-gray-900">
                I have a disability
              </label>
            </div>

            {formData.has_disability && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Disability Description *</label>
                <textarea
                  name="disability_description"
                  required={formData.has_disability}
                  rows={3}
                  value={formData.disability_description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Please describe your disability"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Application
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/applications')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewApplicationPage;
