
import Container from '@/components/ui/Container';
import { Users, Briefcase, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <main className="flex-grow py-16 bg-gray-50 pt-16">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">About Us</h1>
            <p className="mt-4 text-xl text-gray-600">Learn more about our mission, vision, and values.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              Our mission is to empower businesses and individuals with innovative and intuitive software solutions that streamline operations, foster growth, and enhance productivity. We are committed to delivering exceptional value through cutting-edge technology and unparalleled customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Who We Are</h3>
              <p className="text-gray-600">We are a passionate team of developers, designers, and strategists dedicated to creating impactful software.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What We Do</h3>
              <p className="text-gray-600">We build robust, scalable, and user-friendly applications that solve real-world problems for our clients.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Lightbulb className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">To be a leading provider of innovative software, recognized for our commitment to excellence and customer success.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-3 max-w-2xl mx-auto">
              <li><span className="font-semibold">Innovation:</span> Continuously exploring new technologies and creative solutions.</li>
              <li><span className="font-semibold">Integrity:</span> Operating with honesty, transparency, and ethical practices.</li>
              <li><span className="font-semibold">Customer Focus:</span> Prioritizing our clients&apos; needs and striving to exceed their expectations.</li>
              <li><span className="font-semibold">Excellence:</span> Delivering high-quality products and services through meticulous attention to detail.</li>
              <li><span className="font-semibold">Collaboration:</span> Fostering a supportive and cooperative environment within our team and with our clients.</li>
            </ul>
          </div>
        </Container>
      </main>
    </>
  );
}

