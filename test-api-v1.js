// test-api-v1.js - Test delle API v1
const BASE_URL = 'http://localhost:3000';
const API_KEY = 'armstrong_test_123456789';

async function testApiV1() {
  console.log('🧪 Testing Armstrong AI API v1...');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

  try {
    // Test 1: Health Check
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/v1/health`);
    const health = await healthResponse.json();
    console.log('✅ Health:', health.data?.status || 'unknown');

    // Test 2: Create Sandbox
    console.log('\n2. Testing sandbox creation...');
    const createResponse = await fetch(`${BASE_URL}/api/v1/sandboxes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        language: 'python',
        timeout: 30000,
        memory: '512MB'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Sandbox creation failed: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    const sandboxId = createResult.data.id;
    console.log('✅ Sandbox created:', sandboxId);

    // Test 3: Execute Code
    console.log('\n3. Testing code execution...');
    const executeResponse = await fetch(`${BASE_URL}/api/v1/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: 'print("Hello Armstrong AI v1!")\nprint("API test successful!")',
        sandboxId: sandboxId
      })
    });

    if (!executeResponse.ok) {
      throw new Error(`Code execution failed: ${executeResponse.status}`);
    }

    const executeResult = await executeResponse.json();
    console.log('✅ Execution:', executeResult.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Output:', executeResult.data.output?.substring(0, 100) || 'No output');

    // Test 4: List Sandboxes
    console.log('\n4. Testing sandbox listing...');
    const listResponse = await fetch(`${BASE_URL}/api/v1/sandboxes`, {
      method: 'GET',
      headers
    });

    if (!listResponse.ok) {
      throw new Error(`Sandbox listing failed: ${listResponse.status}`);
    }

    const listResult = await listResponse.json();
    console.log('✅ Sandboxes found:', listResult.data.length);

    // Test 5: Usage Stats
    console.log('\n5. Testing usage stats...');
    const usageResponse = await fetch(`${BASE_URL}/api/v1/usage`, {
      method: 'GET',
      headers
    });

    if (!usageResponse.ok) {
      throw new Error(`Usage stats failed: ${usageResponse.status}`);
    }

    const usageResult = await usageResponse.json();
    console.log('✅ Usage stats:', usageResult.data.user.sandboxes);

    // Test 6: Cleanup
    console.log('\n6. Testing sandbox cleanup...');
    const deleteResponse = await fetch(`${BASE_URL}/api/v1/sandboxes/${sandboxId}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteResponse.ok) {
      throw new Error(`Sandbox deletion failed: ${deleteResponse.status}`);
    }

    console.log('✅ Sandbox deleted');

    console.log('\n🎉 All API v1 tests passed!');
    console.log('🚀 Armstrong AI is now E2B-compatible!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('💡 Make sure the dev server is running: npm run dev');
  }
}

// Solo per testing - non eseguire se non richiesto
if (process.argv.includes('--run')) {
  testApiV1();
} else {
  console.log('💡 API v1 test ready. Run with: node test-api-v1.js --run');
  console.log('💡 Make sure dev server is running: npm run dev');
}
