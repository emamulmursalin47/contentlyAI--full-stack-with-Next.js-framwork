'use client';
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      <FloatingDockDesktop items={items} />
      <FloatingDockMobile items={items} />
    </div>
  );
};

const FloatingDockMobile = ({
  items,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
}) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="block md:hidden relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-3 text-white bg-transparent backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg flex flex-col gap-1 z-50"
            style={{
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
            {items.map((item) => (
              <Link href={item.href} key={item.title}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl text-white  transition-colors">
                  
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-transparent backdrop-blur-xl border border-white/20 shadow-sm mx-auto"
        style={{
          boxShadow: "0 4px 16px rgba(31, 38, 135, 0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
        }}
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
}) => {
  const midIndex = Math.ceil(items.length / 2);
  const firstHalf = items.slice(0, midIndex);
  const secondHalf = items.slice(midIndex);
  
  return (
    <div className="hidden md:flex justify-center w-full">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-1 p-1.5 rounded-full bg-transparent backdrop-blur-xl border border-white/20 shadow-sm"
        style={{
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
        }}
      >
        {firstHalf.map((item) => (
          <Link href={item.href} key={item.title}>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/10 cursor-pointer transition-colors">
              
              <span className="text-sm font-medium text-white">{item.title}</span>
            </div>
          </Link>
        ))}
        
        <Link href="/">
          <div className="flex items-center justify-center h-12 w-24 rounded-2xl bg-transparent backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{
              boxShadow: "0 4px 16px rgba(122, 28, 172, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
            <Image src="/logo.png" alt="Logo" width={80} height={24} />
          </div>
        </Link>
        
        {secondHalf.map((item) => (
          <Link href={item.href} key={item.title}>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/10 cursor-pointer transition-colors">
             
              <span className="text-sm font-medium text-white">{item.title}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};