"use client";
import Container from '@/components/ui/Container';
import { Users, Briefcase, Lightbulb, Star, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <main className="flex-grow py-8 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] min-h-screen">
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

        <Container>
          <div className="text-center mb- py-16 relative z-10">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Us
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl text-indigo-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Learn more about our mission, vision, and values.
            </motion.p>
          </div>

          <motion.div 
            className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 p-8 rounded-2xl shadow-lg mb-16 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#5f3dc4]/10 to-[#7950f2]/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center text-indigo-100 mb-6">Our Mission</h2>
              <p className="text-lg text-indigo-200 leading-relaxed text-center max-w-3xl mx-auto">
                Our mission is to empower businesses and individuals with innovative and intuitive software solutions that streamline operations, foster growth, and enhance productivity. We are committed to delivering exceptional value through cutting-edge technology and unparalleled customer support.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Users className="h-12 w-12" />,
                title: "Who We Are",
                description: "We are a passionate team of developers, designers, and strategists dedicated to creating impactful software."
              },
              {
                icon: <Briefcase className="h-12 w-12" />,
                title: "What We Do",
                description: "We build robust, scalable, and user-friendly applications that solve real-world problems for our clients."
              },
              {
                icon: <Lightbulb className="h-12 w-12" />,
                title: "Our Vision",
                description: "To be a leading provider of innovative software, recognized for our commitment to excellence and customer success."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 p-6 rounded-2xl shadow-lg text-center relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#5f3dc4]/10 to-[#7950f2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-xl bg-[#5f3dc4]/20 flex items-center justify-center group-hover:bg-[#7950f2] transition-colors duration-300">
                      <div className="text-indigo-300 group-hover:text-white transition-colors duration-300">
                        {item.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-100 mb-2">{item.title}</h3>
                  <p className="text-indigo-200">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 p-8 rounded-2xl shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#5f3dc4]/10 to-[#7950f2]/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center text-indigo-100 mb-8">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  { 
                    title: "Innovation", 
                    description: "Continuously exploring new technologies and creative solutions.",
                    icon: <Star className="h-5 w-5" />
                  },
                  { 
                    title: "Integrity", 
                    description: "Operating with honesty, transparency, and ethical practices.",
                    icon: <Star className="h-5 w-5" />
                  },
                  { 
                    title: "Customer Focus", 
                    description: "Prioritizing our clients' needs and striving to exceed their expectations.",
                    icon: <Star className="h-5 w-5" />
                  },
                  { 
                    title: "Excellence", 
                    description: "Delivering high-quality products and services through meticulous attention to detail.",
                    icon: <Star className="h-5 w-5" />
                  },
                  { 
                    title: "Collaboration", 
                    description: "Fostering a supportive and cooperative environment within our team and with our clients.",
                    icon: <Star className="h-5 w-5" />
                  }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-4 rounded-lg bg-[#302b63]/20 hover:bg-[#5f3dc4]/20 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1 mr-3 text-[#7950f2]">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-100">{value.title}</h3>
                      <p className="text-indigo-200 mt-1">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </main>
    </>
  );
}