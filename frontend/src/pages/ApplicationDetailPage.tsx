import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      const data = await applicationApi.getApplication(parseInt(id!));
      setApplication(data.application);
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await applicationApi.uploadDocument(parseInt(id!), documentType, file);
      setSuccess('Document uploaded successfully');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit this application? You will not be able to edit it after submission.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await applicationApi.submitApplication(parseInt(id!));
      setSuccess('Application submitted successfully!');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await applicationApi.deleteDocument(parseInt(id!), documentId);
      setSuccess('Document deleted successfully');
      await loadApplication();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return <div className="p-6">Loading application...</div>;
  }

  if (!application) {
    return <div className="p-6">Application not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      correction_required: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Application Details</h2>
          <p className="text-gray-600">
            Application #{application.application_number || `APP-${application.id}`}
          </p>
        </div>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
          {application.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

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

      <div className="space-y-6">
        {/* Program Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Program Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Admission Period</label>
              <p className="font-medium">{application.admission_period.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Academic Year</label>
              <p className="font-medium">{application.admission_period.academic_year}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Department</label>
              <p className="font-medium">{application.department.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Occupation</label>
              <p className="font-medium">{application.occupation.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Qualification Level</label>
              <p className="font-medium">{application.qualification_level.name}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
          
          {application.can_edit && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                Please upload the following required documents:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                <li>Academic Transcript</li>
                <li>Certificate (Grade 10 or 12)</li>
                <li>ID Card</li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {['transcript', 'certificate', 'id_card', 'birth_certificate', 'photo'].map((docType) => {
              const doc = application.documents?.find((d: any) => d.document_type === docType);
              return (
                <div key={docType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium capitalize">{docType.replace('_', ' ')}</h4>
                      {doc ? (
                        <p className="text-sm text-gray-600">
                          {doc.file_name} ({(doc.file_size / 1024).toFixed(2)} KB)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Not uploaded</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {doc ? (
                        <>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            View
                          </a>
                          {application.can_edit && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      ) : application.can_edit ? (
                        <label className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                          Upload
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, docType)}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {application.can_edit && (
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Application
            </button>
            <button
              onClick={() => navigate('/dashboard/applications')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Back to Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
