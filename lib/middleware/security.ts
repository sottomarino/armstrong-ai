// lib/middleware/security.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { API_CONFIG } from '../config/api';

// Estendi il tipo NextApiRequest per includere ip
interface ExtendedNextApiRequest extends NextApiRequest {
  ip?: string;
}

const rateLimiter = new RateLimiterMemory({
  points: API_CONFIG.rateLimiting.max,
  duration: API_CONFIG.rateLimiting.windowMs / 1000,
});

// Funzione per ottenere l'IP del client
function getClientIP(req: ExtendedNextApiRequest): string {
  return (
    req.ip ||
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export const securityMiddleware = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting
    await rateLimiter.consume(clientIP);
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  } catch (rateLimiterRes: unknown) {
    // Type guard per verificare se rateLimiterRes ha msBeforeNext
    const msBeforeNext = (rateLimiterRes as any)?.msBeforeNext || 1000;
    
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: Math.round(msBeforeNext / 1000) || 1,
    });
  }
};