'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import HeroSection from '@/components/HeroSection';

import Container from '@/components/ui/Container';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
  
    <>
    <div className="pt-8 pb-16 sm:pb-24">
        <Container>
          <HeroSection />
        </Container>
      </div>

    
    </>
      
    
  );
}
