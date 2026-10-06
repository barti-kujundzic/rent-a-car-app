"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Outfit } from 'next/font/google';

const logoFont = Outfit({ 
  subsets: ['latin'],
  weight: ['700', '800'] 
});

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          
          
          <div className="space-y-6">
            <div className="flex flex-col items-center md:items-start">
              <Image 
                src="/icon.svg" 
                alt="RentEase Emblem" 
                width={100} 
                height={100} 
                className="mb-3 object-contain"
              />
              <h3 className={`${logoFont.className} text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-sm`}>
                RentEase
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
              Experience the freedom of the road with our premium car rental service. Reliable, fast, and secure.
            </p>
            <div className="flex gap-4 pt-2 justify-center md:justify-start">
              <a href="#" className="p-2.5 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2.5 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2.5 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* 2. STUPAC: Company */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/browse_cars" className="hover:text-blue-400 transition-colors">Browse Cars</Link></li>
              <li><Link href="/reviews" className="hover:text-blue-400 transition-colors">Reviews</Link></li>
              <li><Link href="/host" className="hover:text-blue-400 transition-colors">Become a Host</Link></li>
            </ul>
          </div>

          {/* 3. STUPAC: Support & Safety */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Support & Safety</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/support&safety" className="hover:text-blue-400 transition-colors flex items-center justify-center md:justify-start gap-2">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support&safety#contact" className="hover:text-blue-400 transition-colors flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} className="text-blue-500"/> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support&safety#safety" className="hover:text-blue-400 transition-colors flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck size={16} className="text-blue-500"/> Safety Info
                </Link>
              </li>
              <li>
                <Link href="/support&safety#faq" className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. STUPAC: Legal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {currentYear} RentEase Inc. Made in Split, Croatia.</p>
          <div className="flex items-center gap-8 mt-6 md:mt-0">
             <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> +385 91 234 5678</span>
             <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> support@rentease.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}