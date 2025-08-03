// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../lib/utils/apiResponse';

async function healthHandler(req: NextApiRequest, res: NextApiResponse) {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    services: {
      api: 'healthy',
      database: 'pending', // Implementeremo dopo
      docker: 'pending',   // Implementeremo dopo
    },
    armstrong: {
      name: 'Armstrong AI API',
      motto: 'Ready to stretch and execute! 🤖',
    }
  };

  return ApiResponseHandler.success(res, healthData, 'Armstrong API is healthy');
}

export default apiWrapper(healthHandler, {
  methods: ['GET'],
  rateLimit: false
});