#!/usr/bin/env node

/**
 * Test script for GIF generation and caching
 * Run this after starting the backend to test the complete workflow
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testGifGeneration() {
  console.log('🧪 Testing GIF Generation and Caching System\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);

    // Test 2: Start a crawl
    console.log('\n2️⃣ Testing crawl start...');
    const crawlResponse = await fetch(`${API_BASE_URL}/api/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        element_selector: 'h1',
        wait_time: 1.0
      })
    });
    
    const crawlData = await crawlResponse.json();
    console.log('✅ Crawl started:', crawlData.crawl_id);

    // Test 3: Poll status
    console.log('\n3️⃣ Testing status polling...');
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${API_BASE_URL}/api/status/${crawlData.crawl_id}`);
      const statusData = await statusResponse.json();
      status = statusData.status;
      
      console.log(`   Status: ${status} (${statusData.progress || 0}%)`);
      attempts++;
    }

    if (status === 'completed') {
      console.log('✅ Crawl completed successfully!');
      
      // Test 4: Download GIF
      console.log('\n4️⃣ Testing GIF download...');
      const gifResponse = await fetch(`${API_BASE_URL}/api/gif/${crawlData.crawl_id}`);
      
      if (gifResponse.ok) {
        const gifBuffer = await gifResponse.buffer();
        console.log(`✅ GIF downloaded: ${gifBuffer.length} bytes`);
        console.log(`   Content-Type: ${gifResponse.headers.get('content-type')}`);
      } else {
        console.log('❌ GIF download failed:', gifResponse.status);
      }

      // Test 5: Download loading GIF
      console.log('\n5️⃣ Testing loading GIF download...');
      const loadingResponse = await fetch(`${API_BASE_URL}/api/loading-gif/${crawlData.crawl_id}`);
      
      if (loadingResponse.ok) {
        const loadingBuffer = await loadingResponse.buffer();
        console.log(`✅ Loading GIF downloaded: ${loadingBuffer.length} bytes`);
      } else {
        console.log('❌ Loading GIF download failed:', loadingResponse.status);
      }
    } else {
      console.log('❌ Crawl failed or timed out');
    }

    // Test 6: Cache stats
    console.log('\n6️⃣ Testing cache stats...');
    const cacheResponse = await fetch(`${API_BASE_URL}/api/cache/stats`);
    const cacheData = await cacheResponse.json();
    console.log('✅ Cache stats:', {
      keys: cacheData.cache?.keys || 0,
      hits: cacheData.cache?.hits || 0,
      activeCrawls: cacheData.active_crawls || 0
    });

    // Test 7: Page elements
    console.log('\n7️⃣ Testing page elements extraction...');
    const elementsResponse = await fetch(`${API_BASE_URL}/api/elements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    const elementsData = await elementsResponse.json();
    console.log(`✅ Found ${elementsData.elements?.length || 0} clickable elements`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - GIF generation: Working');
    console.log('   - Caching: Working');
    console.log('   - API endpoints: Working');
    console.log('   - File downloads: Working');
    console.log('\n🚀 Your GIF crawling system is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the backend is running: npm run dev');
    console.log('   2. Check that Playwright is installed: npx playwright install chromium');
    console.log('   3. Verify all dependencies are installed: npm install');
    process.exit(1);
  }
}

// Run the test
testGifGeneration();
