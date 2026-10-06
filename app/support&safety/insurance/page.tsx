"use client";

import { ChevronLeft, Shield, CheckCircle, XCircle, AlertCircle, FileText, Camera, Phone, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/support&safety" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit font-medium">
            <ChevronLeft size={20} />
            <span>Back to Support</span>
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 py-20 text-center"
        >
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
             <Shield size={48} className="text-emerald-100" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Insurance & Protection</h1>
          <p className="text-emerald-100 text-xl max-w-2xl mx-auto">
            Drive with confidence knowing you're protected. Every trip comes with coverage.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Coverage Comparison */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16"
        >
            <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Coverage Plans</h2>
                <p className="text-gray-500">Choose the level of protection that suits you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* BASIC */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold uppercase tracking-wider">Included</span>
                        <h3 className="text-xl font-bold">Basic Protection</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-6">Free</p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500"/> <span>Third-Party Liability</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500"/> <span>Collision Damage Waiver (CDW)</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500"/> <span>Theft Protection</span></li>
                        <li className="flex items-center gap-3 text-gray-400"><XCircle size={20}/> <span>Zero Deductible</span></li>
                        <li className="flex items-center gap-3 text-gray-400"><XCircle size={20}/> <span>Tires & Glass Coverage</span></li>
                    </ul>
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">Standard Deductible: <span className="text-gray-900 font-bold">€500 - €1000</span></p>
                        <p className="text-xs text-gray-500 mt-1">You pay up to this amount in case of damage.</p>
                    </div>
                </div>

                {/* PREMIUM */}
                <div className="p-8 bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold uppercase tracking-wider">Recommended</span>
                        <h3 className="text-xl font-bold text-blue-900">Premium Protection</h3>
                    </div>
                    <p className="text-3xl font-black text-blue-600 mb-6">€15<span className="text-sm text-gray-500 font-normal">/day</span></p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-600"/> <span className="font-medium">Everything in Basic</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-600"/> <span className="font-bold text-gray-900">Zero (€0) Deductible</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-600"/> <span>Tires, Glass & Undercarriage</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-600"/> <span>Roadside Assistance 24/7</span></li>
                        <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-600"/> <span>Personal Accident Insurance</span></li>
                    </ul>
                    <div className="mt-8">
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Claim Process Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <h2 className="text-2xl font-bold mb-10 text-center">What to do in case of an accident?</h2>
            
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 md:left-1/2 md:-ml-0.5"></div>

                {/* Step 1 */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex items-center mb-12 md:justify-end md:flex-row-reverse"
                >
                    <div className="absolute left-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 md:left-1/2 md:-translate-x-1/2 text-red-600 font-bold text-xl">1</div>
                    <div className="ml-20 md:ml-0 md:mr-12 md:w-5/12 bg-red-50 p-6 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3 mb-2 text-red-700 font-bold">
                            <AlertTriangle size={20}/> Safety First & Police
                        </div>
                        <p className="text-sm text-gray-600">Ensure everyone is safe. Call emergency services (112) if needed. You MUST get a police report for insurance to be valid.</p>
                    </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex items-center mb-12 md:justify-start"
                >
                    <div className="absolute left-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 md:left-1/2 md:-translate-x-1/2 text-blue-600 font-bold text-xl">2</div>
                    <div className="ml-20 md:ml-0 md:pl-12 md:w-5/12">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-blue-700 font-bold">
                                <Camera size={20}/> Document Everything
                            </div>
                            <p className="text-sm text-gray-600">Take clear photos of the damage, the scene, and other parties' documents. Do not admit liability.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex items-center mb-12 md:justify-end md:flex-row-reverse"
                >
                    <div className="absolute left-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 md:left-1/2 md:-translate-x-1/2 text-blue-600 font-bold text-xl">3</div>
                    <div className="ml-20 md:ml-0 md:mr-12 md:w-5/12">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-blue-700 font-bold">
                                <Phone size={20}/> Contact RentEase
                            </div>
                            <p className="text-sm text-gray-600">Call our emergency line <strong>+385 99 748 2114</strong> immediately. We will guide you on the next steps.</p>
                        </div>
                    </div>
                </motion.div>

                 {/* Step 4 */}
                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex items-center md:justify-start"
                >
                    <div className="absolute left-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 md:left-1/2 md:-translate-x-1/2 text-green-600 font-bold text-xl">4</div>
                    <div className="ml-20 md:ml-0 md:pl-12 md:w-5/12">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-green-700 font-bold">
                                <FileText size={20}/> Submit Claim
                            </div>
                            <p className="text-sm text-gray-600">Upload all photos and the police report through your RentEase dashboard within 24 hours.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

      </div>
    </div>
  );
}