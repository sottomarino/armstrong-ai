// lib/middleware/apiAuth.ts - Autenticazione per API v1
import { NextApiRequest, NextApiResponse } from 'next';

export interface AuthUser {
  id: string;
  email?: string;
  plan: 'free' | 'pro' | 'enterprise';
  quotas: {
    maxSandboxes: number;
    maxExecutions: number;
    maxExecutionTime: number;
  };
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export async function authenticateApiRequest(req: NextApiRequest): Promise<AuthResult> {
  try {
    // Estrai API key dall'header Authorization
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.replace('Bearer ', '') || req.headers['x-api-key'] as string;

    if (!apiKey) {
      return { success: false, error: 'API key required' };
    }

    // Verifica formato API key Armstrong
    if (!apiKey.startsWith('armstrong_')) {
      return { success: false, error: 'Invalid API key format' };
    }

    // Per ora, usa una validazione semplice
    // In produzione, questo dovrebbe controllare nel database
    const mockUser: AuthUser = {
      id: 'user_' + apiKey.split('_')[1],
      email: 'user@armstrong.ai',
      plan: 'pro',
      quotas: {
        maxSandboxes: 10,
        maxExecutions: 1000,
        maxExecutionTime: 300000
      }
    };

    return { success: true, user: mockUser };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

// Rate limiting per API v1
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(userId: string, limit: number = 60): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const key = `rate_limit_${userId}`;
  
  const existing = rateLimitStore.get(key);
  const resetTime = now + windowMs;

  if (!existing || now > existing.resetTime) {
    // Nuova finestra
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: existing.resetTime
    };
  }

  existing.count++;
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetTime: existing.resetTime
  };
}

// Middleware wrapper per facilità d'uso
export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authResult = await authenticateApiRequest(req);
    
    if (!authResult.success) {
      return res.status(401).json({
        error: authResult.error,
        code: 'UNAUTHORIZED'
      });
    }

    const rateLimitResult = await checkRateLimit(authResult.user!.id);
    
    if (!rateLimitResult.success) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: rateLimitResult.limit,
        resetTime: rateLimitResult.resetTime
      });
    }

    // Aggiungi headers rate limit
    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);

    try {
      await handler(req, res, authResult.user!);
    } catch (error) {
      console.error('API Handler Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}
