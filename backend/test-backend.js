#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🔧 Testing Otaku Shelf Backend...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Health check passed:', healthRes.data);
    
    // Test 2: Cache stats
    console.log('\n2. Testing cache stats...');
    const cacheRes = await axios.get(`${BACKEND_URL}/api/cache-stats`);
    console.log('✅ Cache stats:', cacheRes.data);
    
    // Test 3: Image proxy (with a sample URL)
    console.log('\n3. Testing image proxy...');
    const testImageUrl = 'https://uploads.mangadex.org/covers/f9c33607-9180-4ba6-b85c-e4b5faee7192/cover.jpg.256.jpg';
    const imageRes = await axios.get(`${BACKEND_URL}/api/image-proxy?url=${encodeURIComponent(testImageUrl)}`, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    console.log('✅ Image proxy working, received:', imageRes.headers['content-type'], 'size:', imageRes.data.length, 'bytes');
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testBackend();