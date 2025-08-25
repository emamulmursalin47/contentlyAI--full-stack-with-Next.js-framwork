import AuthRedirect from '@/components/AuthRedirect';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <div className=" ">
        <HeroSection />
        {/* <AboutPage/>
          <FeaturesSectionDemo/>
          <DemoPage/> */}
      </div>
    </>
  );
}
