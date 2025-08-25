/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast" | "medium";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Responsive wave width based on screen size
  const getWaveWidth = () => {
    if (!waveWidth) {
      return w < 640 ? 30 : w < 1024 ? 40 : 50;
    }
    return w < 640 ? waveWidth * 0.6 : waveWidth;
  };
  
  // Responsive noise divisor for wave frequency
  const getNoiseDivisor = () => {
    return w < 640 ? 400 : w < 1024 ? 600 : 800;
  };
  
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "medium":
        return 0.0015;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };
  
  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    
    // Handle window resize with debouncing
    const handleResize = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  };
  
  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];
  
  const drawWave = (n: number) => {
    nt += getSpeed();
    const currentWaveWidth = getWaveWidth();
    const noiseDivisor = getNoiseDivisor();
    
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = currentWaveWidth;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      
      for (x = 0; x < w; x += 5) {
        const y = noise(x / noiseDivisor, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      
      ctx.stroke();
      ctx.closePath();
    }
  };
  
  let animationId: number;
  const render = () => {
    ctx.fillStyle = backgroundFill || "black";
    ctx.globalAlpha = waveOpacity || 0.5;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };
  
  useEffect(() => {
    const cleanup = init();
    render();
    return () => {
      cancelAnimationFrame(animationId);
      if (cleanup) cleanup();
    };
  }, []);
  
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);
  
  return (
    <div
      className={cn(
        "min-h-[90vh] sm:min-h-[90vh] md:min-h-[90vh] flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10 w-full", className)} {...props}>
        {children}
      </div>
    </div>
  );
};