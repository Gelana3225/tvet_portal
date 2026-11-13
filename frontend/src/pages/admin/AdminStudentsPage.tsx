import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, referenceApi } from '../../services/api';
import StudentIDCardModal, { StudentIDData } from '../../components/StudentIDCardModal';

const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentIDData[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<StudentIDData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, deptsRes] = await Promise.all([
        adminApi.getStudents(),
        referenceApi.getDepartments(),
      ]);
      setStudents(studentsRes.students || []);
      setDepartments(deptsRes.departments || []);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.message || 'Failed to fetch student directory.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      departmentFilter === 'all' || s.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Admitted Students & ID Registry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {students.length} Matriculated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Official records of all admitted students with generated institutional matriculation IDs
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-[#0075ff] hover:bg-[#0060df] rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
        >
          <span>Review Applications to Generate IDs</span>
          <span>→</span>
        </Link>
      </div>

      {/* Explanatory Banner: How IDs are generated */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0075ff]/15 via-emerald-500/10 to-transparent border border-white/10 flex items-start space-x-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#0075ff]/20 text-[#0075ff] flex items-center justify-center font-bold text-sm shrink-0">
          🎓
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            How Student IDs are Generated in this System
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Student IDs follow the official college format <strong>HTC-[YEAR]-[SEQUENCE]</strong> (e.g. <code>HTC-2026-0001</code>). To generate an ID for a candidate, go to <Link to="/admin/applications" className="text-[#00d8d6] hover:underline font-semibold">Applications</Link>, review the candidate's certificates, and click <strong>"Approve & Matriculate"</strong>. The system automatically creates the official student record and generates their unique ID.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="vision-card p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID number (e.g. HTC-2026-0001), or email..."
            className="w-full px-4 py-2.5 vision-input rounded-xl text-xs placeholder:text-slate-500"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#0f1735] border border-white/10 text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="vision-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#0075ff] border-t-transparent rounded-full animate-spin" />
            <span>Loading admitted students directory...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <div className="text-3xl">🎓</div>
            <p className="font-semibold text-white">No students found matching your filter.</p>
            <p className="text-[11px] text-slate-500">
              When you approve candidate applications, their matriculation records and Student IDs will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-white/[0.01]">
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Candidate Full Name</th>
                  <th className="py-3.5 px-4">Department & Trade</th>
                  <th className="py-3.5 px-4">Qualification Level</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">ID Card Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-[#00d8d6] bg-[#0075ff]/15 px-2.5 py-1 rounded-lg border border-[#0075ff]/30 text-xs">
                        {s.student_id}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{s.full_name}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-white font-medium">{s.occupation || '-'}</div>
                      <div className="text-[11px] text-slate-500">{s.department || '-'}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-slate-300 font-medium">
                        {s.qualification_level || 'Level IV'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-400">
                      {s.academic_year || '2026/2027'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                        {s.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForCard(s)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white font-bold transition text-xs border border-emerald-500/30 cursor-pointer shadow-sm"
                      >
                        <span>🪪</span>
                        <span>Generate ID Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Student ID Card Modal & Printable Badge */}
      {selectedStudentForCard && (
        <StudentIDCardModal
          student={selectedStudentForCard}
          onClose={() => setSelectedStudentForCard(null)}
        />
      )}
    </div>
  );
};

export default AdminStudentsPage;
