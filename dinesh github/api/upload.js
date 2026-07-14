import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'POST') {
      const { fileName, fileBase64, contentType } = req.body;
      const buffer = Buffer.from(fileBase64, 'base64');
      
      const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('student_photos')
        .upload(uniqueFileName, buffer, { contentType, upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('student_photos')
        .getPublicUrl(uniqueFileName);
        
      return res.status(200).json({ url: urlData.publicUrl });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
