// lib/docker/dockerManager.ts
import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { API_CONFIG } from '../config/api';

export interface DockerExecutionOptions {
  language: 'python' | 'javascript' | 'node';
  code: string;
  timeout?: number;
  memoryLimit?: string;
  cpuLimit?: string;
}

export interface DockerExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  exitCode: number;
}

export class DockerManager {
  private static tempDir = '/tmp/armstrong-executions';

  static async ensureTempDir() {
    try {
      mkdirSync(this.tempDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  static async executeCode(options: DockerExecutionOptions): Promise<DockerExecutionResult> {
    const {
      language,
      code,
      timeout = API_CONFIG.docker.timeout,
      memoryLimit = API_CONFIG.docker.memoryLimit,
      cpuLimit = API_CONFIG.docker.cpuLimit
    } = options;

    const executionId = randomUUID();
    const startTime = Date.now();

    await this.ensureTempDir();

    try {
      // Seleziona l'immagine Docker appropriata
      const dockerImage = this.getDockerImage(language);
      const { filePath, fileName } = this.createTempFile(executionId, language, code);

      // Esegui il container Docker
      const result = await this.runDockerContainer({
        image: dockerImage,
        filePath,
        fileName,
        timeout,
        memoryLimit,
        cpuLimit,
        language
      });

      // Pulisci il file temporaneo
      this.cleanup(filePath);

      return {
        ...result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - startTime,
        exitCode: -1
      };
    }
  }

  private static getDockerImage(language: string): string {
    const images: Record<string, string> = {
      python: 'python:3.11-alpine',
      javascript: 'node:18-alpine',
      node: 'node:18-alpine'
    };
    
    return images[language] || 'python:3.11-alpine';
  }

  private static createTempFile(executionId: string, language: string, code: string) {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      node: 'js'
    };

    const extension = extensions[language] || 'py';
    const fileName = `${executionId}.${extension}`;
    const filePath = join(this.tempDir, fileName);

    // Aggiungi wrapper di sicurezza per il codice
    const wrappedCode = this.wrapCode(language, code);
    writeFileSync(filePath, wrappedCode, 'utf8');

    return { filePath, fileName };
  }

  private static wrapCode(language: string, code: string): string {
    switch (language) {
      case 'python':
        return `#!/usr/bin/env python3
# Armstrong AI - Secure Python Execution
import sys
import signal
import resource
import os

# Limiti di sicurezza
def set_limits():
    # Limite memoria (64MB)
    resource.setrlimit(resource.RLIMIT_AS, (64 * 1024 * 1024, 64 * 1024 * 1024))
    # Limite CPU (30 secondi)
    resource.setrlimit(resource.RLIMIT_CPU, (30, 30))
    # Limite file aperti
    resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))

def timeout_handler(signum, frame):
    print("🚫 TIMEOUT: Execution exceeded time limit", file=sys.stderr)
    sys.exit(124)

# Imposta timeout
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(30)

try:
    set_limits()
    print("🤖 Armstrong Python Executor v1.0")
    print("=" * 40)
    
    # Esegui il codice utente
${code}
    
    print("=" * 40)
    print("✅ Execution completed successfully")
    
except KeyboardInterrupt:
    print("🚫 Execution interrupted", file=sys.stderr)
    sys.exit(130)
except MemoryError:
    print("🚫 MEMORY ERROR: Execution exceeded memory limit", file=sys.stderr)
    sys.exit(125)
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    signal.alarm(0)
`;

      case 'javascript':
      case 'node':
        return `#!/usr/bin/env node
// Armstrong AI - Secure JavaScript Execution
const process = require('process');

// Timeout di sicurezza
const timeout = setTimeout(() => {
    console.error('🚫 TIMEOUT: Execution exceeded time limit');
    process.exit(124);
}, 30000);

// Limiti di sicurezza
process.setMaxListeners(10);

try {
    console.log('🤖 Armstrong JavaScript Executor v1.0');
    console.log('='.repeat(40));
    
    // Esegui il codice utente
    ${code}
    
    console.log('='.repeat(40));
    console.log('✅ Execution completed successfully');
    
} catch (error) {
    console.error(\`❌ ERROR: \${error.name}: \${error.message}\`);
    process.exit(1);
} finally {
    clearTimeout(timeout);
}
`;

      default:
        return code;
    }
  }

  private static async runDockerContainer(options: {
    image: string;
    filePath: string;
    fileName: string;
    timeout: number;
    memoryLimit: string;
    cpuLimit: string;
    language: string;
  }): Promise<Omit<DockerExecutionResult, 'executionTime'>> {
    
    const { image, filePath, fileName, timeout, memoryLimit, cpuLimit, language } = options;

    return new Promise((resolve) => {
      const command = language === 'python' ? 'python3' : 'node';
      const dockerArgs = [
        'run',
        '--rm',
        '--network=none',
        '--read-only',
        '--tmpfs=/tmp:rw,noexec,nosuid,size=100m',
        `--memory=${memoryLimit}`,
        `--cpus=${cpuLimit}`,
        '--pids-limit=32',
        '--ulimit=nproc=32:32',
        '--ulimit=nofile=64:64',
        '--security-opt=no-new-privileges',
        '--cap-drop=ALL',
        '-v', `${filePath}:/app/${fileName}:ro`,
        '-w', '/app',
        image,
        command,
        fileName
      ];

      let stdout = '';
      let stderr = '';

      const child: ChildProcess = spawn('docker', dockerArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: timeout
      });

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        const success = exitCode === 0;
        const output = stdout || stderr || 'No output generated';
        
        resolve({
          success,
          output: success ? stdout : stderr,
          error: success ? undefined : stderr || 'Process failed',
          exitCode: exitCode || -1
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: `Docker execution failed: ${error.message}`,
          exitCode: -1
        });
      });

      // Timeout di sicurezza
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          resolve({
            success: false,
            output: '',
            error: 'Execution timeout exceeded',
            exitCode: 124
          });
        }
      }, timeout + 5000);
    });
  }

  private static cleanup(filePath: string) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', filePath);
    }
  }

  // Verifica che Docker sia disponibile
  static async checkDockerAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('docker', ['--version'], { stdio: 'pipe' });
      
      child.on('close', (exitCode) => {
        resolve(exitCode === 0);
      });
      
      child.on('error', () => {
        resolve(false);
      });
    });
  }

  // Prepara le immagini Docker necessarie
  static async pullDockerImages(): Promise<void> {
    const images = ['python:3.11-alpine', 'node:18-alpine'];
    
    for (const image of images) {
      console.log(`🐳 Pulling Docker image: ${image}`);
      
      await new Promise<void>((resolve, reject) => {
        const child = spawn('docker', ['pull', image], { stdio: 'inherit' });
        
        child.on('close', (exitCode) => {
          if (exitCode === 0) {
            console.log(`✅ Successfully pulled: ${image}`);
            resolve();
          } else {
            console.error(`❌ Failed to pull: ${image}`);
            reject(new Error(`Failed to pull ${image}`));
          }
        });
        
        child.on('error', reject);
      });
    }
  }
}