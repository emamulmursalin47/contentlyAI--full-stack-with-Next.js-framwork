
import Container from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Rocket, Shield, TrendingUp, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Lightbulb className="h-10 w-10 text-blue-500" />,
      title: 'Intuitive Design',
      description: 'Our platform is built with user experience in mind, making complex tasks simple and enjoyable.',
    },
    {
      icon: <Rocket className="h-10 w-10 text-blue-500" />,
      title: 'Blazing Fast Performance',
      description: 'Experience unparalleled speed and efficiency with our optimized infrastructure.',
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      title: 'Robust Security',
      description: 'Your data is protected with industry-leading encryption and security protocols.',
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-blue-500" />,
      title: 'Scalable Solutions',
      description: 'Grow your business without limits. Our platform scales with your needs.',
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
      title: 'Comprehensive Analytics',
      description: 'Gain deep insights into your operations with our powerful and customizable analytics tools.',
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
      title: '24/7 Customer Support',
      description: 'Our dedicated support team is always here to help you succeed, day or night.',
    },
  ];

  return (
    <>
      <main className="flex-grow py-16 bg-gray-50 pt-16">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Powerful Features for Your Success</h1>
            <p className="mt-4 text-xl text-gray-600">Discover how our platform can transform your workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6">
                <CardHeader className="flex flex-col items-center justify-center">
                  {feature.icon}
                  <CardTitle className="mt-4 text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
            <p className="mt-4 text-xl text-gray-600">Join thousands of satisfied customers today.</p>
            <div className="mt-8">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg px-8 py-4">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
