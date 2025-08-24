'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { WavyBackground } from './ui/wavy-background';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const text = "Welcome to Contently AI";
  const words = text.split(" ");

  return (
    <WavyBackground
      className="min-h-screen overflow-y-auto pt-16 flex items-center justify-center"
      backgroundFill="#2E073F"
      waveWidth={60}
      colors={["#7A1CAC", "#AD49E1", "#EBD3F8"]}
    >
      <div className="text-center z-20">
        <motion.h1
          className="text-5xl sm:text-7xl font-bold text-[#EBD3F8] mb-6 leading-tight"
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
            className="text-2xl text-[#AD49E1] mb-4 max-w-3xl mx-auto"
          >
            Your ultimate AI-powered content creation companion.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeInOut' }}
            className="text-xl text-[#EBD3F8] mb-8 max-w-2xl mx-auto"
          >
            Generate captivating social media posts, engaging captions, and compelling copy in seconds,
            tailored for every platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeInOut' }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-[#EBD3F8] inline-block">
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-transparent py-2 px-4 ring-1 ring-white/10 ">
                <span>
                  <Link href="/register">Start Creating Free</Link>
                </span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#AD49E1]/0 via-[#AD49E1]/90 to-[#AD49E1]/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
            <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-[#EBD3F8] inline-block">
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-transparent py-2 px-4 ring-1 ring-white/10 ">
                <span>
                  <Link href="/login">Sign In</Link>
                </span>
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.75 8.75L14.25 12L10.75 15.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#AD49E1]/0 via-[#AD49E1]/90 to-[#AD49E1]/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </motion.div>
        </div>
      </WavyBackground>
  );
}
