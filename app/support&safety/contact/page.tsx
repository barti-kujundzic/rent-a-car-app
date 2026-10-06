"use client";

import { ChevronLeft, Mail, Phone, MapPin, Send, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/support&safety" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit font-medium">
            <ChevronLeft size={20} />
            <span>Back to Support Center</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Get in Touch
          </motion.h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Have questions about your rental? Our team is ready to help you 24/7.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Phone Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Phone Support</h3>
              </div>
              <div className="space-y-3">
                <a href="tel:+385997482114" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                    <span className="font-semibold">+385 99 748 2114</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Primary</span>
                </a>
                <a href="tel:+385957159402" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                    <span className="font-semibold">+385 95 715 9402</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Secondary</span>
                </a>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} /> <span>Available Mon-Sun, 08:00 - 20:00</span>
              </div>
            </div>

            {/* Email & Office Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
               <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Digital & Office</h3>
              </div>
              
              <div className="space-y-6">
                  <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold uppercase">Email Us</p>
                      <a href="mailto:support@rentease.com" className="text-lg font-medium text-blue-600 hover:underline">support@rentease.com</a>
                      <p className="text-xs text-gray-400 mt-1">We usually reply within 2 hours</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold uppercase">Main Office</p>
                      <div className="flex items-start gap-2 text-gray-700">
                          <MapPin size={18} className="mt-1 text-gray-400"/>
                          <p>Prisoje 112<br/>21232 Dicmo<br/>Croatia</p>
                      </div>
                  </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                            <option value="">Select a topic...</option>
                            <option value="booking">Booking Modification</option>
                            <option value="payment">Payment Issue</option>
                            <option value="insurance">Insurance Claim</option>
                            <option value="account">Account Help</option>
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea rows={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" placeholder="How can we help you today?" />
                </div>

                <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:scale-105 active:scale-95">
                        <Send size={18} /> Send Message
                    </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}