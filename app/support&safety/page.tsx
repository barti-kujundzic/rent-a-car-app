"use client";

import { Shield, HelpCircle, Mail, Phone, FileText, Lock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quickLinks = [
  {
    title: 'Contact Support',
    description: 'Get in touch with our team directly',
    icon: Mail,
    link: '/support&safety/contact',
    color: ''
  },
  {
    title: 'Insurance & Protection',
    description: 'Coverage details and damage waivers',
    icon: Shield,
    link: '/support&safety/insurance',
    color: ''
  },
  {
    title: 'Safety Guidelines',
    description: 'Road safety and vehicle standards',
    icon: Lock,
    link: '#safety',
    color: ''
  },
  {
    title: 'Terms & Policies',
    description: 'Fuel policy, cancellation & agreements',
    icon: FileText,
    link: '#',
    color: ''
  },
];

const faqs = [
  {
    question: 'How does the "Full-to-Full" fuel policy work?',
    answer: 'Most listings on RentEase follow a Full-to-Full policy. You will receive the car with a full tank and should return it full. If returned with less fuel, you may be charged for the difference plus a service fee.',
  },
  {
    question: 'What happens if I return the car late?',
    answer: 'We offer a 59-minute grace period. Returns later than that may incur a charge equivalent to one extra day of rental. Please contact support if you know you will be late.',
  },
  {
    question: 'Is there a mileage limit?',
    answer: 'This depends on the specific car listing. Many cars offer unlimited mileage, while others have a daily cap (e.g., 300km/day). Extra kilometers are charged upon return.',
  },
  {
    question: 'Can I add a second driver?',
    answer: 'Yes! You can add an additional driver during the booking process or at pickup. The second driver must also present a valid license and meet the age requirements.',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 py-20 relative z-10"
        >
          <h1 className="text-5xl mb-4 font-bold tracking-tight">Support & Safety Center</h1>
          <p className="text-blue-100 text-xl max-w-2xl">
            We're here to ensure your journey is safe, smooth, and worry-free.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 -mt-16 relative z-20">
        
        {/* EMERGENCY CARD */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-l-4 border-red-500 rounded-xl shadow-lg p-8 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Emergency Assistance</h3>
              <p className="text-gray-600">
                In case of accident, breakdown, or urgent safety issues. Available 24/7.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
             <a href="tel:+385997482114" className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold shadow-md hover:shadow-lg">
                <Phone size={18} /> +385 99 748 2114
             </a>
             <a href="tel:+385957159402" className="flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-bold">
                <Phone size={18} /> +385 95 715 9402
             </a>
          </div>
        </motion.div>

        {/* QUICK LINKS GRID */}
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-400">How can we help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.link}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 h-full rounded-2xl shadow-sm p-6 border border-blue-100 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className={`bg-blue-200/60 text-blue-800 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  </div>
                  {openFaq === index ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                </button>
                <AnimatePresence>
                    {openFaq === index && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 border-t border-gray-100"
                        >
                            <p className="p-6 text-gray-600 leading-relaxed">
                                {faq.answer}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}