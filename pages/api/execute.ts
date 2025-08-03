// pages/api/execute.ts - Versione Semplificata
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Aggiungi headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      code: 'ARM_405' 
    });
  }

  try {
    const { code, language } = req.body;

    // Validazione input
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing code or language',
        code: 'ARM_400'
      });
    }

    console.log(`🚀 Executing ${language} code:`, code.substring(0, 100));

    const startTime = performance.now();
    let result;

    switch (language) {
      case 'javascript':
        result = await executeJavaScript(code);
        break;
      case 'python':
        result = await executePythonSimulation(code);
        break;
      case 'json':
        result = validateJSON(code);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Language ${language} not supported`,
          code: 'ARM_LANG'
        });
    }

    const executionTime = Math.floor(performance.now() - startTime);

    // Risposta di successo
    res.status(200).json({
      success: result.success,
      output: result.output,
      error: result.error || null,
      executionTime,
      language,
      timestamp: new Date().toISOString(),
      armstrongVersion: '1.0'
    });

  } catch (error) {
    console.error('🚨 Execution error:', error);
    
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'ARM_EXEC',
      timestamp: new Date().toISOString()
    });
  }
}

// JavaScript locale (testato e funzionante)
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
      setTimeout(() => reject(new Error('JavaScript execution timeout')), 5000);
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
      output: `🤖 Armstrong JavaScript Engine v1.0
${output}`
    };
  } catch (error: unknown) {
    console.log = originalConsoleLog;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      output: '',
      error: errorMessage
    };
  }
}

// Python Simulation (funziona sempre, nessuna dipendenza esterna)
async function executePythonSimulation(code: string) {
  try {
    // Simula print() statements
    const printMatches = code.match(/print\s*\(\s*["']([^"']+)["']\s*\)/g);
    let output = '🐍 Armstrong Python Engine v1.0 (Simulation Mode)\n';
    
    if (printMatches) {
      printMatches.forEach(match => {
        const content = match.match(/["']([^"']+)["']/)?.[1];
        if (content) {
          output += `${content}\n`;
        }
      });
    } else {
      output += 'Python code executed (no print statements detected)\n';
    }
    
    // Aggiungi info about real execution
    output += `
🔧 Note: This is simulation mode
   Real Python execution coming soon with Docker integration
   Current features:
   - Basic print() statement detection
   - Safe execution environment
   - No external dependencies
   
✅ Simulation completed successfully`;

    return {
      success: true,
      output
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Python simulation failed';
    return {
      success: false,
      output: '',
      error: errorMessage
    };
  }
}

// JSON validation (semplice e affidabile)
function validateJSON(code: string) {
  try {
    const parsed = JSON.parse(code);
    
    return {
      success: true,
      output: `🤖 Armstrong JSON Validator v1.0
✅ Valid JSON!

Formatted output:
${JSON.stringify(parsed, null, 2)}`
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    return {
      success: false,
      output: '',
      error: `❌ Invalid JSON: ${errorMessage}`
    };
  }
}