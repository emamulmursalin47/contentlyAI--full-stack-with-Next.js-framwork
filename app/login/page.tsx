"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { BackgroundLines } from '@/components/ui/background-lines';
import { Card } from '@/components/ui/card';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { motion } from 'framer-motion';
import { Eye, EyeOff,  } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        router.push('/chat');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7950f2]"></div>
      </div>
    );
  }

  return (
    <BackgroundLines className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex justify-center sm:items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
     

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md z-20 w-full pt-16 sm:pt-0"
      >
        <Card className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7950f2]/10 to-[#5f3dc4]/10"></div>
            <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_5px_rgba(124,58,237,0.2)]"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mb-3 sm:mb-4"
              >
             <Link href="/">
          <div className="flex items-center justify-center h-16 w-32 rounded-2xl bg-transparent backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{
              boxShadow: "0 4px 16px rgba(122, 28, 172, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
           <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg sm:text-xl">Contently</span>
              </div>
          </div>
        </Link>
              </motion.div>
              
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Sign in to <span className="text-[#9775fa]">Contently AI</span>
              </motion.h2>
              
              <motion.p 
                className="mt-3 text-sm sm:text-base text-indigo-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Access your account to create amazing content
              </motion.p>
            </div>
            
            {/* Google Sign-in Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-4 sm:mb-6"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-transparent border-indigo-600/50 text-sm sm:text-base text-indigo-200 hover:bg-[#5f3dc4]/20 hover:text-white transition-all duration-300"
                onClick={() => signInWithGoogle()}
              >
                <SiGoogle className="h-5 w-5" /> Sign in with Google
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative mb-4 sm:mb-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-700/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-indigo-300">Or continue with</span>
              </div>
            </motion.div>
            
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="space-y-4 sm:space-y-5"
              onSubmit={handleSubmit}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-900/20 border border-red-700/50 rounded-md p-4"
                >
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="email" className="text-sm sm:text-base text-indigo-200">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="bg-[#302b63]/50 border-indigo-700/50 text-indigo-100 placeholder:text-indigo-500 focus:border-[#7950f2]"
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm sm:text-base text-indigo-200">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-[#9775fa] hover:text-[#b794f4] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="bg-[#302b63]/50 border-indigo-700/50 text-indigo-100 placeholder:text-indigo-500 focus:border-[#7950f2] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-indigo-300"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-sm sm:text-base text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-[0_0_20px_5px_rgba(124,58,237,0.3)] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </motion.div>

              <div className="text-center mt-3 sm:mt-4">
                <p className="text-sm text-indigo-300">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-medium text-[#9775fa] hover:text-[#b794f4] transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </Card>
      </motion.div>
    </BackgroundLines>
  );
}