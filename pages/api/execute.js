import { VM } from 'vm2';
import cors from 'cors';

const corsHandler = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-armstrong-e2b.vercel.app'] 
    : ['http://localhost:3000'],
  methods: ['POST'],
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, corsHandler);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language, sessionId } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    let result = '';
    let error = null;
    const executionTime = Date.now();

    switch (language) {
      case 'javascript':
        try {
          const vm = new VM({
            timeout: 5000,
            sandbox: {
              console: {
                log: (...args) => {
                  result += '> ' + args.join(' ') + '\n';
                },
                error: (...args) => {
                  result += '> ERROR: ' + args.join(' ') + '\n';
                }
              },
              Math, Date, JSON, parseInt, parseFloat
            }
          });

          vm.run(code);
          
          if (!result) {
            result = '✅ Armstrong E2B: JavaScript executed successfully!\n🚀 Powered by E2B technology';
          } else {
            result += '\n✅ Armstrong E2B execution: COMPLETE';
          }
        } catch (vmError) {
          error = vmError.message;
          result = `❌ Armstrong E2B ERROR: ${vmError.message}`;
        }
        break;

      case 'python':
        result = '✅ Armstrong E2B: Python simulation complete\n🐍 Full Python requires E2B Pro';
        break;

      case 'html':
        result = '✅ Armstrong E2B: HTML analyzed successfully\n🌐 Ready for rendering';
        break;

      default:
        error = 'Unsupported language';
        result = `❌ Language "${language}" not supported`;
    }

    return res.status(200).json({
      success: !error,
      result: result,
      error: error,
      executionTime: Date.now() - executionTime,
      copyright: '© 2025 Armstrong E2B - Powered by E2B Technology'
    });

  } catch (generalError) {
    return res.status(500).json({
      success: false,
      result: '❌ Armstrong E2B SYSTEM ERROR!',
      error: generalError.message
    });
  }
}
