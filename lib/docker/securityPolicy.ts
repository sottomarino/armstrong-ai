// lib/docker/securityPolicy.ts
export interface SecurityPolicy {
  name: string;
  description: string;
  dockerArgs: string[];
  resourceLimits: {
    memory: string;
    cpu: string;
    processes: number;
    fileDescriptors: number;
  };
  timeouts: {
    execution: number;
    startup: number;
    cleanup: number;
  };
  allowedCapabilities: string[];
  blockedSyscalls: string[];
}

export class SecurityPolicyManager {
  private static policies: Record<string, SecurityPolicy> = {
    // Policy ultra-restrittiva per codice utente sconosciuto
    'ultra-strict': {
      name: 'Ultra Strict',
      description: 'Maximum security for untrusted user code',
      dockerArgs: [
        '--network=none',
        '--read-only',
        '--tmpfs=/tmp:rw,noexec,nosuid,size=50m',
        '--security-opt=no-new-privileges',
        '--cap-drop=ALL',
        '--user=1000:1000',
        '--pids-limit=16',
        '--ulimit=nproc=16:16',
        '--ulimit=nofile=32:32',
        '--ulimit=fsize=10485760', // 10MB max file size
        '--device-read-bps=/dev/sda:1mb',
        '--device-write-bps=/dev/sda:1mb'
      ],
      resourceLimits: {
        memory: '64m',
        cpu: '0.25',
        processes: 16,
        fileDescriptors: 32
      },
      timeouts: {
        execution: 15000,  // 15 secondi
        startup: 5000,     // 5 secondi per avvio
        cleanup: 2000      // 2 secondi per cleanup
      },
      allowedCapabilities: [], // Nessuna capability
      blockedSyscalls: [
        'mount', 'umount', 'syslog', 'process_vm_readv',
        'process_vm_writev', 'ptrace', 'reboot', 'swapon',
        'swapoff', 'sysfs', 'uselib', 'ustat'
      ]
    },

    // Policy standard per codice educativo
    'standard': {
      name: 'Standard Security',
      description: 'Balanced security for educational code',
      dockerArgs: [
        '--network=none',
        '--read-only',
        '--tmpfs=/tmp:rw,noexec,nosuid,size=100m',
        '--security-opt=no-new-privileges',
        '--cap-drop=ALL',
        '--user=1000:1000',
        '--pids-limit=32',
        '--ulimit=nproc=32:32',
        '--ulimit=nofile=64:64',
        '--ulimit=fsize=52428800' // 50MB max file size
      ],
      resourceLimits: {
        memory: '128m',
        cpu: '0.5',
        processes: 32,
        fileDescriptors: 64
      },
      timeouts: {
        execution: 30000,  // 30 secondi
        startup: 10000,    // 10 secondi
        cleanup: 5000      // 5 secondi
      },
      allowedCapabilities: [],
      blockedSyscalls: [
        'mount', 'umount', 'syslog', 'ptrace', 'reboot'
      ]
    },

    // Policy permissiva per sviluppo (solo in development)
    'development': {
      name: 'Development Mode',
      description: 'Relaxed security for development and testing',
      dockerArgs: [
        '--network=none',
        '--tmpfs=/tmp:rw,size=200m',
        '--security-opt=no-new-privileges',
        '--cap-drop=ALL',
        '--user=1000:1000',
        '--pids-limit=64'
      ],
      resourceLimits: {
        memory: '256m',
        cpu: '1.0',
        processes: 64,
        fileDescriptors: 128
      },
      timeouts: {
        execution: 60000,  // 1 minuto
        startup: 15000,    // 15 secondi
        cleanup: 10000     // 10 secondi
      },
      allowedCapabilities: [],
      blockedSyscalls: ['mount', 'umount', 'reboot']
    }
  };

  static getPolicy(environment: string = 'production'): SecurityPolicy {
    switch (environment) {
      case 'development':
        return this.policies['development'];
      case 'production':
        return this.policies['ultra-strict'];
      default:
        return this.policies['standard'];
    }
  }

  static getPolicyByName(name: keyof typeof SecurityPolicyManager.policies): SecurityPolicy {
    return this.policies[name] || this.policies['ultra-strict'];
  }

  static getAllPolicies(): Record<string, SecurityPolicy> {
    return { ...this.policies };
  }

  static createCustomPolicy(
    name: string,
    basePolicy: string = 'standard',
    overrides: Partial<SecurityPolicy> = {}
  ): SecurityPolicy {
    const base = this.policies[basePolicy] || this.policies['standard'];
    
    return {
      ...base,
      ...overrides,
      name,
      resourceLimits: {
        ...base.resourceLimits,
        ...overrides.resourceLimits
      },
      timeouts: {
        ...base.timeouts,
        ...overrides.timeouts
      }
    };
  }

  // Validazione runtime del container
  static validateContainerSecurity(containerId: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Implementazione per verificare che il container rispetti i vincoli di sicurezza
      // Per ora return true, implementeremo dopo
      resolve(true);
    });
  }

  // Monitoring delle risorse durante l'esecuzione
  static monitorContainerResources(containerId: string): Promise<{
    memoryUsage: number;
    cpuUsage: number;
    processCount: number;
  }> {
    return new Promise((resolve) => {
      // Implementazione monitoring risorse
      // Per ora return valori di esempio
      resolve({
        memoryUsage: Math.random() * 50 + 10, // 10-60MB
        cpuUsage: Math.random() * 30 + 5,     // 5-35%
        processCount: Math.floor(Math.random() * 5 + 1) // 1-5 processi
      });
    });
  }
}