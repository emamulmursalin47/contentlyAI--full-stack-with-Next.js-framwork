
'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[90h] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Background elements */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-4">
            Demos
          </h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            Explore our product demonstrations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 rounded-2xl shadow-xl overflow-hidden">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
                {/* Video removed as per user request */}
              </div>
              
              
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Key Features Card */}
            <div className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-indigo-100 mb-4">Features</h3>
              <ul className="space-y-3">
                {[
                  "AI-powered content generation",
                  "Multi-platform optimization",
                  "Real-time collaboration",
                  "Advanced analytics dashboard",
                  "Custom templates library"
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="w-2 h-2 rounded-full bg-[#7950f2]"></div>
                    </div>
                    <span className="text-indigo-200">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-[#5f3dc4]/20 to-[#7950f2]/20 backdrop-blur-sm border border-indigo-700/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-indigo-100 mb-4">Ready to get started?</h3>
              <p className="text-indigo-200 mb-6">
                Start creating with us today.
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-[0_0_20px_5px_rgba(124,58,237,0.3)] transition-all duration-300">
                  Start Creating Free
                </Button>
              </motion.div>
            </div>

            
          </motion.div>
        </div>

        
      </div>
    </div>
  );
}