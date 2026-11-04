import React, { useState, useEffect } from 'react';
import { profileApi } from '../services/api';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          first_name: data.profile.first_name,
          father_name: data.profile.father_name,
          grandfather_name: data.profile.grandfather_name,
          gender: data.profile.gender,
          date_of_birth: data.profile.date_of_birth,
          nationality: data.profile.nationality,
          phone: data.profile.phone,
          email: data.profile.email || '',
          region: data.profile.address.region,
          zone: data.profile.address.zone,
          woreda: data.profile.address.woreda,
          kebele: data.profile.address.kebele,
          house_number: data.profile.address.house_number || '',
          emergency_contact_name: data.profile.emergency_contact.name,
          emergency_contact_phone: data.profile.emergency_contact.phone,
          emergency_contact_relationship: data.profile.emergency_contact.relationship,
        });
      } else {
        setEditing(true);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!editing && profile) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Gender</label>
                <p className="font-medium capitalize">{profile.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date of Birth</label>
                <p className="font-medium">{profile.date_of_birth}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Nationality</label>
                <p className="font-medium">{profile.nationality}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{profile.phone}</p>
              </div>
              {profile.email && (
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{profile.email}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Region</label>
                <p className="font-medium">{profile.address.region}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Zone</label>
                <p className="font-medium">{profile.address.zone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Woreda</label>
                <p className="font-medium">{profile.address.woreda}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Kebele</label>
                <p className="font-medium">{profile.address.kebele}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{profile.emergency_contact.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{profile.emergency_contact.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Relationship</label>
                <p className="font-medium">{profile.emergency_contact.relationship}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {profile ? 'Edit Profile' : 'Create Your Profile'}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father Name *</label>
              <input
                type="text"
                name="father_name"
                required
                value={formData.father_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grandfather Name *</label>
              <input
                type="text"
                name="grandfather_name"
                required
                value={formData.grandfather_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality *</label>
              <input
                type="text"
                name="nationality"
                required
                value={formData.nationality}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Region *</label>
              <input
                type="text"
                name="region"
                required
                value={formData.region}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone *</label>
              <input
                type="text"
                name="zone"
                required
                value={formData.zone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Woreda *</label>
              <input
                type="text"
                name="woreda"
                required
                value={formData.woreda}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kebele *</label>
              <input
                type="text"
                name="kebele"
                required
                value={formData.kebele}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">House Number</label>
              <input
                type="text"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="emergency_contact_name"
                required
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                required
                placeholder="0911111111"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship *</label>
              <input
                type="text"
                name="emergency_contact_relationship"
                required
                placeholder="e.g., Mother, Father, Sibling"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {profile ? 'Update Profile' : 'Create Profile'}
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
