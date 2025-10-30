import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Chrome, Monitor } from 'lucide-react';

const ProjectShowcase: React.FC = () => {
  const projects = [
    {
      id: 'teenyai',
      title: 'TeenyAI Desktop App',
      description: 'AI-Powered Desktop Browser with Intelligent Web Analysis',
      icon: Monitor,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      features: [
        '🧠 AI Chat Assistant',
        '🎯 Predictive Hover Previews',
        '🌙 Dark/Light Mode',
        '⚡ Lightweight & Fast'
      ],
      link: 'https://github.com/mcpmessenger/TeenyAI',
      linkText: 'View on GitHub'
    },
    {
      id: 'tooltip-browser',
      title: 'ToolTip Companion Browser',
      description: 'Chromium Fork with Advanced Web Interaction Features',
      icon: Github,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      features: [
        '🎯 Proactive Screenshot Capture',
        '🔍 Smart Element Detection',
        '📸 High-Quality Screenshots',
        '💾 Local Storage Caching'
      ],
      link: 'https://github.com/mcpmessenger/ToolTip_Companion_Browser',
      linkText: 'View on GitHub'
    },
    {
      id: 'chrome-extension',
      title: 'Chrome Extension',
      description: 'Universal Browser Extension for Any Website',
      icon: Chrome,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      features: [
        '🌍 Universal Compatibility',
        '⚡ Native Performance',
        '💾 Persistent Settings',
        '🔒 Privacy Focused'
      ],
      link: 'https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm?utm_source=item-share-cb',
      linkText: 'Install from Chrome Web Store'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-6">
            ToolTip Companion Suite
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect solution for your needs - from desktop apps to browser extensions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative group ${project.bgColor} ${project.borderColor} border rounded-2xl p-8 backdrop-blur-sm hover:scale-105 transition-all duration-300`}
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${project.color} mr-4`}>
                  <project.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {project.description}
              </p>

              <div className="space-y-2 mb-6">
                {project.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors group-hover:gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-semibold">{project.linkText}</span>
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            All projects are part of ToolTip Companion and work together seamlessly
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>🤖 AI-Powered Analysis</span>
            <span>•</span>
            <span>🎯 Proactive Screenshots</span>
            <span>•</span>
            <span>🌍 Universal Compatibility</span>
            <span>•</span>
            <span>⚡ High Performance</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
