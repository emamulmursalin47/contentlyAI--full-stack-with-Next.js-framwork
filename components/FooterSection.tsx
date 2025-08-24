'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FooterSection() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-[#0f0c29] text-[#EBD3F8] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
          <div className="flex items-center justify-center h-16 w-32 rounded-2xl bg-transparent backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{
              boxShadow: "0 4px 16px rgba(122, 28, 172, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
           <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">Contently</span>
              </div>
          </div>
        </Link>
          </div>
          
          {/* Links Section */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link 
              href="/login" 
              className="text-[#AD49E1] hover:text-[#7950f2] transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="text-[#AD49E1] hover:text-[#7950f2] transition-colors"
            >
              Register
            </Link>
          </div>
          
          {/* Copyright Section */}
          <div className="text-sm text-[#AD49E1] text-center">
            <p>&copy; {new Date().getFullYear()} Contently AI. Made with ❤️ by Mursalin</p>
          </div>
        </div>
      </div>
    </footer>
  );
}