// Vercel serverless function to proxy MangaDX manga API requests with ID parameter
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
    // Get the manga ID from the dynamic route
    const { id } = req.query;
    
    // Build query string from remaining parameters
    const queryParams = { ...req.query };
    delete queryParams.id; // Remove id from query params since it's in the path
    
    const queryString = new URLSearchParams();
    
    // Handle array parameters properly for MangaDX API
    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        // Handle array parameters like includes[]
        value.forEach(item => {
          queryString.append(key, item);
        });
      } else {
        queryString.append(key, value);
      }
    }
    
    const queryStringStr = queryString.toString();
    
    const mangaDxUrl = `https://api.mangadex.org/manga/${id}${queryStringStr ? '?' + queryStringStr : ''}`;

    console.log('Manga API request query:', req.query);
    console.log('Manga API query string:', queryStringStr);
    console.log('Proxying manga detail request to:', mangaDxUrl);

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
        queryString: queryStringStr,
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
    console.error('Manga detail API proxy error:', {
      error: error.message,
      stack: error.stack,
      requestQuery: req.query,
      url: req.url,
      mangaId: req.query.id
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}