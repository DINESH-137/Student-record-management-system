import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Printer, Mail, Phone, MapPin, Calendar, Users, Droplet, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function StudentView() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      fetch(`/api/students?id=${id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(data => {
        setStudent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load student details');
        setLoading(false);
      });
    }
  }, [id, session]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !student) return <div className="text-center text-red-600 p-8">{error || 'Student not found'}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/students" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <Link to={`/students/${student.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border-none print:shadow-none">
        {/* Header Profile Section */}
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-indigo-500 to-purple-600 print:hidden"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex justify-center sm:justify-start -mt-16 sm:-mt-20 mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {student.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{student.full_name}</h2>
            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mt-1">ID: {student.student_id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Academic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Academic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={BookOpen} label="Department" value={student.department} />
                <InfoItem icon={BookOpen} label="Course" value={student.course} />
                <InfoItem icon={Calendar} label="Year" value={`Year ${student.year}`} />
                <InfoItem icon={Users} label="Section" value={student.section || 'N/A'} />
                <InfoItem icon={Calendar} label="Admission Date" value={student.admission_date ? format(new Date(student.admission_date), 'PP') : 'N/A'} />
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email" value={student.email} />
                <InfoItem icon={Phone} label="Phone" value={student.phone || 'N/A'} />
                <InfoItem icon={Calendar} label="Date of Birth" value={student.dob ? format(new Date(student.dob), 'PP') : 'N/A'} />
                <InfoItem icon={Users} label="Gender" value={student.gender || 'N/A'} />
                <InfoItem icon={Droplet} label="Blood Group" value={student.blood_group || 'N/A'} />
                <div className="sm:col-span-2">
                  <InfoItem icon={MapPin} label="Address" value={student.address || 'N/A'} />
                </div>
              </div>
            </div>

            {/* Parent Info */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Users} label="Parent Name" value={student.parent_name || 'N/A'} />
                <InfoItem icon={Phone} label="Parent Phone" value={student.parent_phone || 'N/A'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}
