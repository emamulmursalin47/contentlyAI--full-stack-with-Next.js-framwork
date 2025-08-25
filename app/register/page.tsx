'use client';
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
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { register, user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const result = await register(formData.email, formData.password, formData.fullName);
      if (result.success) {
        router.push('/chat');
      } else {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
    <BackgroundLines className="min-h-screen  bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex justify-center sm:items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Floating elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md  z-20 w-full pt-16 sm:pt-0"
      >
        <Card className="bg-[#302b63]/30 mt-8 sm:mt-20 backdrop-blur-sm border border-indigo-700/30 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7950f2]/10 to-[#5f3dc4]/10"></div>
            <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_5px_rgba(124,58,237,0.2)]"></div>
          </div>

          <div className="relative  z-10">
            <div className="text-center  mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex  justify-center mb-3 sm:mb-4"
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
                Create your <span className="text-[#9775fa]">Contently AI</span> account
              </motion.h2>
              
              <motion.p 
                className="mt-3 text-sm sm:text-base text-indigo-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Join Contently AI and start creating amazing content
              </motion.p>
            </div>
            
            {/* Google Sign-up Button */}
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
                <SiGoogle className="h-5 w-5" /> Sign up with Google
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
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-900/20 border border-red-700/50 rounded-md p-4"
                >
                  <p className="text-sm text-red-300">{errors.submit}</p>
                </motion.div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm sm:text-base text-indigo-200 flex items-center gap-2">
                    <User className="h-4 w-4" /> Full name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    placeholder="Enter your full name"
                    className="mt-1 bg-[#302b63]/50 border-indigo-700/50 text-indigo-100 placeholder:text-indigo-500 focus:border-[#7950f2]"
                  />
                  {errors.fullName && <p className="text-sm text-red-400 mt-1">{errors.fullName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base text-indigo-200 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="Enter your email"
                    className="mt-1 bg-[#302b63]/50 border-indigo-700/50 text-indigo-100 placeholder:text-indigo-500 focus:border-[#7950f2]"
                  />
                  {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm sm:text-base text-indigo-200 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange('password')}
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
                  {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-indigo-200 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Confirm password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      placeholder="Confirm your password"
                      className="bg-[#302b63]/50 border-indigo-700/50 text-indigo-100 placeholder:text-indigo-500 focus:border-[#7950f2] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-indigo-300"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
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
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </motion.div>

              <div className="text-center mt-3 sm:mt-4">
                <p className="text-sm text-indigo-300">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-[#9775fa] hover:text-[#b794f4] transition-colors">
                    Sign in
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