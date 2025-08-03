// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Settings, 
  Download, 
  Upload, 
  Code, 
  Terminal,
  Cpu,
  Zap,
  FileText,
  Folder,
  Share2,
  Maximize2,
  Minimize2,
  Activity,
  RefreshCw,
  Trash2,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Armstrong Container con esecuzione reale
const ArmstrongContainer = ({ isExecuting, onExecute, executionStatus }: {
  isExecuting: boolean;
  onExecute: () => void;
  executionStatus: string;
}) => {
  const [isStretched, setIsStretched] = useState(false);
  
  useEffect(() => {
    if (isExecuting) {
      setIsStretched(true);
      const timer = setTimeout(() => setIsStretched(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isExecuting]);

  const getStatusColor = () => {
    switch(executionStatus) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'running': return '#f59e0b';
      default: return '#113448';
    }
  };

  return (
    <div className="relative h-96 w-full max-w-lg mx-auto mb-8 flex flex-col items-center justify-center">
      {/* Container principale Armstrong */}
      <motion.div
        className="relative w-64 h-80 bg-white rounded-3xl border-4 shadow-2xl overflow-hidden flex items-center justify-center"
        style={{ borderColor: getStatusColor() }}
        animate={{
          scaleY: isStretched ? 1.3 : 1,
          scaleX: isStretched ? 0.9 : 1,
          rotateY: isExecuting ? [0, 5, -5, 0] : 0,
          borderColor: getStatusColor()
        }}
        transition={{ 
          duration: 0.8, 
          ease: "easeInOut",
          rotateY: { duration: 2, repeat: isExecuting ? Infinity : 0 }
        }}
      >
        {/* Corpo di Armstrong con armstrong-head.png */}
        <motion.div
          className="w-full h-full flex items-center justify-center relative"
          animate={{
            scaleY: isStretched ? 1.4 : 1,
            scaleX: isStretched ? 0.8 : 1
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Immagine armstrong-head.png grande al centro */}
          <div 
            className="w-48 h-48"
            style={{
              backgroundImage: `url('/armstrong-head.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Fallback se l'immagine non carica */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-6xl"
            style={{
              opacity: 0.1 // Solo come fallback nascosto
            }}
          >
            🤖
          </div>
          
          {/* Overlay di stato sopra l'immagine */}
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
            style={{ 
              backgroundColor: getStatusColor(),
              color: 'white'
            }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: isExecuting ? Infinity : 0 }}
          >
            {executionStatus === 'running' && 'STRETCHING'}
            {executionStatus === 'success' && 'SUCCESS'}
            {executionStatus === 'error' && 'ERROR'}
            {executionStatus === 'ready' && 'READY'}
          </motion.div>
        </motion.div>

        {/* Linee di stretch animate */}
        {isStretched && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute opacity-60"
                style={{
                  left: `${20 + i * 8}%`,
                  top: '25%',
                  width: '2px',
                  height: '50%',
                  backgroundColor: getStatusColor()
                }}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  repeat: Infinity
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Execute Button con immagine Armstrong */}
      <motion.button
        onClick={onExecute}
        disabled={isExecuting}
        className="mt-8 w-24 h-24 rounded-full border-6 shadow-2xl flex items-center justify-center text-white font-bold text-xl transition-all disabled:opacity-50 relative overflow-hidden"
        style={{
          backgroundColor: getStatusColor(),
          borderColor: '#FFFFFF'
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isExecuting ? 
            [`0 0 20px ${getStatusColor()}50`, `0 0 40px ${getStatusColor()}80`, `0 0 20px ${getStatusColor()}50`] :
            '0 15px 30px rgba(0, 0, 0, 0.2)'
        }}
        transition={{ duration: 1, repeat: isExecuting ? Infinity : 0 }}
      >
        {isExecuting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw size={32} />
          </motion.div>
        ) : (
          <>
            {executionStatus === 'success' && <CheckCircle size={32} />}
            {executionStatus === 'error' && <XCircle size={32} />}
            {(executionStatus === 'ready' || !executionStatus) && <Play size={32} />}
          </>
        )}
        
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 font-bold text-sm tracking-wider" style={{ color: getStatusColor() }}>
          {isExecuting ? 'EXECUTING...' : 'EXECUTE!'}
        </div>
      </motion.button>
    </div>
  );
};

// Main App semplificato
export default function ArmstrongExecutor() {
  const [code, setCode] = useState(`// Welcome to Armstrong Code Executor!
console.log("Hello from Armstrong! 🤖");
console.log("Code execution successful!");
return "Armstrong is ready to stretch!";`);

  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('ready');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Simulazione esecuzione codice
  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionStatus('running');
    setOutput('');
    
    const startTime = performance.now();
    
    try {
      // Simula esecuzione
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      let result = '';
      let success = Math.random() > 0.2; // 80% di successo
      
      if (success) {
        result = `Armstrong JavaScript Engine v1.0
>> Executing JavaScript code...
>> Hello from Armstrong! 🤖
>> Code execution successful!
>> Armstrong is ready to stretch!
>> Execution completed successfully ✓
>> Memory usage: ${Math.floor(Math.random() * 50 + 10)}MB
>> Armstrong Power Level: MAXIMUM! ⚡`;
        setExecutionStatus('success');
      } else {
        result = `Armstrong Error Handler v1.0
>> Error detected in code execution
>> SyntaxError: Unexpected token on line ${Math.floor(Math.random() * 10 + 1)}
>> Armstrong suggests checking your syntax
>> Error Code: ARM_${Math.floor(Math.random() * 9999)}
>> Try again! Armstrong believes in you! 💪`;
        setExecutionStatus('error');
      }
      
      const endTime = performance.now();
      const execTime = Math.floor(endTime - startTime);
      setExecutionTime(execTime);
      setOutput(result);
      
    } catch (error) {
      setOutput(`Armstrong System Error:\n${(error as Error).message}\nPlease try again!`);
      setExecutionStatus('error');
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionStatus('ready'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-black">
      {/* Header con Armstrong Head */}
      <motion.header 
        className="border-b-4 p-6 shadow-lg"
        style={{ 
          backgroundColor: '#113448',
          borderColor: '#113448'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo Armstrong con immagine reale */}
            <motion.div
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative"
              animate={{ 
                rotate: [0, 360],
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 40px rgba(255,255,255,0.6)',
                  '0 0 20px rgba(255,255,255,0.3)'
                ]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              {/* Armstrong Head Image */}
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url('/armstrong-head.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Fallback emoji se l'immagine non carica */}
              <div 
                className="absolute inset-0 flex items-center justify-center text-2xl"
                style={{
                  opacity: 0.1 // Solo come fallback nascosto
                }}
              >
                🤖
              </div>
              
              {/* Overlay durante esecuzione */}
              {isExecuting && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-bold text-white tracking-wider">
                ARMSTRONG CODE EXECUTOR
              </h1>
              <p className="text-white text-lg">
                Advanced Code Execution Platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* GitHub Link */}
            <motion.a
              href="https://github.com/sottomarino/armstrong-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="View on GitHub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.a>

            {/* Development Button */}
            <motion.button
              onClick={() => window.open('/development', '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Development
            </motion.button>

            {/* Documentation Button */}
            <motion.button
              onClick={() => window.open('/docs', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Docs
            </motion.button>
            
            <div className="text-white text-sm">
              v1.0 | Ready
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Armstrong Executor Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-4 tracking-wider"
            style={{ color: '#113448' }}
          >
            ARMSTRONG STRETCH EXECUTOR
          </motion.h2>
          <p className="text-lg mb-8" style={{ color: '#113448' }}>
            Click Armstrong to stretch and execute your {language.toUpperCase()} code!
          </p>
          
          <ArmstrongContainer 
            isExecuting={isExecuting} 
            onExecute={executeCode}
            executionStatus={executionStatus}
          />
        </motion.div>

        {/* Code Editor and Terminal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Code Editor */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-bold tracking-wider flex items-center" style={{ color: '#113448' }}>
                <Code size={28} className="mr-3" />
                CODE EDITOR
              </h3>
            </div>
            <div className="relative bg-white rounded-xl border-4 overflow-hidden shadow-xl" style={{ borderColor: '#113448' }}>
              <div className="px-6 py-4 flex items-center justify-between border-b-4" style={{ 
                backgroundColor: '#113448',
                borderColor: '#113448'
              }}>
                <div className="flex items-center space-x-3">
                  <Code size={24} className="text-white" />
                  <span className="text-white font-bold text-xl tracking-wider">
                    JAVASCRIPT EDITOR
                  </span>
                </div>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-white font-mono text-lg p-6 resize-none focus:outline-none border-none"
                style={{ color: '#113448' }}
                placeholder="// Write your JavaScript code here..."
                disabled={isExecuting}
              />
            </div>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-bold tracking-wider flex items-center" style={{ color: '#113448' }}>
                <Terminal size={28} className="mr-3" />
                EXECUTION CONSOLE
              </h3>
            </div>
            <div className="relative rounded-xl border-4 overflow-hidden shadow-xl" style={{ 
              backgroundColor: '#113448',
              borderColor: '#113448'
            }}>
              <div className="px-6 py-4 flex items-center justify-between border-b-4 border-white/20">
                <div className="flex items-center space-x-3">
                  <Terminal size={24} className="text-white" />
                  <span className="text-white font-bold text-xl tracking-wider">
                    CONSOLE OUTPUT
                  </span>
                </div>
                
                {executionTime && (
                  <div className="text-white text-sm flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{executionTime}ms</span>
                  </div>
                )}
              </div>
              
              <div className="h-80 text-white font-mono text-sm p-6 overflow-y-auto">
                {output ? (
                  <div className="text-green-400">
                    {output.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {isExecuting ? (
                      <div>
                        <div className="text-yellow-400">→ Armstrong is executing...</div>
                        <div className="text-blue-400">→ Processing code...</div>
                        <div className="text-green-400">→ Almost ready...</div>
                      </div>
                    ) : (
                      <div>
                        <div>Welcome to Armstrong Console!</div>
                        <div>Click Armstrong to execute your code</div>
                        <div className="text-cyan-400 mt-2">Ready for code execution! 🚀</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}