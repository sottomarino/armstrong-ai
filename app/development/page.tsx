// @ts-nocheck
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Code, 
  Terminal, 
  Rocket, 
  Users, 
  Zap, 
  Target,
  CheckCircle,
  Clock,
  GitBranch,
  Database,
  Server,
  Globe
} from 'lucide-react';

export default function DevelopmentPage() {
  const developmentPhases = [
    {
      phase: "Phase 1",
      title: "Foundation Setup",
      status: "completed",
      items: [
        "✅ GitHub repository creation (armstrong-ai)",
        "✅ Next.js 14 App Router setup",
        "✅ TypeScript configuration",
        "✅ Tailwind CSS integration",
        "✅ Framer Motion animations",
        "✅ Lucide React icons"
      ]
    },
    {
      phase: "Phase 2", 
      title: "Frontend Implementation",
      status: "completed",
      items: [
        "✅ Armstrong Code Executor component",
        "✅ Interactive stretch animations",
        "✅ Code editor with line numbers",
        "✅ Real-time terminal simulation",
        "✅ Multi-language support UI",
        "✅ Responsive design implementation"
      ]
    },
    {
      phase: "Phase 3",
      title: "Deployment & UI Polish",
      status: "completed", 
      items: [
        "✅ Vercel deployment setup",
        "✅ Armstrong head image integration",
        "✅ Minimalist button design",
        "✅ GitHub link integration",
        "✅ Development/Docs pages",
        "✅ Professional header design"
      ]
    },
    {
      phase: "Phase 4",
      title: "Backend Development",
      status: "planned",
      items: [
        "🔄 Node.js API server setup",
        "🔄 Real code execution engine", 
        "🔄 Docker containers for security",
        "🔄 Database integration (Supabase)",
        "🔄 User session management",
        "🔄 File operations API"
      ]
    },
    {
      phase: "Phase 5",
      title: "Advanced Features",
      status: "planned",
      items: [
        "📋 E2B-style sandbox integration",
        "📋 Real Python/JS execution",
        "📋 File system operations",
        "📋 Code sharing & collaboration",
        "📋 Project templates",
        "📋 Advanced error handling"
      ]
    }
  ];

  const techStack = [
    { name: "Frontend", tech: "Next.js 14 + TypeScript", status: "active" },
    { name: "Styling", tech: "Tailwind CSS", status: "active" },
    { name: "Animations", tech: "Framer Motion", status: "active" },
    { name: "Icons", tech: "Lucide React", status: "active" },
    { name: "Deployment", tech: "Vercel", status: "active" },
    { name: "Backend", tech: "Node.js + Express", status: "planned" },
    { name: "Database", tech: "Supabase PostgreSQL", status: "planned" },
    { name: "Execution", tech: "Docker + E2B", status: "planned" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
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
          <h1 className="text-2xl font-bold">🚀 Development Center</h1>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-8">
        {/* Project Overview */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Target className="mr-3 text-blue-400" />
            Armstrong AI Development Status
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-lg text-gray-300 mb-4">
              Armstrong AI is a modern code execution platform inspired by E2B.dev, 
              featuring advanced animations and real-time code processing capabilities.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">3</div>
                <div className="text-sm text-gray-400">Phases Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-sm text-gray-400">Phases Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">8</div>
                <div className="text-sm text-gray-400">Tech Stack Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-sm text-gray-400">Frontend Complete</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Development Phases */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <GitBranch className="mr-3 text-purple-400" />
            Development Phases
          </h2>
          <div className="space-y-6">
            {developmentPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${
                  phase.status === 'completed' ? 'border-green-400/50' :
                  phase.status === 'planned' ? 'border-blue-400/50' : 'border-yellow-400/50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center">
                    {phase.status === 'completed' && <CheckCircle className="mr-2 text-green-400" size={24} />}
                    {phase.status === 'planned' && <Clock className="mr-2 text-blue-400" size={24} />}
                    {phase.phase}: {phase.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    phase.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    phase.status === 'planned' ? 'bg-blue-400/20 text-blue-400' : 'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {phase.status.toUpperCase()}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li key={i} className="text-gray-300 flex items-start">
                      <span className="mr-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Code className="mr-3 text-green-400" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((item, index) => (
              <motion.div
                key={item.name}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${
                  item.status === 'active' ? 'border-green-400/50' : 'border-blue-400/50'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.name}</h4>
                  <span className={`w-3 h-3 rounded-full ${
                    item.status === 'active' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                </div>
                <p className="text-sm text-gray-400">{item.tech}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Next Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Rocket className="mr-3 text-red-400" />
            Next Development Steps
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Server className="mx-auto mb-4 text-blue-400" size={48} />
                <h3 className="text-xl font-bold mb-2">Backend API</h3>
                <p className="text-gray-400">Setup Node.js server with Express for real code execution</p>
              </div>
              <div className="text-center">
                <Database className="mx-auto mb-4 text-purple-400" size={48} />
                <h3 className="text-xl font-bold mb-2">Database Integration</h3>
                <p className="text-gray-400">Supabase PostgreSQL for user sessions and project storage</p>
              </div>
              <div className="text-center">
                <Globe className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold mb-2">Production Deploy</h3>
                <p className="text-gray-400">Full stack deployment with real code execution capabilities</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}