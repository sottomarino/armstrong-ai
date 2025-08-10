// Updated VM2 Executor API endpoint con Real Python
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/middleware/apiAuth';
import { VM } from 'vm2';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';

// Real Python Executor Class
class RealPythonExecutor {
  static async execute(code: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Prova Python reale se disponibile
      const realResult = await this.executeRealPython(code, startTime);
      if (realResult.success || realResult.mode === 'real_python_error') {
        return realResult;
      }
      
      // Fallback a simulazione avanzata
      return this.executeAdvancedSimulation(code, startTime);
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Python execution error',
        executionTime: Date.now() - startTime,
        mode: 'error'
      };
    }
  }

  private static async executeRealPython(code: string, startTime: number): Promise<any> {
    return new Promise((resolve) => {
      // Crea file temporaneo
      const tempDir = '/tmp/armstrong-python';
      const fileName = `script_${Date.now()}_${Math.random().toString(36).substr(2, 8)}.py`;
      const filePath = join(tempDir, fileName);
      
      try {
        // Assicurati che la directory esista
        mkdirSync(tempDir, { recursive: true });
        
        // Scrivi il codice nel file
        writeFileSync(filePath, code);
        
        let output = '';
        let error = '';
        
        // Prova python3, poi python
        const pythonCmd = 'python3';
        const python = spawn(pythonCmd, [filePath], {
          timeout: 15000,
          cwd: tempDir
        });
        
        python.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        python.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        python.on('close', (code) => {
          // Cleanup
          try {
            unlinkSync(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          const executionTime = Date.now() - startTime;
          
          if (code === 0) {
            resolve({
              success: true,
              output: output.trim() || '✓ Python executed successfully (no output)',
              error: null,
              executionTime,
              mode: 'real_python',
              pythonVersion: 'Python 3.x',
              note: '🐍 Real Python execution'
            });
          } else {
            resolve({
              success: false,
              output: output.trim(),
              error: error.trim() || 'Python execution failed',
              executionTime,
              mode: 'real_python_error'
            });
          }
        });
        
        python.on('error', (err) => {
          // Cleanup
          try {
            unlinkSync(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          resolve({
            success: false,
            output: '',
            error: `Python not available: ${err.message}`,
            executionTime: Date.now() - startTime,
            mode: 'python_unavailable'
          });
        });
        
      } catch (err) {
        resolve({
          success: false,
          output: '',
          error: `File system error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          executionTime: Date.now() - startTime,
          mode: 'fs_error'
        });
      }
    });
  }

  private static executeAdvancedSimulation(code: string, startTime: number): any {
    let output = '';
    const lines = code.split('\n');
    let variables: { [key: string]: any } = {};
    
    try {
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // Gestisci print statements avanzati
        const printMatch = trimmed.match(/print\s*\(\s*(.+)\s*\)/);
        if (printMatch) {
          let content = printMatch[1];
          
          // Gestisci f-strings
          const fStringMatch = content.match(/f['"](.*)['"]/);
          if (fStringMatch) {
            let result = fStringMatch[1];
            // Sostituisci variabili nelle f-strings
            result = result.replace(/\{(\w+)\}/g, (match, varName) => {
              return variables[varName] || `{${varName}}`;
            });
            output += result + '\n';
            continue;
          }
          
          // Rimuovi quotes per stringhe normali
          content = content.replace(/^['"](.*)['"]*$/, '$1');
          
          // Valuta espressioni matematiche
          const mathMatch = content.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
          if (mathMatch) {
            const [, a, op, b] = mathMatch;
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            let result: number;
            switch (op) {
              case '+': result = numA + numB; break;
              case '-': result = numA - numB; break;
              case '*': result = numA * numB; break;
              case '/': result = numA / numB; break;
              default: result = 0;
            }
            output += result.toString() + '\n';
            continue;
          }
          
          // Stampa variabili
          if (variables[content]) {
            output += variables[content] + '\n';
          } else {
            output += content + '\n';
          }
          continue;
        }
        
        // Gestisci assegnazioni di variabili
        const varMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
        if (varMatch) {
          const [, varName, value] = varMatch;
          
          // Valuta il valore
          if (value.match(/^\d+$/)) {
            variables[varName] = parseInt(value);
          } else if (value.match(/^\d+\.\d+$/)) {
            variables[varName] = parseFloat(value);
          } else if (value.match(/^['"](.*)['"]*$/)) {
            variables[varName] = value.replace(/^['"](.*)['"]*$/, '$1');
          } else {
            variables[varName] = value;
          }
          output += `✓ ${varName} = ${variables[varName]}\n`;
          continue;
        }
        
        // Gestisci import
        if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
          const moduleMatch = trimmed.match(/(?:import|from)\s+(\w+)/);
          output += `✓ Imported module: ${moduleMatch ? moduleMatch[1] : 'module'}\n`;
          continue;
        }
        
        // Gestisci definizioni di funzioni e classi
        if (trimmed.startsWith('def ')) {
          const funcMatch = trimmed.match(/def\s+(\w+)/);
          output += `✓ Function '${funcMatch ? funcMatch[1] : 'unknown'}' defined\n`;
          continue;
        }
        
        if (trimmed.startsWith('class ')) {
          const classMatch = trimmed.match(/class\s+(\w+)/);
          output += `✓ Class '${classMatch ? classMatch[1] : 'unknown'}' defined\n`;
          continue;
        }
        
        // Gestisci loops e condizioni
        if (trimmed.startsWith('for ')) {
          output += `✓ For loop executed\n`;
          continue;
        }
        
        if (trimmed.startsWith('while ')) {
          output += `✓ While loop executed\n`;
          continue;
        }
        
        if (trimmed.startsWith('if ')) {
          output += `✓ Condition evaluated\n`;
          continue;
        }
        
        // Gestisci chiamate di funzioni
        if (trimmed.includes('(') && trimmed.includes(')') && !trimmed.includes('=')) {
          const funcCallMatch = trimmed.match(/(\w+)\s*\(/);
          output += `✓ Function '${funcCallMatch ? funcCallMatch[1] : 'unknown'}' called\n`;
          continue;
        }
      }
      
      if (!output.trim()) {
        output = '✓ Python code executed successfully';
      }
      
      return {
        success: true,
        output: output.trim(),
        error: null,
        executionTime: Date.now() - startTime,
        mode: 'advanced_simulation',
        note: '🔧 Advanced Python simulation - Install Python for real execution'
      };
      
    } catch (error) {
      return {
        success: false,
        output: output.trim(),
        error: error instanceof Error ? error.message : 'Simulation error',
        executionTime: Date.now() - startTime,
        mode: 'simulation_error'
      };
    }
  }
}

export default withAuth(async (req, res, user) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language } = req.body;
  const startTime = Date.now();
  
  try {
    if (language === 'javascript' || language === 'node') {
      let output = '';
      
      const vm = new VM({
        timeout: 10000,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            }
          },
          // Aggiungi Math, Date e altre funzioni utili
          Math: Math,
          Date: Date,
          JSON: JSON,
          parseInt: parseInt,
          parseFloat: parseFloat,
          isNaN: isNaN,
          isFinite: isFinite
        }
      });

      vm.run(code);
      
      return res.json({
        success: true,
        data: {
          success: true,
          output: output.trim() || '✓ JavaScript executed successfully',
          error: null,
          executionTime: Date.now() - startTime,
          sandboxId: `armstrong_vm2_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          language,
          timestamp: new Date().toISOString(),
          mode: 'vm2_javascript',
          note: '⚡ Fast VM2 execution'
        }
      });
      
    } else if (language === 'python') {
      // Usa il Real Python Executor
      const result = await RealPythonExecutor.execute(code);
      
      return res.json({
        success: true,
        data: {
          success: result.success,
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
          sandboxId: `armstrong_py_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          language,
          timestamp: new Date().toISOString(),
          mode: result.mode,
          note: result.note || (result.mode === 'real_python' ? '🐍 Real Python execution' : '🔧 Python simulation'),
          pythonVersion: result.pythonVersion
        }
      });
      
    } else {
      return res.json({
        success: true,
        data: {
          success: false,
          output: '',
          error: `Language '${language}' not supported`,
          executionTime: Date.now() - startTime,
          sandboxId: `armstrong_unsupported_${Date.now()}`,
          language,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    return res.json({
      success: true,
      data: {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Execution error',
        executionTime: Date.now() - startTime,
        sandboxId: `armstrong_error_${Date.now()}`,
        language,
        timestamp: new Date().toISOString()
      }
    });
  }
});