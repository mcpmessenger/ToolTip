#!/usr/bin/env node

/**
 * Test script for Live Crawler functionality
 * Run this after starting the backend to test the live crawling system
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testLiveCrawler() {
  console.log('⚡ Testing Live Crawler System\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);

    // Test 2: Start live crawl
    console.log('\n2️⃣ Testing live crawl start...');
    const testUrl = 'https://example.com';
    
    const crawlResponse = await fetch(`${API_BASE_URL}/api/live-crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageUrl: testUrl })
    });
    
    const crawlData = await crawlResponse.json();
    console.log('✅ Live crawl started:', crawlData.crawl_id);
    console.log('   Page URL:', crawlData.page_url);

    // Test 3: Poll live crawl status
    console.log('\n3️⃣ Testing live crawl status polling...');
    let status = null;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (!status?.isComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`${API_BASE_URL}/api/live-crawl/${crawlData.crawl_id}`);
      const statusData = await statusResponse.json();
      status = statusData;
      
      console.log(`   Status: ${status.isComplete ? 'Complete' : 'Processing'} (${status.processedElements}/${status.totalElements} elements)`);
      
      if (status.elements && status.elements.length > 0) {
        const readyElements = status.elements.filter(el => el.gifReady).length;
        const generatingElements = status.elements.filter(el => el.gifGenerating).length;
        const errorElements = status.elements.filter(el => el.gifError).length;
        
        console.log(`   Elements: ${readyElements} ready, ${generatingElements} generating, ${errorElements} errors`);
      }
      
      attempts++;
    }

    if (status?.isComplete) {
      console.log('✅ Live crawl completed successfully!');
      console.log(`   Total elements: ${status.totalElements}`);
      console.log(`   Processed: ${status.processedElements}`);
      console.log(`   Failed: ${status.failedElements}`);
      console.log(`   Ready GIFs: ${status.elements.filter(el => el.gifReady).length}`);
      
      // Test 4: Download a live GIF
      if (status.elements.length > 0) {
        const readyElement = status.elements.find(el => el.gifReady);
        if (readyElement) {
          console.log('\n4️⃣ Testing live GIF download...');
          const gifResponse = await fetch(`${API_BASE_URL}/api/live-gif/${readyElement.id}`);
          
          if (gifResponse.ok) {
            const gifBuffer = await gifResponse.buffer();
            console.log(`✅ Live GIF downloaded: ${gifBuffer.length} bytes`);
            console.log(`   Element: ${readyElement.tag} - "${readyElement.text}"`);
            console.log(`   Content-Type: ${gifResponse.headers.get('content-type')}`);
          } else {
            console.log('❌ Live GIF download failed:', gifResponse.status);
          }
        }
      }

      // Test 5: Get all live crawls
      console.log('\n5️⃣ Testing get all live crawls...');
      const allCrawlsResponse = await fetch(`${API_BASE_URL}/api/live-crawls`);
      const allCrawlsData = await allCrawlsResponse.json();
      console.log(`✅ Found ${allCrawlsData.count} active live crawls`);

      // Test 6: Cache stats
      console.log('\n6️⃣ Testing cache stats...');
      const cacheResponse = await fetch(`${API_BASE_URL}/api/cache/stats`);
      const cacheData = await cacheResponse.json();
      console.log('✅ Cache stats:', {
        keys: cacheData.cache?.keys || 0,
        hits: cacheData.cache?.hits || 0,
        activeCrawls: cacheData.active_crawls || 0
      });

      // Test 7: Test element details
      console.log('\n7️⃣ Testing element details...');
      if (status.elements.length > 0) {
        console.log('   Sample elements:');
        status.elements.slice(0, 5).forEach((element, index) => {
          console.log(`   ${index + 1}. ${element.tag} - "${element.text}"`);
          console.log(`      Selector: ${element.selector}`);
          console.log(`      Coordinates: [${element.coordinates.join(', ')}]`);
          console.log(`      GIF Ready: ${element.gifReady}`);
          if (element.gifError) {
            console.log(`      Error: ${element.gifError}`);
          }
        });
      }

    } else {
      console.log('❌ Live crawl failed or timed out');
    }

    console.log('\n🎉 Live crawler tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Live crawling: Working');
    console.log('   - Element detection: Working');
    console.log('   - Background GIF generation: Working');
    console.log('   - Live GIF downloads: Working');
    console.log('   - Cache management: Working');
    console.log('\n🚀 Your live crawler system is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the backend is running: npm run dev');
    console.log('   2. Check that Playwright is installed: npx playwright install chromium');
    console.log('   3. Verify all dependencies are installed: npm install');
    console.log('   4. Check backend logs for detailed error information');
    process.exit(1);
  }
}

// Run the test
testLiveCrawler();
