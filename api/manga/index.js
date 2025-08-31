// Vercel serverless function to proxy MangaDX manga API requests
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
    // Handle array parameters properly for MangaDX API
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        // Handle array parameters like authors[], includes[], etc.
        value.forEach(item => {
          params.append(key, item);
        });
      } else {
        params.append(key, value);
      }
    }
    
    const queryString = params.toString();
    const mangaDxUrl = `https://api.mangadex.org/manga${queryString ? '?' + queryString : ''}`;

    console.log('Manga API request query:', req.query);
    console.log('Manga API query string:', queryString);
    console.log('Proxying manga request to:', mangaDxUrl);

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
      const errorText = await response.text();
      console.error('MangaDX API error:', {
        status: response.status,
        statusText: response.statusText,
        url: mangaDxUrl,
        requestQuery: req.query,
        queryString: queryString,
        errorBody: errorText
      });
      return res.status(response.status).json({ 
        error: `MangaDX API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return res.status(200).json(data);

  } catch (error) {
    console.error('Manga API proxy error:', {
      error: error.message,
      stack: error.stack,
      requestQuery: req.query,
      url: req.url
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}