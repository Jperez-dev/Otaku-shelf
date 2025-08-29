# CORS Fix for MangaDex API

## ❌ The Problem
Your Vercel-deployed app was getting CORS errors when trying to access the MangaDx API:
```
Access to XMLHttpRequest at 'https://api.mangadx.org/...' from origin 'https://otaku-shelf.vercel.app' has been blocked by CORS policy
```

## ✅ The Solution
I've implemented a **Vercel API proxy** that routes your API requests through your own domain to bypass CORS restrictions.

### How It Works

#### 1. **Development vs Production**
- **Development**: Direct API calls to `https://api.mangadx.org`
- **Production**: Proxy through `/api/mangadx/...`

#### 2. **Proxy Route** (`api/mangadx/[...path].js`)
```javascript
// Your app makes a request to: /api/mangadx/manga/123
// Proxy forwards to: https://api.mangadx.org/manga/123
// Returns response with proper CORS headers
```

#### 3. **Automatic Environment Detection**
```javascript
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment 
  ? "https://api.mangadx.org"  // Direct in dev
  : "/api/mangadx";            // Proxy in production
```

## 📁 Files Modified

### ✅ `src/utils/axiosConfig.js`
- Environment-based API URL switching
- Better error handling and logging
- Increased timeout for proxy requests

### ✅ `api/mangadx/[...path].js` (New)
- Vercel serverless function
- Proxies all MangaDx API requests
- Adds proper CORS headers

### ✅ `vercel.json`
- API route configuration
- Timeout settings for proxy function

## 🚀 Deployment Steps

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix CORS with API proxy"
   git push
   ```

2. **Vercel will auto-redeploy** (if connected to GitHub)

3. **Test your app** - API calls should now work!

## 🧪 Testing Locally

### Development Mode
```bash
npm run dev
# Uses direct API calls (no proxy needed)
```

### Production Preview
```bash
npm run build
npm run preview
# Simulates production but without serverless functions
```

## 🔧 How Requests Work Now

### Before (CORS Error)
```
Your App → api.mangadx.org ❌ CORS blocked
```

### After (Working)
```
Your App → /api/mangadx/... → Vercel Function → api.mangadx.org ✅
```

## 📊 Benefits

- ✅ **No CORS errors**
- ✅ **Works in both dev and production**
- ✅ **Better error handling**
- ✅ **Request logging in development**
- ✅ **Automatic environment detection**

Your app should now work perfectly on Vercel! 🎉