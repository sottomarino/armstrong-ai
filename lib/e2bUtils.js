export const e2bConfig = {
  maxCodeLength: 50000,
  executionTimeout: 10000,
  supportedLanguages: ['javascript', 'python', 'html'],
  version: '1.0.0-E2B-ARMSTRONG',
  copyright: '© 2025 Armstrong E2B - Powered by E2B Technology'
};

export const generateE2BSessionId = () => {
  return `e2b-armstrong-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
};

export const validateE2BCode = (code, language) => {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Armstrong E2B needs code to execute!' };
  }
  
  if (code.length > e2bConfig.maxCodeLength) {
    return { valid: false, message: 'Code too long for Armstrong E2B!' };
  }
  
  return { valid: true, message: 'Code ready for E2B execution!' };
};
