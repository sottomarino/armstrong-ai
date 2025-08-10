// Simple Executor per Armstrong AI - Bypass Docker
import { VM } from 'vm2';

export class SimpleExecutor {
  static async execute(code: string, language: string): Promise<any> {
    const startTime = Date.now();
    
    if (language === 'javascript' || language === 'node') {
      return this.executeJS(code, startTime);
    } else if (language === 'python') {
      return this.executePython(code, startTime);
    }
    
    return {
      success: false,
      output: '',
      error: `Language ${language} not supported`,
      executionTime: Date.now() - startTime,
      exitCode: 1
    };
  }

  private static executeJS(code: string, startTime: number) {
    let output = '';
    
    try {
      const vm = new VM({
        timeout: 10000,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.join(' ') + '\n';
            }
          }
        }
      });

      vm.run(code);
      
      return {
        success: true,
        output: output.trim(),
        error: null,
        executionTime: Date.now() - startTime,
        exitCode: 0
      };
    } catch (error) {
      return {
        success: false,
        output: output.trim(),
        error: error instanceof Error ? error.message : 'Execution error',
        executionTime: Date.now() - startTime,
        exitCode: 1
      };
    }
  }

  private static executePython(code: string, startTime: number) {
    // Simulazione Python per il momento
    const output = `🐍 Python simulation: ${code}`;
    
    return {
      success: true,
      output,
      error: null,
      executionTime: Date.now() - startTime,
      exitCode: 0
    };
  }
}
