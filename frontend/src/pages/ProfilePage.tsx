import React, { useState, useEffect } from 'react';
import { profileApi } from '../services/api';

const inputCls = "w-full px-4 py-3 vision-input rounded-xl text-sm placeholder:text-slate-500 font-medium";
const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";
const sectionTitleCls = "text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2";

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    father_name: '',
    grandfather_name: '',
    gender: '',
    date_of_birth: '',
    nationality: 'Ethiopian',
    phone: '',
    email: '',
    region: '',
    zone: '',
    woreda: '',
    kebele: '',
    house_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          first_name: data.profile.first_name || '',
          father_name: data.profile.father_name || '',
          grandfather_name: data.profile.grandfather_name || '',
          gender: data.profile.gender || '',
          date_of_birth: data.profile.date_of_birth || '',
          nationality: data.profile.nationality || 'Ethiopian',
          phone: data.profile.phone || '',
          email: data.profile.email || '',
          region: data.profile.address?.region || '',
          zone: data.profile.address?.zone || '',
          woreda: data.profile.address?.woreda || '',
          kebele: data.profile.address?.kebele || '',
          house_number: data.profile.address?.house_number || '',
          emergency_contact_name: data.profile.emergency_contact?.name || '',
          emergency_contact_phone: data.profile.emergency_contact?.phone || '',
          emergency_contact_relationship: data.profile.emergency_contact?.relationship || '',
        });
      } else {
        setEditing(true);
      }
    } catch (err: any) {
      if (err.response?.status === 404) setEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (profile) {
        await profileApi.updateProfile(formData);
        setSuccess('Profile updated successfully!');
      } else {
        await profileApi.createProfile(formData);
        setSuccess('Profile created successfully!');
      }
      await loadProfile();
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  /* ── VIEW MODE ── */
  if (!editing && profile) {
    const infoRow = (label: string, value: string) => (
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
        <span className="text-sm font-semibold text-white mt-0.5 block">{value || '—'}</span>
      </div>
    );

    return (
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">My Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your personal information on file</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0075ff] hover:bg-[#0060df] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
            <span>✅</span><span>{success}</span>
          </div>
        )}

        {/* Avatar + Name card */}
        <div className="vision-card-glow rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent" />
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0075ff] via-[#102a71] to-[#7551ff] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30 shrink-0">
              {profile.first_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{profile.full_name || `${profile.first_name} ${profile.father_name}`}</h3>
              <p className="text-sm text-slate-400 mt-0.5 capitalize">{profile.gender} • {profile.nationality}</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="vision-card rounded-3xl p-6">
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-[#0075ff]/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
            <span>Personal Information</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {infoRow('First Name', profile.first_name)}
            {infoRow('Father Name', profile.father_name)}
            {infoRow('Grandfather Name', profile.grandfather_name)}
            {infoRow('Gender', profile.gender)}
            {infoRow('Date of Birth', profile.date_of_birth)}
            {infoRow('Nationality', profile.nationality)}
            {infoRow('Phone', profile.phone)}
            {profile.email && infoRow('Email', profile.email)}
          </div>
        </div>

        {/* Address */}
        <div className="vision-card rounded-3xl p-6">
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-[#00d8d6]/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#00d8d6]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            </div>
            <span>Address</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {infoRow('Region', profile.address?.region)}
            {infoRow('Zone', profile.address?.zone)}
            {infoRow('Woreda', profile.address?.woreda)}
            {infoRow('Kebele', profile.address?.kebele)}
            {profile.address?.house_number && infoRow('House Number', profile.address.house_number)}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="vision-card rounded-3xl p-6">
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            </div>
            <span>Emergency Contact</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {infoRow('Name', profile.emergency_contact?.name)}
            {infoRow('Phone', profile.emergency_contact?.phone)}
            {infoRow('Relationship', profile.emergency_contact?.relationship)}
          </div>
        </div>
      </div>
    );
  }

  /* ── EDIT / CREATE MODE ── */
  const Field = ({ label, name, type = 'text', required = true, placeholder = '' }: {
    label: string; name: string; type?: string; required?: boolean; placeholder?: string;
  }) => (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={(formData as any)[name]}
        onChange={handleChange}
        className={inputCls}
      />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">{profile ? 'Edit Profile' : 'Complete Your Profile'}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {profile ? 'Update your personal details' : 'Fill in your information to get started with your application'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="vision-card rounded-3xl p-6">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0075ff] to-transparent rounded-t-3xl" />
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-[#0075ff]/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#0075ff]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
            <span>Personal Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="First Name" name="first_name" />
            <Field label="Father Name" name="father_name" />
            <Field label="Grandfather Name" name="grandfather_name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelCls}>Gender <span className="text-rose-400">*</span></label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className={inputCls + " bg-[#0f1735] border border-white/10"}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <Field label="Date of Birth" name="date_of_birth" type="date" />
            <Field label="Nationality" name="nationality" />
            <Field label="Phone Number" name="phone" type="tel" placeholder="0912345678" />
            <Field label="Email (Optional)" name="email" type="email" required={false} placeholder="your@email.com" />
          </div>
        </div>

        {/* Address */}
        <div className="vision-card rounded-3xl p-6">
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-[#00d8d6]/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#00d8d6]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            </div>
            <span>Address</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Region" name="region" />
            <Field label="Zone" name="zone" />
            <Field label="Woreda" name="woreda" />
            <Field label="Kebele" name="kebele" />
            <Field label="House Number" name="house_number" required={false} />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="vision-card rounded-3xl p-6">
          <div className={sectionTitleCls}>
            <div className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            </div>
            <span>Emergency Contact</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Contact Name" name="emergency_contact_name" />
            <Field label="Contact Phone" name="emergency_contact_phone" type="tel" placeholder="0911111111" />
            <Field label="Relationship" name="emergency_contact_relationship" placeholder="e.g., Mother, Father" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-[#0075ff] hover:bg-[#0060df] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{profile ? 'Update Profile' : 'Create Profile'}</span>
            )}
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-3 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
