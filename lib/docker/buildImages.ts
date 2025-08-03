// lib/docker/buildImages.ts
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class DockerImageBuilder {
  private static imagesDir = join(process.cwd(), 'lib/docker/containers');
  private static images = {
    'armstrong-python': {
      dockerfile: 'Dockerfile.python',
      tag: 'armstrong-ai/python:latest'
    },
    'armstrong-node': {
      dockerfile: 'Dockerfile.node', 
      tag: 'armstrong-ai/node:latest'
    }
  };

  static async ensureImagesDir() {
    try {
      mkdirSync(this.imagesDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  static async buildAllImages(): Promise<boolean> {
    console.log('🐳 Building Armstrong AI Docker images...');
    
    await this.ensureImagesDir();
    
    for (const [name, config] of Object.entries(this.images)) {
      const success = await this.buildImage(name, config);
      if (!success) {
        console.error(`❌ Failed to build ${name}`);
        return false;
      }
    }
    
    console.log('✅ All Armstrong AI images built successfully!');
    return true;
  }

  private static async buildImage(
    name: string, 
    config: { dockerfile: string; tag: string }
  ): Promise<boolean> {
    console.log(`🔨 Building ${name}...`);
    
    return new Promise((resolve) => {
      const dockerfilePath = join(this.imagesDir, config.dockerfile);
      
      const child = spawn('docker', [
        'build',
        '-f', dockerfilePath,
        '-t', config.tag,
        this.imagesDir
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (exitCode) => {
        if (exitCode === 0) {
          console.log(`✅ Successfully built ${config.tag}`);
          resolve(true);
        } else {
          console.error(`❌ Failed to build ${name}:`);
          console.error(output);
          resolve(false);
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Error building ${name}:`, error.message);
        resolve(false);
      });
    });
  }

  static async checkCustomImages(): Promise<boolean> {
    const images = Object.values(this.images).map(img => img.tag);
    
    for (const image of images) {
      const exists = await this.imageExists(image);
      if (!exists) {
        console.log(`📦 Custom image ${image} not found, will build...`);
        return false;
      }
    }
    
    console.log('✅ All custom Armstrong images available');
    return true;
  }

  private static async imageExists(tag: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('docker', ['images', '-q', tag], { stdio: 'pipe' });
      
      let output = '';
      child.stdout?.on('data', (data) => {
        output += data.toString().trim();
      });

      child.on('close', () => {
        resolve(output.length > 0);
      });

      child.on('error', () => {
        resolve(false);
      });
    });
  }

  static getImageTag(language: string): string {
    switch (language) {
      case 'python':
        return this.images['armstrong-python'].tag;
      case 'javascript':
      case 'node':
        return this.images['armstrong-node'].tag;
      default:
        return 'python:3.11-alpine'; // fallback
    }
  }
}