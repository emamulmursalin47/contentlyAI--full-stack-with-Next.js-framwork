/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Built for developers",
      description:
        "Engineered for innovators, creators, and visionaries who push boundaries.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Effortless experience",
      description:
        "Intuitive design that feels natural, with a learning curve that's practically flat.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Unbeatable value",
      description:
        "Premium features without the premium price. No hidden fees, no surprises.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Rock-solid reliability",
      description: "99.999% uptime guaranteed. We're always there when you need us.",
      icon: <IconCloud />,
    },
    {
      title: "Seamless collaboration",
      description: "Work together effortlessly with our multi-tenant architecture.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Always here to help",
      description:
        "Round-the-clock support from our team of experts and AI assistants.",
      icon: <IconHelp />,
    },
    {
      title: "Satisfaction guaranteed",
      description:
        "Love it or your money back. We're confident you'll never want to leave.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "And so much more",
      description: "Discover endless possibilities with our constantly evolving platform.",
      icon: <IconHeart />,
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative min-h-[80vh] py-8 overflow-hidden"
    >
      {/* Background elements matching HeroSection */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM1ZjNkYzQiIGQ9Ik0zNiAxOGMwLTkuOTQxLTguMDU5LTE4LTE4LTE4UzAgOC4wNTkgMCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOHptMTgtMGMwLTkuOTQxLTguMDU5LTE4LTE4LTE4UzE4IDguMDU5IDE4IDE4czguMDU5IDE4IDE4IDE4IDE4LTguMDU5IDE4LTE4eiIgb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20 dark:opacity-10 z-0"></div>
      
      {/* Floating orbs matching HeroSection colors */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7950f2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#5f3dc4] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#9775fa] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-4">
            Powerful Features, Delightful Experience
          </h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            Everything you need to succeed, crafted with attention to every detail
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-50">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
  isVisible,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative bg-[#302b63]/30 backdrop-blur-sm rounded-2xl border border-indigo-700/30 p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl overflow-hidden group",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5f3dc4]/10 to-[#7950f2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon container */}
      <div className="relative z-10 mb-5 flex items-center justify-center w-14 h-14 rounded-xl bg-[#5f3dc4]/20 text-indigo-300 group-hover:bg-[#7950f2] group-hover:text-white transition-colors duration-300">
        <div className="scale-110 group-hover:scale-125 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-indigo-100 mb-2 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
        <p className="text-indigo-200/80 group-hover:text-indigo-200 transition-colors duration-300">
          {description}
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-[#7950f2]/20 -z-0 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>
      <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-[#5f3dc4]/20 -z-0 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out delay-100"></div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7950f2]/10 to-[#5f3dc4]/10"></div>
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_5px_rgba(124,58,237,0.3)]"></div>
      </div>
    </div>
  );
};