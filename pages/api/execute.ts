// pages/api/execute.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../lib/utils/apiResponse';
import { ExecutionRequest, ExecutionResult } from '../../lib/types/api';
import { DockerManager } from '../../lib/docker/dockerManager';
import { SessionService } from '../../lib/database/services/sessionService';
import { ExecutionService } from '../../lib/database/services/executionService';

// Estendi NextApiRequest per includere info sessione
interface ExtendedRequest extends NextApiRequest {
  sessionId?: string;
  userId?: string;
}

// Helper per ottenere o creare sessione
async function getOrCreateSession(req: NextApiRequest): Promise<string | null> {
  // Controlla cookie
  const sessionCookie = req.headers.cookie
    ?.split(';')
    .find(cookie => cookie.trim().startsWith('armstrong_session='))
    ?.split('=')[1];

  if (sessionCookie) {
    // Valida sessione esistente
    const session = await SessionService.getSessionByToken(sessionCookie);
    if (session) {
      console.log('🔄 Using existing session from cookie:', session.id);
      return session.id;
    }
  }

  // Controlla header personalizzato (per API calls)
  const sessionHeader = req.headers['x-armstrong-session'] as string;
  if (sessionHeader) {
    const session = await SessionService.getSessionByToken(sessionHeader);
    if (session) {
      console.log('🔄 Using session from header:', session.id);
      return session.id;
    }
  }

  // Controlla body per sessionToken (alternativa)
  const { sessionToken } = req.body;
  if (sessionToken) {
    const session = await SessionService.getSessionByToken(sessionToken);
    if (session) {
      console.log('🔄 Using session from body:', session.id);
      return session.id;
    }
  }

  // Crea nuova sessione
  console.log('🆕 Creating new anonymous session');
  const newSession = await SessionService.createAnonymousSession(
    getClientIP(req),
    req.headers['user-agent']
  );
  
  return newSession?.id || null;
}

async function executeHandler(req: ExtendedRequest, res: NextApiResponse) {
  const { code, language, timeout = 30000 }: ExecutionRequest = req.body;

  if (!code || !language) {
    return ApiResponseHandler.badRequest(res, 'Code and language are required');
  }

  const startTime = performance.now();

  try {
    // Gestisci sessione (usa esistente o crea nuova)
    let sessionId = await getOrCreateSession(req);

    if (!sessionId) {
      console.error('Failed to create or get session');
      // Continua senza sessione per non bloccare l'esecuzione
    }

    let result: Partial<ExecutionResult>;

    switch (language) {
      case 'javascript':
        result = await executeJavaScript(code);
        break;
      case 'python':
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

    // Salva esecuzione nel database
    if (sessionId) {
      try {
        await ExecutionService.saveExecution({
          sessionId,
          userId: req.userId,
          language,
          codeSnippet: code,
          success: result.success || false,
          output: result.output,
          errorMessage: result.error,
          executionTimeMs: executionTime,
          executionMethod: language === 'python' ? 'simulation' : 'local'
        });

        // Incrementa contatore sessione
        await SessionService.incrementExecutions(sessionId);
        await SessionService.updateSessionActivity(sessionId);

        console.log(`✅ Execution saved to session ${sessionId}`);
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Non fermare l'esecuzione per errori DB
      }
    }

    // Ottieni sessionToken per la risposta (se abbiamo sessionId)
    let sessionToken = null;
    if (sessionId) {
      try {
        const sessionData = await SessionService.getSessionByToken(
          req.headers['x-armstrong-session'] as string ||
          req.body.sessionToken ||
          req.headers.cookie?.split(';').find(c => c.trim().startsWith('armstrong_session='))?.split('=')[1] ||
          ''
        );
        sessionToken = sessionData?.sessionToken;
      } catch (error) {
        console.error('Error getting session token:', error);
      }
    }

    // Aggiungi info sessione alla risposta
    return ApiResponseHandler.success(res, {
      ...executionResult,
      sessionId,
      sessionToken,
      metadata: {
        executionMethod: language === 'python' ? 'simulation' : 'local',
        sessionManaged: !!sessionId,
        isNewSession: !req.headers['x-armstrong-session'] && !req.body.sessionToken && !sessionToken
      }
    }, 'Code executed successfully');

  } catch (error: unknown) {
    const executionTime = Math.floor(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Salva anche gli errori nel database
    const sessionId = await getOrCreateSession(req);
    if (sessionId) {
      try {
        await ExecutionService.saveExecution({
          sessionId,
          userId: req.userId,
          language,
          codeSnippet: code,
          success: false,
          errorMessage,
          executionTimeMs: executionTime,
          executionMethod: language === 'python' ? 'simulation' : 'local'
        });
      } catch (dbError) {
        console.error('Database error save failed:', dbError);
      }
    }
    
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

// Helper per ottenere IP client
function getClientIP(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
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

// Python con Docker (migliorato)
async function executePythonDocker(code: string, timeout: number) {
  try {
    console.log('🐳 Checking Docker availability...');
    
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