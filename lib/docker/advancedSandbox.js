const Docker = require('dockerode');
const { EventEmitter } = require('events');

class AdvancedSandboxManager extends EventEmitter {
  constructor() {
    super();
    this.docker = new Docker();
    this.activeSandboxes = new Map();
    this.startCleanupTimer();
  }

  async createAdvancedSandbox(config = {}) {
    const sessionId = this.generateSessionId();
    const {
      language = 'python',
      timeout = 30000,
      memoryLimit = '256m',
      diskLimit = '100m',
      networkAccess = false
    } = config;

    try {
      // Create workspace volume
      const volumeName = `armstrong-workspace-${sessionId}`;
      try {
        await this.docker.createVolume({ Name: volumeName });
      } catch (err) {
        console.log('Volume already exists or error:', err.message);
      }

      // Configure container based on language
      const containerConfig = this.getContainerConfig(language, sessionId, volumeName, {
        memoryLimit,
        diskLimit,
        networkAccess,
        timeout
      });

      const container = await this.docker.createContainer(containerConfig);
      await container.start();

      // Store sandbox info
      const sandboxInfo = {
        id: sessionId,
        container,
        volumeName,
        language,
        config,
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'ready'
      };

      this.activeSandboxes.set(sessionId, sandboxInfo);
      this.emit('sandbox:created', sessionId);

      return {
        sessionId,
        status: 'ready',
        language,
        config
      };

    } catch (error) {
      console.error('Advanced sandbox creation failed:', error);
      throw new Error(`Sandbox creation failed: ${error.message}`);
    }
  }

  getContainerConfig(language, sessionId, volumeName, options) {
    const baseConfig = {
      name: `armstrong-advanced-${sessionId}`,
      WorkingDir: '/workspace',
      Env: [
        'PYTHONUNBUFFERED=1',
        'NODE_ENV=sandbox',
        `SESSION_ID=${sessionId}`
      ],
      HostConfig: {
        Memory: this.parseMemoryLimit(options.memoryLimit),
        CpuQuota: 50000, // 50% CPU limit
        NetworkMode: options.networkAccess ? 'bridge' : 'none',
        ReadonlyRootfs: false,
        Tmpfs: {
          '/tmp': 'size=100m,noexec,nosuid,nodev'
        },
        Binds: [`${volumeName}:/workspace`]
      }
    };

    const languageConfigs = {
      python: {
        ...baseConfig,
        Image: 'python:3.11-slim',
        Cmd: ['python', '-c', 'import time; time.sleep(3600)']
      },
      javascript: {
        ...baseConfig,
        Image: 'node:18-alpine',
        Cmd: ['node', '-e', 'setTimeout(() => {}, 3600000)']
      },
      bash: {
        ...baseConfig,
        Image: 'ubuntu:22.04',
        Cmd: ['bash', '-c', 'sleep 3600']
      }
    };

    return languageConfigs[language] || languageConfigs.python;
  }

