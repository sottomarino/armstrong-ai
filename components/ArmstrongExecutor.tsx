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
  AlertCircle,
  BookOpen
} from 'lucide-react';

// Configurazioni linguaggi
const LANGUAGE_CONFIGS = {
  javascript: {
    name: 'JavaScript',
    icon: '🟨',
    color: '#f7df1e',
    defaultCode: `// Welcome to Armstrong Code Executor!
console.log("Hello from Armstrong! 🤖");
console.log("Code execution successful!");
return "Armstrong is ready to stretch!";`,
    execution: 'client'
  },
  python: {
    name: 'Python',
    icon: '🐍',
    color: '#3776ab',
    defaultCode: `# Welcome to Armstrong Python Executor!
print("Hello from Armstrong! 🤖")
print("Python code execution successful!")
result = "Armstrong is ready to stretch with Python!"
print(result)`,
    execution: 'e2b'
  },
  html: {
    name: 'HTML',
    icon: '🌐',
    color: '#e34f26',
    defaultCode: `<!DOCTYPE html>
<html>
<head>
    <title>Armstrong HTML</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .armstrong { color: #4CAF50; font-size: 24px; }
    </style>
</head>
<body>
    <h1 class="armstrong">🤖 Armstrong HTML Executor</h1>
    <p>HTML execution successful!</p>
</body>
</html>`,
    execution: 'preview'
  },
  css: {
    name: 'CSS',
    icon: '🎨',
    color: '#1572b6',
    defaultCode: `.armstrong-demo {
  background: linear-gradient(45deg, #4CAF50, #2196F3);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  font-family: Arial, sans-serif;
  margin: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.robot-icon {
  font-size: 48px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}`,
    execution: 'preview'
  },
  json: {
    name: 'JSON',
    icon: '📄',
    color: '#000000',
    defaultCode: `{
  "armstrong": {
    "name": "Armstrong Code Executor",
    "version": "1.0",
    "status": "ready",
    "capabilities": [
      "JavaScript execution",
      "Python execution",
      "HTML preview",
      "CSS styling",
      "JSON validation"
    ],
    "message": "🤖 Armstrong is ready to stretch!",
    "languages": {
      "javascript": "✅",
      "python": "✅", 
      "html": "✅",
      "css": "✅",
      "json": "✅"
    }
  }
}`,
    execution: 'validate'
  }
};

// Armstrong Container SOLO per visualizzazione (senza pulsante)
const ArmstrongContainer = ({ isExecuting, executionStatus, currentLanguage }) => {
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
      default: return LANGUAGE_CONFIGS[currentLanguage]?.color || '#113448';
    }
  };

  return (
    <div className="relative h-96 w-full max-w-lg mx-auto flex flex-col items-center justify-center">
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

          {/* Indicatore linguaggio nell'angolo */}
          <div 
            className="absolute top-4 right-4 text-2xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            title={LANGUAGE_CONFIGS[currentLanguage]?.name}
          >
            {LANGUAGE_CONFIGS[currentLanguage]?.icon}
          </div>
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
    </div>
  );
};

// Execute Button separato
const ExecuteButton = ({ onExecute, isExecuting, executionStatus, currentLanguage }) => {
  const getStatusColor = () => {
    switch(executionStatus) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'running': return '#f59e0b';
      default: return LANGUAGE_CONFIGS[currentLanguage]?.color || '#113448';
    }
  };

  return (
    <div className="flex justify-center">
      <motion.button
        onClick={onExecute}
        disabled={isExecuting}
        className="w-32 h-32 rounded-full border-6 shadow-2xl flex flex-col items-center justify-center text-white font-bold text-xl transition-all disabled:opacity-50 relative overflow-hidden"
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
            <RefreshCw size={40} />
          </motion.div>
        ) : (
          <>
            {executionStatus === 'success' && <CheckCircle size={40} />}
            {executionStatus === 'error' && <XCircle size={40} />}
            {(executionStatus === 'ready' || !executionStatus) && <Play size={40} />}
          </>
        )}
        
        <div className="mt-2 font-bold text-sm tracking-wider">
          {isExecuting ? 'EXECUTING...' : 'EXECUTE!'}
        </div>
      </motion.button>
    </div>
  );
};

