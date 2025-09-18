import React, { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

interface AuroraHeroProps {
  hideText?: boolean;
  onGetStarted?: () => void;
}

export const AuroraHero = ({ hideText = false, onGetStarted }: AuroraHeroProps) => {
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
              src="https://automationalien.s3.us-east-1.amazonaws.com/white.png" 
              alt="ToolTip Library Logo" 
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
          <motion.button
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
            Get Started
            <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
          </motion.button>
            
            <motion.a
              href="https://github.com/your-username/tooltip-companion"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 text-gray-50 transition-all hover:bg-white/20 hover:border-white/30 text-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Documentation
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </motion.a>
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
