'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Play, 
  Copy, 
  Check,
  Bot,
  Search,
  Filter,
  ChevronUp,
  ExternalLink,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Copilot Microsoft Agent recipes (NEW SECTION)
const COPILOT_MICROSOFT_RECIPES = [
  {
    id: 'copilot-agent-basic',
    title: 'Copilot Microsoft Agent Demo',
    description: 'Test a simple agent interaction using Copilot Microsoft API',
    difficulty: 'Easy',
    executionTime: '~1s',
    tags: ['Copilot', 'Microsoft', 'API'],
    code: `// 🛡️ Copilot Microsoft API Agent Demo
// This is a minimal example to test agent interaction

async function testCopilotAgent() {
  const endpoint = 'https://api.copilot.microsoft.com/v1/agents';
  const payload = {
    prompt: "Say hello from Copilot Microsoft agent.",
    model: "copilot-microsoft-agent-v1"
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer <YOUR_MICROSOFT_COPILOT_API_KEY>'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log("Copilot Microsoft Agent Response:");
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error contacting Copilot Microsoft Agent:", error);
    return null;
  }
}

// 🚀 Run the demo
testCopilotAgent();
return "🎉 Copilot Microsoft Agent test completed!";`
  },
  {
    id: 'copilot-agent-advanced',
    title: 'Copilot Microsoft Advanced Agent',
    description: 'Test advanced query and context with Copilot Microsoft agent',
    difficulty: 'Medium',
    executionTime: '~2s',
    tags: ['Copilot', 'Microsoft', 'Context', 'Advanced'],
    code: `// 🛡️ Copilot Microsoft API Advanced Agent Demo
// Advanced use with context and multiple turns

async function runCopilotAdvancedAgent() {
  const endpoint = 'https://api.copilot.microsoft.com/v1/agents';
  const payload = {
    prompt: "Summarize the following text: Armstrong AI is an open platform for testing AI Copilot agents.",
    context: {
      user: "test-user",
      session: "session-123"
    },
    model: "copilot-microsoft-agent-v1"
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer <YOUR_MICROSOFT_COPILOT_API_KEY>'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log("Advanced Copilot Microsoft Agent Response:");
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error contacting Copilot Microsoft Agent:", error);
    return null;
  }
}

// 🚀 Run the advanced demo
runCopilotAdvancedAgent();
return "🎉 Advanced Copilot Microsoft Agent test completed!";`
  }
];

// Code recipes to test AI agents (YOUR ORIGINAL DATA, unchanged)
const AI_RECIPES = {
  javascript: [
    // ... All your original javascript examples ...
    // (task-manager-agent, code-analyzer-agent, data-insights-agent)
    // Not repeated here for brevity, see your original code
    // Please copy all of them as in your provided code
    // (Already present in your question)
    {
      id: 'task-manager-agent',
      title: 'Task Manager AI Agent',
      description: 'AI agent for smart task management with automatic prioritization',
      difficulty: 'Medium',
      executionTime: '~2s',
      tags: ['AI Agent', 'Task Management', 'Automation'],
      code: `// 🤖 AI Task Manager Agent - Smart Task Management
// ... (rest of the code unchanged) ...`
    },
    {
      id: 'code-analyzer-agent',
      title: 'Code Quality Analyzer Agent',
      description: 'AI agent for code quality analysis and improvement suggestions',
      difficulty: 'Hard',
      executionTime: '~3s',
      tags: ['Code Analysis', 'Quality', 'Refactoring'],
      code: `// 🔍 AI Code Quality Analyzer Agent
// ... (rest of the code unchanged) ...`
    },
    {
      id: 'data-insights-agent',
      title: 'Data Insights AI Agent',
      description: 'AI agent for data analysis and automatic insight generation',
      difficulty: 'Medium',
      executionTime: '~2s',
      tags: ['Data Analysis', 'Insights', 'ML'],
      code: `// 📊 AI Data Insights Agent
// ... (rest of the code unchanged) ...`
    }
  ],
  python: [
    // ... Your original python example ...
    // (sentiment-analyzer-agent)
    {
      id: 'sentiment-analyzer-agent',
      title: 'Sentiment Analysis AI Agent',
      description: 'AI agent for sentiment analysis and emotion classification in texts',
      difficulty: 'Medium',
      executionTime: '~3s',
      tags: ['NLP', 'Sentiment Analysis', 'AI'],
      code: `# 🎭 AI Sentiment Analysis Agent
# ... (rest of the code unchanged) ...`
    }
  ],
  copilot: COPILOT_MICROSOFT_RECIPES // <-- NEW SECTION ADDED
};

