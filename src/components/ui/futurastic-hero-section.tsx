import React, { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { SimplePreviewTooltip } from "../SimplePreviewTooltip";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

interface AuroraHeroProps {
  hideText?: boolean;
  onGetStarted?: () => void;
  useProactiveMode?: boolean;
}

export const AuroraHero = ({ hideText = false, onGetStarted, useProactiveMode = false }: AuroraHeroProps) => {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
    >
      {!hideText && (
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <img 
              src="https://automationalien.s3.us-east-1.amazonaws.com/notextwhite.png" 
              alt="ToolTip Companion Logo" 
              className="w-24 h-24"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight"
          >
            ToolTip Companion v1.0
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed"
          >
            Beautiful Interactive Tooltips for React
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 max-w-2xl text-center text-sm text-gray-400 leading-relaxed"
          >
            Mouse over any button or link to reveal its content
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SimplePreviewTooltip
            targetUrl={window.location.href}
            elementId="get-started-button"
          >
            <motion.button
              id="get-started-button"
              onClick={onGetStarted}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                border,
                boxShadow,
              }}
              whileHover={{
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.985,
              }}
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-6 py-3 text-gray-50 transition-colors hover:bg-gray-950/50 text-lg font-semibold"
            >
              Try the Extension
              <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
            </motion.button>
          </SimplePreviewTooltip>
            
            <SimplePreviewTooltip
              targetUrl={window.location.href}
              elementId="view-documentation-button"
            >
              <motion.a
                id="view-documentation-button"
                href="https://github.com/mcpmessenger/ToolTip"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="group relative flex w-fit items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 text-gray-50 transition-all hover:bg-white/20 hover:border-white/30 text-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </motion.a>
            </SimplePreviewTooltip>
          </div>
        </div>
      )}

      {/* CSS Animated Stars Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 5 === 0 ? '#CE84CF' : i % 3 === 0 ? '#1E67C6' : i % 2 === 0 ? '#13FFAA' : 'white',
              boxShadow: i % 5 === 0 ? '0 0 6px #CE84CF' : i % 3 === 0 ? '0 0 6px #1E67C6' : i % 2 === 0 ? '0 0 6px #13FFAA' : '0 0 6px rgba(255, 255, 255, 0.8)',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};
