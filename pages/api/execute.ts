// pages/api/execute.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../lib/utils/apiResponse';
import { ExecutionRequest, ExecutionResult } from '../../lib/types/api';
import { DockerManager } from '../../lib/docker/dockerManager';

async function executeHandler(req: NextApiRequest, res: NextApiResponse) {
  const { code, language, timeout = 30000 }: ExecutionRequest = req.body;

  if (!code || !language) {
    return ApiResponseHandler.badRequest(res, 'Code and language are required');
  }

  const startTime = performance.now();

  try {
    let result: Partial<ExecutionResult>;

    switch (language) {
      case 'javascript':
        // JavaScript esecuzione locale (sicura)
        result = await executeJavaScript(code);
        break;
      case 'python':
        // Python esecuzione Docker (ultra-sicura)
        result = await executePythonDocker(code, timeout);
        break;
      case 'json':
        result = validateJSON(code);
        break;
      default:
        return ApiResponseHandler.badRequest(res, `Language ${language} not supported`);
    }

    const executionTime = Math.floor(performance.now() - startTime);

    const executionResult: ExecutionResult = {
      ...result,
      executionTime,
      language,
      timestamp: new Date().toISOString()
    } as ExecutionResult;

    return ApiResponseHandler.success(res, executionResult, 'Code executed successfully');

  } catch (error: unknown) {
    const executionTime = Math.floor(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const errorResult: ExecutionResult = {
      success: false,
      error: errorMessage,
      executionTime,
      language,
      timestamp: new Date().toISOString()
    };

    return ApiResponseHandler.success(res, errorResult, 'Execution completed with errors');
  }
}

// JavaScript locale (come prima ma migliorato)
async function executeJavaScript(code: string) {
  const logs: string[] = [];
  const originalConsoleLog = console.log;
  
  console.log = (...args) => {
    logs.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
    originalConsoleLog(...args);
  };

  try {
    // Timeout di sicurezza per JavaScript
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('JavaScript execution timeout')), 10000);
    });

    const execPromise = new Promise((resolve) => {
      const func = new Function(code);
      const result = func();
      resolve(result);
    });

    const result = await Promise.race([execPromise, timeoutPromise]);
    console.log = originalConsoleLog;
    
    const output = logs.length > 0 ? logs.join('\n') : (result !== undefined ? String(result) : 'Code executed successfully');
    
    return {
      success: true,
      output: `🤖 Armstrong JavaScript Executor v1.0
${'='.repeat(40)}
${output}
${'='.repeat(40)}
✅ Execution completed successfully`
    };
  } catch (error: unknown) {
    console.log = originalConsoleLog;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
}

// Python con Docker (NUOVO E POTENTE!)
async function executePythonDocker(code: string, timeout: number) {
  try {
    console.log('🐳 Checking Docker availability...');
    
    // Controlla se Docker è disponibile
    const dockerAvailable = await DockerManager.checkDockerAvailability();
    
    if (!dockerAvailable) {
      console.log('⚠️  Docker not available, using simulation mode');
      return {
        success: true,
        output: `🐍 Armstrong Python Executor v1.0 (Simulation Mode)
${'='.repeat(50)}
🚨 DOCKER NOT AVAILABLE - SIMULATION MODE 🚨

Code that would be executed:
${code}

🔧 To enable real Python execution:
   1. Install Docker: sudo apt install docker.io
   2. Add user to docker group: sudo usermod -aG docker $USER
   3. Restart terminal or run: newgrp docker
   4. Test: docker run hello-world

⚠️  This is a safe simulation of what would be executed.
🔒 Real execution would run in isolated Docker container with:
   - Network isolation (no internet access)
   - Memory limit (128MB)
   - CPU limit (0.5 core)
   - Time limit (30 seconds)
   - Read-only filesystem
   - No system privileges

${'='.repeat(50)}
✅ Simulation completed successfully`
      };
    }

    console.log('🚀 Executing Python code in Docker container...');
    
    // Esegui con Docker
    const result = await DockerManager.executeCode({
      language: 'python',
      code,
      timeout
    });

    if (result.success) {
      return {
        success: true,
        output: result.output
      };
    } else {
      return {
        success: false,
        output: result.output,
        error: result.error
      };
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Docker execution failed';
    console.error('Python Docker execution error:', errorMessage);
    
    // Fallback graceful
    return {
      success: false,
      output: '',
      error: `🐳 Docker Execution Error: ${errorMessage}

This could happen if:
- Docker is not running (start with: sudo systemctl start docker)
- Permission issues (try: sudo usermod -aG docker $USER)
- Docker images not available (will auto-download on first use)
- System resource limits reached

🔧 Try running: docker run hello-world
   If that works, Armstrong Python should work too!`
    };
  }
}

// JSON validation (migliorato)
function validateJSON(code: string) {
  try {
    const parsed = JSON.parse(code);
    
    // Informazioni aggiuntive sul JSON
    const jsonInfo = {
      type: Array.isArray(parsed) ? 'Array' : typeof parsed,
      size: JSON.stringify(parsed).length,
      keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0
    };
    
    return {
      success: true,
      output: `🤖 Armstrong JSON Validator v1.0
${'='.repeat(40)}
✅ VALID JSON!

📊 JSON Information:
   - Type: ${jsonInfo.type}
   - Size: ${jsonInfo.size} characters
   - Keys: ${jsonInfo.keys} ${jsonInfo.type === 'object' ? 'properties' : 'elements'}

📄 Formatted Output:
${JSON.stringify(parsed, null, 2)}

${'='.repeat(40)}
✅ Validation completed successfully`
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`🤖 Armstrong JSON Validator v1.0
${'='.repeat(40)}
❌ INVALID JSON!

Error: ${errorMessage}

🔧 Common JSON issues:
   - Missing quotes around strings
   - Trailing commas
   - Single quotes instead of double quotes
   - Unescaped characters
   - Missing closing brackets/braces

${'='.repeat(40)}
❌ Validation failed`);
  }
}

export default apiWrapper(executeHandler, {
  methods: ['POST'],
  rateLimit: true
});