  async executeCodeAdvanced(sessionId, code, options = {}) {
    const sandbox = this.activeSandboxes.get(sessionId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    sandbox.lastActivity = new Date();
    sandbox.status = 'executing';
    this.emit('execution:started', sessionId);

    const startTime = Date.now();

    try {
      const result = await this.runCodeInSandbox(sandbox, code, options);
      
      sandbox.status = 'ready';
      this.emit('execution:completed', sessionId, result);

      return {
        ...result,
        sessionId,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      sandbox.status = 'ready';
      const errorResult = {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        executionTime: Date.now() - startTime,
        sessionId
      };
      
      this.emit('execution:error', sessionId, error);
      return errorResult;
    }
  }

  async runCodeInSandbox(sandbox, code, options) {
    const { container, language } = sandbox;
    
    // Create execution file
    const filename = this.getExecutionFilename(language);
    const filepath = `/workspace/${filename}`;

    // Write code to file
    await this.writeCodeToContainer(container, filepath, code);

    // Execute code
    const execCommand = this.getExecutionCommand(language, filepath);
    const exec = await container.exec({
      Cmd: execCommand,
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: false,
      Tty: false,
      WorkingDir: '/workspace'
    });

    // Start execution with timeout
    const stream = await exec.start();
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      const timeout = setTimeout(() => {
        exec.kill().catch(() => {});
        reject(new Error('Execution timeout'));
      }, options.timeout || 30000);

      // Parse Docker stream
      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', async () => {
        clearTimeout(timeout);
        
        try {
          const output = this.parseDockerStream(Buffer.concat(chunks));
          const inspect = await exec.inspect();
          
          // Cleanup
          await this.cleanupExecutionFile(container, filepath);

          resolve({
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: inspect.ExitCode || 0
          });
        } catch (err) {
          reject(err);
        }
      });

      stream.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async writeCodeToContainer(container, filepath, code) {
    const exec = await container.exec({
      Cmd: ['sh', '-c', `cat > ${filepath}`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ stdin: true });
    stream.write(code);
    stream.end();

    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  parseDockerStream(buffer) {
    let stdout = '';
    let stderr = '';
    let offset = 0;

    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) break;

      const header = buffer.subarray(offset, offset + 8);
      const streamType = header[0];
      const size = header.readUInt32BE(4);

      if (offset + 8 + size > buffer.length) break;

      const data = buffer.subarray(offset + 8, offset + 8 + size).toString();
      
      if (streamType === 1) {
        stdout += data;
      } else if (streamType === 2) {
        stderr += data;
      }

      offset += 8 + size;
    }

    return { stdout, stderr };
  }

  getExecutionFilename(language) {
    const extensions = {
      python: 'main.py',
      javascript: 'main.js',
      bash: 'main.sh'
    };
    return extensions[language] || 'main.txt';
  }

  getExecutionCommand(language, filepath) {
    const commands = {
      python: ['python', filepath],
      javascript: ['node', filepath],
      bash: ['bash', filepath]
    };
    return commands[language] || ['cat', filepath];
  }

  async cleanupExecutionFile(container, filepath) {
    try {
      const exec = await container.exec({
        Cmd: ['rm', '-f', filepath],
        AttachStdout: false,
        AttachStderr: false
      });
      await exec.start();
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async destroyAdvancedSandbox(sessionId) {
    const sandbox = this.activeSandboxes.get(sessionId);
    if (!sandbox) {
      return false;
    }

    try {
      // Stop and remove container
      await sandbox.container.stop();
      await sandbox.container.remove();

      // Remove volume
      try {
        const volume = this.docker.getVolume(sandbox.volumeName);
        await volume.remove();
      } catch (err) {
        console.log('Volume cleanup error:', err.message);
      }

      this.activeSandboxes.delete(sessionId);
      this.emit('sandbox:destroyed', sessionId);

      return true;
    } catch (error) {
      console.error('Sandbox destruction error:', error);
      return false;
    }
  }

  // Utility methods
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  parseMemoryLimit(limit) {
    const match = limit.match(/^(\d+)([kmg]?)$/i);
    if (!match) return 128 * 1024 * 1024;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'k': return value * 1024;
      case 'm': return value * 1024 * 1024;
      case 'g': return value * 1024 * 1024 * 1024;
      default: return value;
    }
  }

  startCleanupTimer() {
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, sandbox] of this.activeSandboxes) {
        const inactiveTime = now - sandbox.lastActivity;
        if (inactiveTime > 30 * 60 * 1000) { // 30 minutes
          console.log(`Cleaning up inactive sandbox: ${sessionId}`);
          this.destroyAdvancedSandbox(sessionId);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Status methods
  getSandboxInfo(sessionId) {
    const sandbox = this.activeSandboxes.get(sessionId);
    if (!sandbox) return null;

    return {
      id: sandbox.id,
      language: sandbox.language,
      status: sandbox.status,
      createdAt: sandbox.createdAt,
      lastActivity: sandbox.lastActivity,
      config: sandbox.config
    };
  }

  getAllActiveSandboxes() {
    return Array.from(this.activeSandboxes.entries()).map(([id, sandbox]) => ({
      id,
      language: sandbox.language,
      status: sandbox.status,
      createdAt: sandbox.createdAt,
      lastActivity: sandbox.lastActivity
    }));
  }
}

module.exports = { AdvancedSandboxManager };