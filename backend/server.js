const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache for 24 hours (86400 seconds)
const imageCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Image proxy endpoint
app.get('/api/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Check if image is cached
    const cachedImage = imageCache.get(url);
    if (cachedImage) {
      res.set({
        'Content-Type': cachedImage.contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      return res.send(cachedImage.buffer);
    }

    // Fetch image from MangaDX with proper headers
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'OtakuShelf/1.0.0',
        'Referer': 'https://mangadex.org/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    });

    let imageBuffer = Buffer.from(response.data);
    let contentType = response.headers['content-type'] || 'image/jpeg';

    // Optimize image using Sharp
    if (contentType.includes('image')) {
      try {
        imageBuffer = await sharp(imageBuffer)
          .resize(500, 750, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toBuffer();
        contentType = 'image/jpeg';
      } catch (sharpError) {
        console.log('Sharp optimization failed, using original image:', sharpError.message);
      }
    }

    // Cache the processed image
    imageCache.set(url, {
      buffer: imageBuffer,
      contentType: contentType
    });

    // Send response
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Content-Length': imageBuffer.length
    });

    res.send(imageBuffer);

  } catch (error) {
    console.error('Image proxy error:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(502).json({ error: 'Unable to fetch image from source' });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Access forbidden - possible hotlink protection' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// MangaDX API proxy endpoint
app.get('/api/manga/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = `https://api.mangadex.org/${path}${queryString ? '?' + queryString : ''}`;

    const response = await axios({
      method: 'GET',
      url: fullUrl,
      headers: {
        'User-Agent': 'OtakuShelf/1.0.0',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    res.json(response.data);
  } catch (error) {
    console.error('MangaDX API proxy error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ error: 'Failed to fetch from MangaDX API' });
  }
});

// Cache statistics endpoint (for debugging)
app.get('/api/cache-stats', (req, res) => {
  const stats = imageCache.getStats();
  res.json({
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
    ksize: stats.ksize,
    vsize: stats.vsize
  });
});

// Clear cache endpoint (for admin use)
app.post('/api/cache-clear', (req, res) => {
  imageCache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Otaku Shelf Backend running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🖼️  Image proxy: http://localhost:${PORT}/api/image-proxy?url=<image_url>`);
  console.log(`📚 MangaDX proxy: http://localhost:${PORT}/api/manga/<endpoint>`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});