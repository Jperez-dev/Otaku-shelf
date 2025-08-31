// Vercel serverless function to proxy MangaDX statistics API requests
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
    // Build the query string from request parameters
    // Handle array parameters like manga[]=id1&manga[]=id2
    const queryString = new URLSearchParams(req.query).toString();
    
    // Log the request for debugging
    console.log('Statistics API request query:', req.query);
    console.log('Statistics API query string:', queryString);
    
    const mangaDxUrl = `https://api.mangadex.org/statistics/manga${queryString ? '?' + queryString : ''}`;

    console.log('Proxying statistics request to:', mangaDxUrl);

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
      console.error('MangaDX Statistics API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('MangaDX Statistics API error body:', errorText);
      return res.status(response.status).json({ 
        error: `MangaDX Statistics API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Statistics API response received, data keys:', Object.keys(data));
    
    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes

    return res.status(200).json(data);

  } catch (error) {
    console.error('Statistics API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}