// Recipe Book Component
const RecipeBook = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [copiedRecipe, setCopiedRecipe] = useState(null);

  const currentRecipes = AI_RECIPES[selectedLanguage] || [];
  
  // Filter recipes based on search and difficulty
  const filteredRecipes = currentRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = filterDifficulty === 'all' || 
                             recipe.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  });

  // Copy code to clipboard
  const copyToClipboard = async (code, recipeId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRecipe(recipeId);
      setTimeout(() => setCopiedRecipe(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Test on Armstrong AI
  const testOnArmstrong = (code) => {
    const armstrongUrl = 'https://armstrong-ai.vercel.app/';
    window.open(armstrongUrl, '_blank');
    copyToClipboard(code, 'auto-copy');
  };

  // Test on Copilot Microsoft docs
  const testOnCopilotMicrosoft = () => {
    window.open('https://learn.microsoft.com/en-us/copilot/', '_blank');
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      html: '#e34f26',
      css: '#1572b6',
      copilot: '#0078d4' // Microsoft blue
    };
    return colors[language] || '#113448';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.header 
        className="border-b-4 p-6 shadow-lg"
        style={{ backgroundColor: '#113448', borderColor: '#113448' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <BookOpen size={32} className="text-gray-800" />
              </motion.div>
              
              <div>
                <h1 className="text-4xl font-bold text-white tracking-wider">
                  AI AGENT RECIPE BOOK
                </h1>
                <p className="text-white text-lg">
                  Test AI Copilot Agents with Ready-to-Use Code Recipes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => window.open('https://armstrong-ai.vercel.app/', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink size={16} />
                <span>Test on Armstrong</span>
              </motion.button>
              {/* Show Microsoft Copilot Docs button if copilot language selected */}
              {selectedLanguage === 'copilot' && (
                <motion.button
                  onClick={testOnCopilotMicrosoft}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShieldCheck size={16} />
                  <span>Microsoft Copilot Docs</span>
                </motion.button>
              )}
              <div className="text-white text-sm">
                v1.0 | AI Recipes
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.keys(AI_RECIPES).map((language) => (
                <motion.button
                  key={language}
                  onClick={() => {
                    setSelectedLanguage(language);
                    setSelectedRecipe(null);
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center space-x-3 ${
                    selectedLanguage === language
                      ? 'bg-white text-gray-800 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    borderLeft: selectedLanguage === language ? `4px solid ${getLanguageColor(language)}` : 'none'
                  }}
                >
                  <span className="text-lg">
                    {language === 'javascript' && '🟨'}
                    {language === 'python' && '🐍'}
                    {language === 'html' && '🌐'}
                    {language === 'css' && '🎨'}
                    {language === 'copilot' && <ShieldCheck className="text-blue-700" size={20} />}
                  </span>
                  <span className="capitalize">{language}</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">
                    {AI_RECIPES[language]?.length || 0}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Search and Filter Bar */}
        <motion.div
          className="mb-8 bg-white rounded-xl p-6 shadow-lg border-l-4"
          style={{ borderColor: getLanguageColor(selectedLanguage) }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-600" />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </motion.div>

        {selectedRecipe ? (
          /* Recipe Detail View */
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronUp className="rotate-90" size={16} />
                <span>Back to Recipes</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4" style={{ borderColor: getLanguageColor(selectedLanguage) }}>
              {/* Recipe Header */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedRecipe.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">
                      {selectedRecipe.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span 
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ backgroundColor: getDifficultyColor(selectedRecipe.difficulty) }}
                      >
                        {selectedRecipe.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-700 text-sm flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{selectedRecipe.executionTime}</span>
                      </span>
                      {selectedRecipe.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <motion.button
                      onClick={() => testOnArmstrong(selectedRecipe.code)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={16} />
                      <span>Test on Armstrong</span>
                    </motion.button>
                    {/* Show Microsoft Copilot Docs button if copilot language selected */}
                    {selectedLanguage === 'copilot' && (
                      <motion.button
                        onClick={testOnCopilotMicrosoft}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShieldCheck size={16} />
                        <span>Microsoft Copilot Docs</span>
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => copyToClipboard(selectedRecipe.code, selectedRecipe.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copiedRecipe === selectedRecipe.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                      <span>{copiedRecipe === selectedRecipe.id ? 'Copied!' : 'Copy Code'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Code Display */}
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <Code size={16} className="text-gray-300" />
                      <span className="text-gray-300 font-mono text-sm">
                        {selectedRecipe.title.toLowerCase().replace(/\s+/g, '_')}.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-xs">
                        {selectedRecipe.code.split('\n').length} lines
                      </span>
                    </div>
                  </div>
                  
                  <pre className="p-4 text-sm text-gray-100 overflow-x-auto max-h-96">
                    <code>{selectedRecipe.code}</code>
                  </pre>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="px-6 pb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-start space-x-3">
                    <Bot className="text-yellow-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">How to Test This AI Agent:</h4>
                      <ol className="text-yellow-700 text-sm space-y-1">
                        <li>1. Click "Test on Armstrong" to open Armstrong AI in a new tab</li>
                        <li>2. Clear the default code and paste this recipe</li>
                        <li>3. Click the Armstrong button to execute the code</li>
                        <li>4. Observe the AI agent behavior in the console output</li>
                        <li>5. Analyze the results and insights generated</li>
                        {selectedLanguage === 'copilot' && (
                          <li>6. For Copilot Microsoft, see documentation and API key setup in Microsoft Docs</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Recipe Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4"
                  style={{ borderColor: getLanguageColor(selectedLanguage) }}
                  onClick={() => setSelectedRecipe(recipe)}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                          {recipe.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {selectedLanguage === 'copilot' ? (
                          <ShieldCheck size={24} className="text-blue-700" />
                        ) : (
                          <Bot size={24} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span 
                        className="px-2 py-1 rounded text-white text-xs font-semibold"
                        style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                      >
                        {recipe.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 rounded text-gray-700 text-xs flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{recipe.executionTime}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          testOnArmstrong(recipe.code);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center space-x-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={14} />
                        <span>Test</span>
                      </motion.button>
                      {selectedLanguage === 'copilot' && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            testOnCopilotMicrosoft();
                          }}
                          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center space-x-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ShieldCheck size={14} />
                          <span>Docs</span>
                        </motion.button>
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(recipe.code, recipe.id);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center space-x-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copiedRecipe === recipe.id ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>{copiedRecipe === recipe.id ? 'Copied!' : 'Copy'}</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or difficulty filter
            </p>
          </motion.div>
        )}

        <motion.div
          className="mt-12 bg-white rounded-xl p-6 shadow-lg border-l-4"
          style={{ borderColor: getLanguageColor(selectedLanguage) }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                🤖 AI Agent Recipe Book
              </h4>
              <p className="text-gray-600">
                Ready-to-use code recipes for testing AI Copilot agents on Armstrong AI platform and Microsoft Copilot.
                Each recipe demonstrates different AI capabilities and can be executed directly.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: getLanguageColor(selectedLanguage) }}>
                {currentRecipes.length}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {selectedLanguage} Recipes
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecipeBook;