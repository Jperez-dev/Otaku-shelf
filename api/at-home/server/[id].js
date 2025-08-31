// Vercel serverless function to proxy MangaDX at-home API requests
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the server ID from the dynamic route
    const { id } = req.query;
    
    // Build query string from remaining parameters
    const queryParams = { ...req.query };
    delete queryParams.id; // Remove id from query params since it's in the path
    const queryString = new URLSearchParams(queryParams).toString();
    
    const mangaDxUrl = `https://api.mangadex.org/at-home/server/${id}${queryString ? '?' + queryString : ''}`;

    console.log('Proxying at-home request to:', mangaDxUrl);

    // Fetch from MangaDX API
    const response = await fetch(mangaDxUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'OtakuShelf/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('MangaDX At-Home API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `MangaDX At-Home API error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return res.status(200).json(data);

  } catch (error) {
    console.error('At-Home API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}