// types/api.ts
export interface ExecutionRequest {
  code: string;
  language: 'javascript' | 'python' | 'html' | 'css' | 'json';
  timeout?: number;
  memoryLimit?: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed?: string;
  language: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  isAnonymous: boolean;
  createdAt: string;
  lastActivity: string;
  executionCount: number;
  rateLimitRemaining: number;
}

export interface FileOperation {
  action: 'upload' | 'download' | 'delete' | 'list';
  filename?: string;
  content?: string;
  language?: string;
}

export interface CodeFile {
  id: string;
  filename: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  sessionId: string;
}