'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Star } from 'lucide-react';
import { WavyBackground } from './ui/wavy-background';

export default function HeroSection() {
  const text = "Contently AI";
  const words = text.split(" ");
  
  return (
    <WavyBackground
      className="min-h-screen flex items-center justify-center relative"
      backgroundFill="#0a0a1a"
      waveWidth={100}
      colors={["#1e1b4b", "#312e81", "#4c1d95", "#5b21b6", "#6d28d9"]}
      blur={10}
      speed="slow"
      waveOpacity={0.3}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0"></div>
      
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 text-center">
        {/* Main heading with refined typography */}
        <h1
          className="text-2xl xs:text-3xl sm:text-4xl md:text-7xl font-bold mb-6 sm:mb-8 pt-8 xs:pt-10 sm:pt-12 md:pt-20 leading-tight"
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-0.5 sm:mr-1 md:mr-2"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200">
                {word}
              </span>
            </span>
          ))}
        </h1>
        
        {/* Subtitle with elegant divider */}
        <div
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-px bg-indigo-700/30 w-12 sm:w-16"></div>
            <span className="text-indigo-300 text-xs sm:text-sm font-medium tracking-wider uppercase">AI-Powered Excellence</span>
            <div className="h-px bg-indigo-700/30 w-12 sm:w-16"></div>
          </div>
          
          <p className="text-sm sm:text-base md:text-2xl text-indigo-100 font-light max-w-3xl mx-auto leading-relaxed px-2">
            Your ultimate AI-powered content creation companion
          </p>
        </div>
        
        {/* Description with refined styling */}
        <p
          className="text-xs sm:text-sm md:text-lg text-indigo-200/80 mb-8 sm:mb-10 md:mb-14 max-w-2xl mx-auto leading-relaxed px-4"
        >
          Generate captivating social media posts, engaging captions, and compelling copy in seconds,
          tailored for every platform.
        </p>
        
        {/* CTA buttons with sophisticated design */}
        <div
          className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center w-full px-4"
        >
          <div
            className="relative group transition-transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition "></div>
            <Link 
              href="/register" 
              className="relative flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-indigo-900 rounded-xl leading-none w-full"
            >
              <span className="text-indigo-50 font-medium text-sm sm:text-base">Start Creating Free</span>
              <ArrowRight className="ml-1 h-5 w-5 text-indigo-300 group-hover:text-white transition-colors" />
            </Link>
          </div>
          
          <div
            className="relative group transition-transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-600/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition "></div>
            <Link 
              href="/login" 
              className="relative flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-indigo-900/30 backdrop-blur-sm border border-indigo-700/30 rounded-xl leading-none w-full"
            >
              <span className="text-indigo-200 font-medium text-sm sm:text-base">Sign In</span>
              <Zap className="ml-1 h-5 w-5 text-indigo-300 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
        
        {/* Feature tags with refined design */}
        <div
          className="mt-10 sm:mt-12 md:mt-16 flex flex-wrap justify-center gap-2 sm:gap-3 px-4"
        >
          {["AI-Powered", "Multi-Platform", "Time-Saving", "SEO Optimized"].map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm border border-indigo-700/20 rounded-full transition-all hover:bg-indigo-700/20 hover:-translate-y-1"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
              <span className="text-indigo-200 text-xs sm:text-sm font-medium">{tag}</span>
            </div>
          ))}
        </div>
        
        {/* Subtle decorative elements */}
        <div className="hidden md:block absolute top-10 left-10 w-20 h-20 rounded-full bg-purple-500/10 blur-xl"></div>
        <div className="hidden md:block absolute bottom-20 right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"></div>
      </div>
    </WavyBackground>
  );
}