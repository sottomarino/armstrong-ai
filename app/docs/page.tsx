// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  Code, 
  Terminal, 
  Rocket, 
  Settings, 
  Download,
  Play,
  FileText,
  Zap,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    javascript: `// Armstrong JavaScript Example
function greetArmstrong() {
    console.log("Hello from Armstrong! 🤖");
    console.log("Code execution successful!");
    return "Armstrong is ready to stretch!";
}

// Execute the function
const result = greetArmstrong();
console.log(result);

// Advanced example with async
async function armstrongPower() {
    const data = await fetch('/api/armstrong');
    const result = await data.json();
    console.log("Armstrong Power Level:", result.power);
}`,

    python: `# Armstrong Python Example
def greet_armstrong():
    print("Hello from Armstrong! 🐍")
    print("Python execution successful!")
    return "Armstrong Python Power Activated!"

# Execute the function
result = greet_armstrong()
print(result)

# Advanced example with data processing
import json

def armstrong_data_analysis(data):
    """Process data with Armstrong power"""
    processed = []
    for item in data:
        processed.append({
            'value': item * 2,
            'armstrong_boost': True
        })
    return processed`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Armstrong HTML Example</title>
    <style>
        .armstrong-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .armstrong-header {
            background: linear-gradient(45deg, #113448, #2563eb);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="armstrong-container">
        <div class="armstrong-header">
            <h1>🤖 Armstrong HTML Power</h1>
            <p>Advanced HTML processing with Armstrong</p>
        </div>
        <main>
            <h2>Features</h2>
            <ul>
                <li>Real-time HTML rendering</li>
                <li>CSS integration</li>
                <li>JavaScript execution</li>
            </ul>
        </main>
    </div>
</body>
</html>`
  };

  const features = [
    {
      icon: <Code className="text-blue-400" size={24} />,
      title: "Multi-Language Support",
      description: "Execute JavaScript, Python, HTML, CSS, and JSON with real-time feedback"
    },
    {
      icon: <Terminal className="text-green-400" size={24} />,
      title: "Interactive Terminal",
      description: "Real-time console output with syntax highlighting and error handling"
    },
    {
      icon: <Zap className="text-yellow-400" size={24} />,
      title: "Armstrong Animations",
      description: "Unique stretch animations and visual feedback during code execution"
    },
    {
      icon: <FileText className="text-purple-400" size={24} />,
      title: "Project Management",
      description: "Save, load, and share code projects with integrated file operations"
    }
  ];

  const quickStart = [
    "Open Armstrong AI in your browser",
    "Select your preferred programming language",
    "Write your code in the editor",
    "Click Armstrong to execute your code",
    "View results in the real-time terminal"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <motion.header 
        className="border-b border-white/20 p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => window.close()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowLeft size={20} />
              <span>Back to Armstrong</span>
            </motion.button>
          </div>
          <h1 className="text-2xl font-bold">📚 Documentation</h1>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-8">
        {/* Introduction */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-4xl font-bold mb-6 flex items-center">
            <Book className="mr-3 text-blue-400" />
            Armstrong AI Documentation
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-lg text-gray-300 mb-4">
              Welcome to Armstrong AI - an advanced code execution platform with stretch power! 
              This documentation will help you get started and make the most of Armstrong's capabilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                Real-time Execution
              </span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                Multi-language
              </span>
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                Advanced Animations
              </span>
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                Open Source
              </span>
            </div>
          </div>
        </motion.section>

        {/* Quick Start */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Rocket className="mr-3 text-green-400" />
            Quick Start Guide
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Getting Started</h3>
                <ol className="space-y-3">
                  {quickStart.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {feature.icon}
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Code Examples */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Code className="mr-3 text-purple-400" />
            Code Examples
          </h2>
          <div className="space-y-6">
            {Object.entries(codeExamples).map(([language, code]) => (
              <div key={language} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                  <h3 className="text-lg font-bold capitalize flex items-center">
                    <span className="mr-2">
                      {language === 'javascript' && '⚡'}
                      {language === 'python' && '🐍'}
                      {language === 'html' && '🌐'}
                    </span>
                    {language.toUpperCase()} Example
                  </h3>
                  <motion.button
                    onClick={() => copyToClipboard(code, language)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedCode === language ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono">
                    {code}
                  </code>
                </pre>
              </div>
            ))}
          </div>
        </motion.section>

        {/* API Reference */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Settings className="mr-3 text-yellow-400" />
            API Reference
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Available Endpoints</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <code className="text-green-400 font-mono">POST /api/execute</code>
                    <p className="text-sm text-gray-400 mt-2">Execute code with Armstrong engine</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <code className="text-blue-400 font-mono">GET /api/status</code>
                    <p className="text-sm text-gray-400 mt-2">Check Armstrong system status</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <code className="text-purple-400 font-mono">POST /api/projects</code>
                    <p className="text-sm text-gray-400 mt-2">Save and manage projects</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Supported Languages</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">🐍</span>
                    <span>Python 3.x</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400">🌐</span>
                    <span>HTML5</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400">🎨</span>
                    <span>CSS3</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-400">📋</span>
                    <span>JSON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="text-center py-8 border-t border-white/20 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-400">
            Armstrong AI v1.0 - Advanced Code Execution Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with Next.js, TypeScript, and Armstrong Power 💪
          </p>
        </motion.footer>
      </div>
    </div>
  );
}