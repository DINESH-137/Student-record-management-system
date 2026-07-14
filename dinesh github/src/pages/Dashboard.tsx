import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) {
      fetchStats();
    }
  }, [session]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Departments', value: stats?.totalDepartments || 0, icon: GraduationCap, color: 'bg-indigo-500' },
    { title: 'Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'bg-emerald-500' },
    { title: 'Recent Enrolls', value: stats?.recentStudents?.length || 0, icon: Clock, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Students by Department</h2>
          <div className="h-64">
            {stats?.chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Students</h2>
            <Link to="/students" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Student</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 rounded-tr-lg">Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentStudents?.length > 0 ? (
                  stats.recentStudents.map((student: any) => (
                    <tr key={student.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 overflow-hidden">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            student.full_name.charAt(0)
                          )}
                        </div>
                        {student.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.student_id}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.department}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {format(new Date(student.created_at), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
