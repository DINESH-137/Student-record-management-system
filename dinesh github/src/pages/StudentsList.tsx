import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Download, Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Papa from 'papaparse';

export default function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const { session } = useAuth();
  const limit = 10;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(department && { department })
      });

      const res = await fetch(`/api/students?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      setStudents(data.data || []);
      setTotalCount(data.count || 0);

      // Fetch unique departments for filter dropdown if not already fetched
      if (departments.length === 0) {
        const deptRes = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const deptData = await deptRes.json();
        setDepartments(deptData.chartData?.map((d: any) => d.name) || []);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchStudents();
    }
  }, [page, search, department, session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    
    try {
      const res = await fetch('/api/students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error('Failed to delete student', err);
    }
  };

  const exportToCSV = async () => {
    try {
      const res = await fetch(`/api/students?all=true`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const { data } = await res.json();
      
      const csv = Papa.unparse(data.map((s: any) => ({
        'Student ID': s.student_id,
        'Full Name': s.full_name,
        'Email': s.email,
        'Phone': s.phone,
        'Department': s.department,
        'Course': s.course,
        'Year': s.year,
        'Admission Date': s.admission_date
      })));

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800 transition-colors" title="Print List">
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={exportToCSV} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800 transition-colors" title="Export CSV">
            <Download className="w-5 h-5" />
          </button>
          <Link to="/students/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 print:border-none print:shadow-none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department / Course</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></td></tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 overflow-hidden shrink-0">
                          {student.photo_url ? <img src={student.photo_url} alt="" className="w-full h-full object-cover" /> : student.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white">{student.department}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{student.course} • Year {student.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white">{student.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 print:hidden">
                      <Link to={`/students/${student.id}`} className="inline-flex p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/students/${student.id}/edit`} className="inline-flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(student.id)} className="inline-flex p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between print:hidden">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
