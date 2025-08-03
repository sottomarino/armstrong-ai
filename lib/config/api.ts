// lib/config/api.ts
export const API_CONFIG = {
  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100, // limite per IP per finestra
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://armstrong-ai.vercel.app'] 
      : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'armstrong-secret-key',
    expiresIn: '24h',
  },

  // File upload limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['.js', '.py', '.html', '.css', '.json', '.txt'],
  },

  // Docker execution settings
  docker: {
    timeout: 30000, // 30 secondi
    memoryLimit: '128m',
    cpuLimit: '0.5',
  }
};