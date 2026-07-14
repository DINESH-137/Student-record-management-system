import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    course: '',
    year: 1,
    section: '',
    blood_group: '',
    parent_name: '',
    parent_phone: '',
    admission_date: new Date().toISOString().split('T')[0],
    photo_url: ''
  });

  useEffect(() => {
    if (isEdit && session?.access_token) {
      fetch(`/api/students?id=${id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setInitialLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load student data');
        setInitialLoading(false);
      });
    }
  }, [id, isEdit, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64,
            contentType: file.type,
          }),
        });
        const { url } = await res.json();
        setFormData(prev => ({ ...prev, photo_url: url }));
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Failed to upload photo');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...formData, id } : formData;

      const res = await fetch('/api/students', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save student');
      }

      navigate('/students');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center overflow-hidden relative group">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Upload Photo
              </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID *</label>
                <input required type="text" name="student_id" value={formData.student_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Academic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
              <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
              <input required type="text" name="course" value={formData.course} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input type="number" min="1" max="6" name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
              <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Date</label>
              <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Parent/Guardian Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent/Guardian Name</label>
              <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone Number</label>
              <input type="text" name="parent_phone" value={formData.parent_phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Link to="/students" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
