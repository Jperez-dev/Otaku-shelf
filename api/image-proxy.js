// Vercel serverless function to proxy images and bypass hotlink restrictions
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
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate the URL is from MangaDX
    if (!url.includes('uploads.mangadx.org') && !url.includes('uploads.mangadex.org')) {
      return res.status(400).json({ error: 'Only MangaDX images are allowed' });
    }

    // Fetch the image with proper headers to bypass hotlink restrictions
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OtakuShelf/1.0.0',
        'Referer': 'https://mangadex.org/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Image not found' });
      }
      if (response.status === 403) {
        return res.status(403).json({ error: 'Access forbidden' });
      }
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Set appropriate headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Content-Length', buffer.length);

    // Send the image
    return res.send(buffer);

  } catch (error) {
    console.error('Image proxy error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(502).json({ error: 'Unable to fetch image from source' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}