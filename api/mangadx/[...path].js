// Vercel API route to proxy MangaDex requests
export default async function handler(req, res) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Build the full MangaDex API URL
  const mangadexUrl = `https://api.mangadex.org/${pathString}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
  
  try {
    const response = await fetch(mangadexUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Otaku-Shelf/1.0.0',
      },
    });

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from MangaDex API' });
  }
}