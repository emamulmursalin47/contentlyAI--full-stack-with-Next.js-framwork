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
    <footer 
      className="bg-[#0a0118] text-[#e2e8f0] py-6 border-t border-[#4c1d95]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link 
              href="/"
              className="focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0118] rounded-lg"
              aria-label="ContentlyAI Home"
            >
              <div className="flex items-center justify-center h-16 w-32 rounded-2xl bg-transparent backdrop-blur-xl border border-[#4c1d95] cursor-pointer hover:border-[#7c3aed] transition-colors"
                style={{
                  boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)"
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xl">Contently</span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Links Section */}
          <nav className="flex space-x-6 mb-4 md:mb-0" aria-label="Footer navigation">
            <Link 
              href="/login" 
              className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0118] rounded-sm px-1 py-1"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0118] rounded-sm px-1 py-1"
            >
              Register
            </Link>
            <Link 
              href="/privacy" 
              className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0118] rounded-sm px-1 py-1"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0118] rounded-sm px-1 py-1"
            >
              Terms
            </Link>
          </nav>
          
          {/* Copyright Section */}
          <div className="text-sm text-[#cbd5e0] text-center">
            <p>&copy; {new Date().getFullYear()} ContentlyAI. Made with ❤️ by Mursalin</p>
          </div>
        </div>
      </div>
    </footer>
  );
}