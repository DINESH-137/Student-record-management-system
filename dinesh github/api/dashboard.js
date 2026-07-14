import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      // Get total students
      const { count: totalStudents, error: err1 } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      // Get unique departments
      const { data: deptData, error: err2 } = await supabase
        .from('students')
        .select('department');
      const departments = new Set(deptData?.map(d => d.department).filter(Boolean));
      
      // Get unique courses
      const { data: courseData, error: err3 } = await supabase
        .from('students')
        .select('course');
      const courses = new Set(courseData?.map(c => c.course).filter(Boolean));

      // Get recent students
      const { data: recentStudents, error: err4 } = await supabase
        .from('students')
        .select('id, student_id, full_name, department, course, created_at, photo_url')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get department distribution for chart
      const deptCounts = {};
      deptData?.forEach(d => {
        if (d.department) {
          deptCounts[d.department] = (deptCounts[d.department] || 0) + 1;
        }
      });
      const chartData = Object.keys(deptCounts).map(name => ({
        name,
        value: deptCounts[name]
      }));

      return res.status(200).json({
        totalStudents: totalStudents || 0,
        totalDepartments: departments.size,
        totalCourses: courses.size,
        recentStudents: recentStudents || [],
        chartData
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
