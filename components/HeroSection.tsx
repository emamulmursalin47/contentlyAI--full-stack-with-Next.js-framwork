'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';
import { WavyBackground } from './ui/wavy-background';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const text = "Welcome to Contently AI";
  const words = text.split(" ");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WavyBackground
      className="min-h-screen overflow-y-auto pt-16 flex items-center justify-center"
      backgroundFill="#0f0c29"
      waveWidth={80}
      colors={["#302b63", "#24243e", "#5f3dc4", "#7950f2", "#9775fa"]}
      blur={12}
      speed="medium"
      waveOpacity={0.4}
    >
      {/* Floating elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div> */}

      <div className="text-center z-20 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-indigo-900/30 backdrop-blur-sm border border-indigo-700/50 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="h-5 w-5 text-indigo-300" />
          <span className="text-indigo-200 font-medium">Revolutionizing Content Creation</span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-6 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="inline-block"
            >
              {word}{" "}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-indigo-700/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-transparent text-indigo-300 text-lg font-medium">AI-Powered Excellence</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeInOut' }}
          className="text-xl md:text-2xl text-indigo-200 mb-8 max-w-3xl mx-auto mt-8"
        >
          Your ultimate AI-powered content creation companion.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeInOut' }}
          className="text-lg md:text-xl text-indigo-100/80 mb-12 max-w-2xl mx-auto"
        >
          Generate captivating social media posts, engaging captions, and compelling copy in seconds,
          tailored for every platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: 'easeInOut' }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <Link href="/register" className="relative flex items-center gap-2 px-8 py-4 bg-indigo-900 rounded-lg leading-none ">
              <span className="text-indigo-100 font-semibold text-lg">Start Creating Free</span>
              <ArrowRight className="ml-2 h-5 w-5 text-indigo-300" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent to-indigo-600/30 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Link href="/login" className="relative flex items-center gap-2 px-8 py-4 bg-indigo-900/50 backdrop-blur-sm border border-indigo-700/50 rounded-lg leading-none">
              <span className="text-indigo-200 font-medium text-lg">Sign In</span>
              <Zap className="ml-2 h-5 w-5 text-indigo-300" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {["AI-Powered", "Multi-Platform", "Time-Saving", "SEO Optimized"].map((tag, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/30 backdrop-blur-sm border border-indigo-700/30 rounded-full"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
            >
              <Star className="h-4 w-4 text-indigo-400" />
              <span className="text-indigo-200 text-sm">{tag}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </WavyBackground>
  );
}

