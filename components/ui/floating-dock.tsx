'use client';
import { cn } from "@/lib/utils";
import {
  motion,
} from "motion/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon?: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const midIndex = Math.ceil(items.length / 2);
  const firstHalf = items.slice(0, midIndex);
  const secondHalf = items.slice(midIndex);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) { // Scrolling down and past a threshold
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) { // Scrolling up
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  return (
    <div className={cn("flex justify-center w-full fixed top-4 z-50 px-2 sm:px-4 py-2", className)}>
      <motion.div 
        initial={{ y: 0, opacity: 1 }} // Initial state when component mounts
        animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }} // Shorter duration for smoother hide/show
        className="flex items-center gap-1 p-1 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-sm"
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
        }}
      >
        {firstHalf.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.title}>
              <div className={cn(
                "flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all duration-200",
                isActive 
                  ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/25" 
                  : "hover:bg-slate-800/50 text-slate-200"
              )}>
                {item.icon && (
                  <div className={cn(
                    "text-sm sm:text-base",
                    isActive ? "text-white" : "text-indigo-400"
                  )}>
                    {item.icon}
                  </div>
                )}
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  item.icon ? "ml-1 sm:ml-2" : "",
                  isActive ? "text-white font-semibold" : "text-slate-200"
                )}>
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
        
         <Link href="/">
          <div className="flex items-center justify-center h-10 sm:h-12 w-20 sm:w-24 rounded-xl bg-transparent backdrop-blur-xl border border-white/20 cursor-pointer mx-1 sm:mx-2"
            style={{
              boxShadow: "0 4px 16px rgba(122, 28, 172, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">Contently</span>
              </div>
          </div>
        </Link>
        
        {secondHalf.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.title}>
              <div className={cn(
                "flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all duration-200",
                isActive 
                  ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/25" 
                  : "hover:bg-slate-800/50 text-slate-200"
              )}>
                {item.icon && (
                  <div className={cn(
                    "text-sm sm:text-base",
                    isActive ? "text-white" : "text-indigo-400"
                  )}>
                    {item.icon}
                  </div>
                )}
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  item.icon ? "ml-1 sm:ml-2" : "",
                  isActive ? "text-white font-semibold" : "text-slate-200"
                )}>
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
};