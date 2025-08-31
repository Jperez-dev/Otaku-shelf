# Otaku Shelf Backend

A Node.js/Express backend service for the Otaku Shelf manga application that provides:

## Features

- **Image Proxy Service**: Bypasses hotlink restrictions from MangaDX image servers
- **Image Optimization**: Automatically resizes and compresses images using Sharp
- **Intelligent Caching**: 24-hour cache with automatic cleanup
- **CORS Handling**: Proper cross-origin resource sharing for frontend integration
- **MangaDX API Proxy**: Centralized API access with error handling

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env file as needed
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Production Server**:
   ```bash
   npm start
   ```

## API Endpoints

### Image Proxy
```
GET /api/image-proxy?url=<encoded_image_url>
```
Fetches and serves manga cover images with:
- Hotlink protection bypass
- Image optimization (resize to 500x750, 85% quality)
- 24-hour caching
- Proper CORS headers

### MangaDX API Proxy
```
GET /api/manga/<endpoint>
```
Proxies requests to MangaDX API with proper headers.

### Utility Endpoints
- `GET /health` - Health check
- `GET /api/cache-stats` - Cache statistics
- `POST /api/cache-clear` - Clear image cache

## Usage in Frontend

Update your frontend to use the image proxy:

```javascript
// Instead of direct MangaDX URLs
const imageUrl = `http://localhost:3001/api/image-proxy?url=${encodeURIComponent(mangaImageUrl)}`;
```

## Performance

- **Image Caching**: Reduces repeated downloads
- **Image Optimization**: Smaller file sizes, faster loading
- **Compression**: JPEG optimization with progressive loading
- **Memory Management**: Automatic cache cleanup

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Configure `FRONTEND_URL` to your production domain
3. Use a process manager like PM2
4. Set up reverse proxy with Nginx (recommended)

## Error Handling

The service handles:
- Network timeouts
- 404 image not found
- 403 hotlink protection
- Invalid image formats
- Server errors with appropriate HTTP status codes