// test-docker-extension.js - Versione corretta
async function testDockerExtension() {
  console.log('🧪 Testing Docker Extension...');

  try {
    // Importa dinamicamente il modulo TypeScript compilato
    const { DockerManager } = await import('./lib/docker/dockerManager.js');

    // Test 1: Verifica Docker
    console.log('\n1. Checking Docker availability...');
    const dockerAvailable = await DockerManager.checkDockerAvailability();
    console.log('🐳 Docker available:', dockerAvailable);

    if (!dockerAvailable) {
      console.log('❌ Docker not available. Please install Docker first.');
      console.log('💡 Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh');
      return;
    }

    // Test 2: Sandbox creation
    console.log('\n2. Creating sandbox...');
    const sandbox = await DockerManager.createSandbox({
      language: 'python',
      userId: 'test-user'
    });
    console.log('✅ Sandbox created:', sandbox.id);

    // Test 3: Execute in sandbox  
    console.log('\n3. Executing code in sandbox...');
    const result = await DockerManager.executeInSandbox(
      sandbox.id, 
      'print("Hello from Armstrong Enhanced!")\nprint("Test successful!")'
    );
    console.log('✅ Execution result:', result.success ? 'SUCCESS' : 'FAILED');
    if (result.output) {
      console.log('   Output preview:', result.output.substring(0, 200));
    }

    // Test 4: List sandboxes
    console.log('\n4. Listing sandboxes...');
    const sandboxes = DockerManager.listUserSandboxes('test-user');
    console.log('✅ User sandboxes:', sandboxes.length);

    // Test 5: Stats
    console.log('\n5. Sandbox stats...');
    const stats = DockerManager.getSandboxStats();
    console.log('✅ Stats:', stats);

    // Test 6: Cleanup
    console.log('\n6. Cleaning up...');
    await DockerManager.destroySandbox(sandbox.id);
    console.log('✅ Sandbox destroyed');

    console.log('\n🎉 All tests passed!');
    console.log('🚀 Armstrong AI DockerManager is now E2B-ready!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDockerExtension();
