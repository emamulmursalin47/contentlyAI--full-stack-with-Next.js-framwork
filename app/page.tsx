import AuthRedirect from '@/components/AuthRedirect';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <div className=" sm:pb-24">
        <HeroSection />
        {/* <AboutPage/>
          <FeaturesSectionDemo/>
          <DemoPage/> */}
      </div>
    </>
  );
}
