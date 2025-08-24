
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      frequency: '/month',
      description: 'Perfect for getting started.',
      features: [
        '5 projects',
        'Basic analytics',
        'Community support',
        '1GB storage',
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline',
    },
    {
      name: 'Pro',
      price: '$29',
      frequency: '/month',
      description: 'For growing teams and advanced features.',
      features: [
        'Unlimited projects',
        'Advanced analytics',
        'Priority email support',
        '100GB storage',
        'Custom domains',
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'default',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      frequency: '',
      description: 'Tailored solutions for large organizations.',
      features: [
        'All Pro features',
        'Dedicated support',
        'SLA guarantee',
        'On-premise options',
        'Advanced security',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline',
    },
  ];

  return (
    <>
      <main className="flex-grow py-16 bg-gray-50 pt-16">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-xl text-gray-600">Choose the plan that&apos;s right for your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={tier.highlight ? 'border-blue-500 border-2 shadow-lg' : ''}>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="mt-2 text-gray-600">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-extrabold text-gray-900">{tier.price}</span>
                    <span className="text-xl font-medium text-gray-600">{tier.frequency}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${tier.buttonVariant === 'default' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : ''}`} variant={tier.buttonVariant as never}>
                    {tier.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-6 text-left max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg text-gray-800">What is your refund policy?</h3>
                <p className="mt-2 text-gray-600">We offer a 30-day money-back guarantee for all our paid plans. No questions asked.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg text-gray-800">Can I change my plan later?</h3>
                <p className="mt-2 text-gray-600">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg text-gray-800">Do you offer discounts for non-profits?</h3>
                <p className="mt-2 text-gray-600">Yes, we offer special discounts for eligible non-profit organizations. Please contact our sales team for more details.</p>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
