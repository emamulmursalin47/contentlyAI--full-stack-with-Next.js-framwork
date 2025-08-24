'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import HeroSection from '@/components/HeroSection';


// import AboutPage from '@/components/home/About';
// import FeaturesSectionDemo from '@/components/home/Features';
// import DemoPage from '@/components/home/Demos';

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
    <div className="pb-16 sm:pb-24">
     
          <HeroSection />
          {/* <AboutPage/>
          <FeaturesSectionDemo/>
          <DemoPage/> */}
       
      </div>

    
    </>
      
    
  );
}
