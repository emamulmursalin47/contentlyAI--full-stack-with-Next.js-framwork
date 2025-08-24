"use client";
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
      icon: <Star className="h-6 w-6" />
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
      icon: <Zap className="h-6 w-6" />
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
      icon: <Shield className="h-6 w-6" />
    },
  ];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <main className="flex-grow py-16 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] min-h-screen pt-16">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        </div>

        <Container>
          <div className="text-center mb-16 relative z-10">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl text-indigo-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose the plan that&apos;s right for your business.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative backdrop-blur-sm bg-[#302b63]/30 border border-indigo-700/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${tier.highlight ? 'ring-2 ring-[#7950f2] shadow-lg' : ''}`}>
                  {tier.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] py-1.5 text-center">
                      <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Most Popular</span>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6 pt-8">
                    <div className="flex justify-center mb-4">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${tier.highlight ? 'bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white' : 'bg-[#5f3dc4]/20 text-indigo-300'}`}>
                        {tier.icon}
                      </div>
                    </div>
                    
                    <CardTitle className={`text-2xl font-bold ${tier.highlight ? 'text-white' : 'text-indigo-100'}`}>{tier.name}</CardTitle>
                    <CardDescription className="mt-2 text-indigo-200">{tier.description}</CardDescription>
                    
                    <div className="mt-4">
                      <span className={`text-5xl font-extrabold ${tier.highlight ? 'text-white' : 'text-indigo-100'}`}>{tier.price}</span>
                      <span className="text-xl font-medium text-indigo-300">{tier.frequency}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center text-indigo-200">
                          <CheckCircle className={`h-5 w-5 mr-2 flex-shrink-0 ${tier.highlight ? 'text-indigo-300' : 'text-[#7950f2]'}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    {tier.buttonVariant === 'default' ? (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                          <Button className="relative w-full bg-indigo-900 border-0 text-white font-medium py-3 rounded-lg">
                            {tier.buttonText}
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full bg-transparent border-indigo-600/50 text-indigo-200 hover:bg-[#5f3dc4]/20 hover:text-white font-medium py-3 rounded-lg transition-colors duration-300">
                          {tier.buttonText}
                        </Button>
                      </motion.div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 relative z-10">
            <motion.h2 
              className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Frequently Asked Questions
            </motion.h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              {[
                {
                  question: "What is your refund policy?",
                  answer: "We offer a 30-day money-back guarantee for all our paid plans. No questions asked."
                },
                {
                  question: "Can I change my plan later?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings."
                },
                {
                  question: "Do you offer discounts for non-profits?",
                  answer: "Yes, we offer special discounts for eligible non-profit organizations. Please contact our sales team for more details."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-[#302b63]/30 backdrop-blur-sm border border-indigo-700/30 rounded-xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <h3 className="font-semibold text-lg text-indigo-100 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#5f3dc4]/20 flex items-center justify-center mr-3">
                      <div className="w-2 h-2 rounded-full bg-[#7950f2]"></div>
                    </div>
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-indigo-200 pl-9">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}