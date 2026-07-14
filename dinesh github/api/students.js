import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      const { id, search, department, page = 1, limit = 10, all } = req.query;
      
      if (id) {
        const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      
      if (all === 'true') {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ data });
      }

      let query = supabase.from('students').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (department) {
        query = query.eq('department', department);
      }

      const from = (page - 1) * limit;
      const to = from + parseInt(limit) - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return res.status(200).json({ data, count, page: parseInt(page), limit: parseInt(limit) });
    }

    if (req.method === 'POST') {
      const studentData = req.body;
      const { data, error } = await supabase
        .from('students')
        .insert({ ...studentData, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...studentData } = req.body;
      const { data, error } = await supabase
        .from('students')
        .update({ ...studentData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
