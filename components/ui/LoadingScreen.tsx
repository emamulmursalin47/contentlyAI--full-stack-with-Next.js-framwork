'use client';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="text-center">
        <div className="relative">
          {/* Animated logo/spinner */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          
          {/* Loading spinner */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7c3aed] animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-[#e2e8f0] mb-2">ContentlyAI</h2>
        <p className="text-[#a78bfa] text-sm">Loading your AI-powered content platform...</p>
        
        {/* Progress indicator */}
        <div className="mt-6 w-48 h-1 bg-[#4c1d95] rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