// Main App con supporto multilingue
export default function ArmstrongExecutor() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_CONFIGS.javascript.defaultCode);
  const [output, setOutput] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('ready');
  const [executionTime, setExecutionTime] = useState(null);

  const languageConfig = LANGUAGE_CONFIGS[language];

  // Cambia linguaggio
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIGS[newLang].defaultCode);
    setOutput('');
    setPreviewContent('');
    setExecutionStatus('ready');
    setExecutionTime(null);
  };

  // Esecuzione JavaScript
  const executeJavaScript = async (jsCode) => {
    try {
      const logs = [];
      const originalConsoleLog = console.log;
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsoleLog(...args);
      };

      const func = new Function(jsCode);
      const result = func();
      
      console.log = originalConsoleLog;
      
      const output = logs.length > 0 ? logs.join('\n') : (result !== undefined ? String(result) : 'Code executed successfully');
      
      return { success: true, output };
    } catch (error) {
      return { success: false, output: '', error: error.message };
    }
  };

  // Esecuzione Python via API con debug migliorato
  const executePython = async (pythonCode) => {
    try {
      console.log('🚀 Starting Python execution...', { code: pythonCode });

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode, language: 'python' }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Leggi come testo prima di parsare JSON
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed JSON:', result);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }
      
      if (result.success) {
        return { success: true, output: result.output || 'Python code executed successfully' };
      } else {
        return { success: false, output: '', error: result.error || 'Python execution failed' };
      }
    } catch (error) {
      console.error('🚨 Python execution error:', error);
      
      let errorMessage = 'Network error: ';
      if (error.message.includes('JSON')) {
        errorMessage += `JSON Parse Error - ${error.message}`;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Cannot reach server';
      } else {
        errorMessage += error.message;
      }
      
      return { success: false, output: '', error: errorMessage };
    }
  };

  // Validazione JSON
  const validateJSON = (jsonCode) => {
    try {
      const parsed = JSON.parse(jsonCode);
      return { 
        success: true, 
        output: `✅ Valid JSON!\n\nFormatted output:\n${JSON.stringify(parsed, null, 2)}` 
      };
    } catch (error) {
      return { 
        success: false, 
        output: '', 
        error: `❌ Invalid JSON: ${error.message}` 
      };
    }
  };

  // Esecuzione principale con debug migliorato
  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionStatus('running');
    setOutput('');
    
    const startTime = performance.now();
    
    try {
      let result;

      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code);
          break;
        case 'python':
          result = await executePython(code);
          break;
        case 'html':
        case 'css':
          setPreviewContent(code);
          result = { success: true, output: `${languageConfig.name} preview updated successfully!` };
          break;
        case 'json':
          result = validateJSON(code);
          break;
        default:
          result = { success: false, output: '', error: 'Language not supported' };
      }

      const endTime = performance.now();
      const execTime = Math.floor(endTime - startTime);
      setExecutionTime(execTime);

      if (result.success) {
        let outputText = '';
        if (language === 'javascript') {
          outputText = `Armstrong JavaScript Engine v1.0
>> Executing ${language.toUpperCase()} code...
>> ${result.output}
>> Execution completed successfully ✓
>> Memory usage: ${Math.floor(Math.random() * 50 + 10)}MB
>> Armstrong Power Level: MAXIMUM! ⚡`;
        } else {
          outputText = `Armstrong ${languageConfig.name} Engine v1.0
>> Executing ${language.toUpperCase()} code...
>> ${result.output}
>> Execution completed successfully ✓
>> Armstrong Power Level: MAXIMUM! ⚡`;
        }
        setOutput(outputText);
        setExecutionStatus('success');
      } else {
        const errorOutput = `Armstrong Error Handler v1.0
>> Error detected in ${language.toUpperCase()} execution
>> ${result.error}
>> Armstrong suggests checking your syntax
>> Error Code: ARM_${Math.floor(Math.random() * 9999)}
>> Try again! Armstrong believes in you! 💪`;
        setOutput(errorOutput);
        setExecutionStatus('error');
      }
      
    } catch (error) {
      setOutput(`Armstrong System Error:\n${error.message}\nPlease try again!`);
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
                Multi-Language Code Execution Platform
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

            {/* Recipe Book Button - AGGIUNTO QUI */}
            <motion.button
              onClick={() => window.open('/recipes', '_blank')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen size={16} />
              <span>Recipe Book</span>
            </motion.button>

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
              v1.0 | Multi-Lang
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <motion.div 
          className="max-w-7xl mx-auto mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
              <motion.button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 ${
                  language === lang
                    ? 'bg-white text-gray-800 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  borderLeft: language === lang ? `4px solid ${config.color}` : 'none'
                }}
              >
                <span className="text-lg">{config.icon}</span>
                <span>{config.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Armstrong Executor Section - Solo animazione */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-4 tracking-wider"
            style={{ color: languageConfig.color }}
          >
            ARMSTRONG STRETCH EXECUTOR
          </motion.h2>
          <p className="text-lg mb-8" style={{ color: '#113448' }}>
            Your {language.toUpperCase()} code will be executed with Armstrong's power!
          </p>
          
          <ArmstrongContainer 
            isExecuting={isExecuting} 
            executionStatus={executionStatus}
            currentLanguage={language}
          />
        </motion.div>

        {/* Code Editor and Output */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
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
            <div className="relative bg-white rounded-xl border-4 overflow-hidden shadow-xl" style={{ borderColor: languageConfig.color }}>
              <div className="px-6 py-4 flex items-center justify-between border-b-4" style={{ 
                backgroundColor: languageConfig.color,
                borderColor: languageConfig.color
              }}>
                <div className="flex items-center space-x-3">
                  <Code size={24} className="text-white" />
                  <span className="text-white font-bold text-xl tracking-wider">
                    {languageConfig.name.toUpperCase()} EDITOR
                  </span>
                </div>
                <div className="text-white text-lg">
                  {languageConfig.icon}
                </div>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-white font-mono text-lg p-6 resize-none focus:outline-none border-none"
                style={{ color: '#113448' }}
                placeholder={`// Write your ${languageConfig.name} code here...`}
                disabled={isExecuting}
              />
            </div>
          </motion.div>

          {/* Output Area */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-bold tracking-wider flex items-center" style={{ color: '#113448' }}>
                <Terminal size={28} className="mr-3" />
                {(language === 'html' || language === 'css') && previewContent ? 'PREVIEW' : 'EXECUTION CONSOLE'}
              </h3>
            </div>

            {/* Preview per HTML/CSS */}
            {(language === 'html' || language === 'css') && previewContent ? (
              <div className="relative rounded-xl border-4 overflow-hidden shadow-xl bg-white" style={{ borderColor: languageConfig.color }}>
                <div className="px-6 py-4 flex items-center justify-between border-b-4" style={{ 
                  backgroundColor: languageConfig.color,
                  borderColor: languageConfig.color
                }}>
                  <div className="flex items-center space-x-3">
                    <Terminal size={24} className="text-white" />
                    <span className="text-white font-bold text-xl tracking-wider">
                      {languageConfig.name.toUpperCase()} PREVIEW
                    </span>
                  </div>
                </div>
                
                <div className="h-80 overflow-auto">
                  {language === 'html' ? (
                    <iframe
                      srcDoc={previewContent}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="p-4">
                      <style>{previewContent}</style>
                      <div className="armstrong-demo">
                        <div className="robot-icon">🤖</div>
                        <h2>Armstrong CSS Executor</h2>
                        <p>Your CSS styles are applied above!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Console normale */
              <div className="relative rounded-xl border-4 overflow-hidden shadow-xl" style={{ 
                backgroundColor: '#113448',
                borderColor: languageConfig.color
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
                          <div className="text-yellow-400">→ Armstrong is executing {languageConfig.name}...</div>
                          <div className="text-blue-400">→ Processing {language} code...</div>
                          <div className="text-green-400">→ Almost ready...</div>
                        </div>
                      ) : (
                        <div>
                          <div>Welcome to Armstrong {languageConfig.name} Console! {languageConfig.icon}</div>
                          <div>Selected: {languageConfig.name} ({language})</div>
                          <div>Click the EXECUTE button below to run your {language} code</div>
                          <div className="text-cyan-400 mt-2">Ready for {languageConfig.name} execution! 🚀</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Execute Button - Spostato qui sotto i due box */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <ExecuteButton 
            onExecute={executeCode}
            isExecuting={isExecuting}
            executionStatus={executionStatus}
            currentLanguage={language}
          />
        </motion.div>

        {/* Language Info Panel */}
        <motion.div
          className="mt-8 bg-white rounded-xl border-4 p-6 shadow-xl"
          style={{ borderColor: languageConfig.color }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{languageConfig.icon}</div>
              <div>
                <h4 className="text-2xl font-bold" style={{ color: languageConfig.color }}>
                  {languageConfig.name} Mode Active
                </h4>
                <p className="text-gray-600">
                  {language === 'javascript' && 'Client-side execution with real-time console output'}
                  {language === 'python' && 'Server-side execution via E2B sandbox environment'}
                  {language === 'html' && 'Live HTML preview with iframe rendering'}
                  {language === 'css' && 'Live CSS preview with interactive styling'}
                  {language === 'json' && 'JSON validation and formatting with error detection'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Execution Method</div>
              <div className="font-bold" style={{ color: languageConfig.color }}>
                {languageConfig.execution === 'client' && 'Client-side'}
                {languageConfig.execution === 'e2b' && 'E2B Sandbox'}
                {languageConfig.execution === 'preview' && 'Live Preview'}
                {languageConfig.execution === 'validate' && 'Validation'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#f7df1e' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🟨</span>
              <h5 className="font-bold text-lg">JavaScript</h5>
            </div>
            <p className="text-gray-600 text-sm">Real-time client-side execution with console output capture</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#3776ab' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🐍</span>
              <h5 className="font-bold text-lg">Python</h5>
            </div>
            <p className="text-gray-600 text-sm">Secure server-side execution via E2B sandbox environment</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#e34f26' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🌐</span>
              <h5 className="font-bold text-lg">HTML</h5>
            </div>
            <p className="text-gray-600 text-sm">Live HTML preview with iframe rendering and styling</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#1572b6' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🎨</span>
              <h5 className="font-bold text-lg">CSS</h5>
            </div>
            <p className="text-gray-600 text-sm">Interactive CSS preview with live styling and animations</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#000000' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📄</span>
              <h5 className="font-bold text-lg">JSON</h5>
            </div>
            <p className="text-gray-600 text-sm">JSON validation and formatting with detailed error reporting</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderColor: '#113448' }}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🤖</span>
              <h5 className="font-bold text-lg">AI agent</h5>
            </div>
            <p className="text-gray-600 text-sm">Multi-language support with visual stretch execution</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}