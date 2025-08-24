import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-[#2E073F] text-[#EBD3F8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
       
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Image src="/logo.png" alt="Logo" width={160} height={50} />
            <p className="mt-4 text-sm text-[#AD49E1]">
              Your ultimate AI-powered content creation companion.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-[#EBD3F8] mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Features</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Pricing</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Integrations</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">API</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-[#EBD3F8] mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">About Us</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Careers</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-[#EBD3F8] mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Blog</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Support</Link></li>
              <li><Link href="#" className="text-[#AD49E1] hover:text-[#7A1CAC]">Docs</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#AD49E1] mt-8 pt-8 text-center text-sm text-[#AD49E1]">
          <p>&copy; {new Date().getFullYear()} Contently AI. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ by Mursalin</p>
        </div>
      </div>
    </footer>
  );
}
