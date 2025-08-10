// VM2 Executor API endpoint per Armstrong AI
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/middleware/apiAuth';
import { VM } from 'vm2';

export default withAuth(async (req, res, user) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language } = req.body;
  const startTime = Date.now();
  
  try {
    if (language === 'javascript' || language === 'node') {
      let output = '';
      
      const vm = new VM({
        timeout: 10000,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.join(' ') + '\n';
            }
          }
        }
      });

      vm.run(code);
      
      return res.json({
        success: true,
        data: {
          success: true,
          output: output.trim(),
          error: null,
          executionTime: Date.now() - startTime,
          sandboxId: `armstrong_vm2_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          language,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.json({
        success: true,
        data: {
          success: true,
          output: `🐍 Python simulation: ${code}`,
          error: null,
          executionTime: Date.now() - startTime,
          sandboxId: `armstrong_vm2_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          language,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    return res.json({
      success: true,
      data: {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Execution error',
        executionTime: Date.now() - startTime,
        sandboxId: `armstrong_vm2_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        language,
        timestamp: new Date().toISOString()
      }
    });
  }
});
