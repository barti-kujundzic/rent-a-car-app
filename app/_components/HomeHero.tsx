"use client";

import { motion } from "framer-motion";
import { Search, Shield, Star, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Definiramo gdje svaka kartica vodi
const features = [
  { 
    icon: Search, 
    title: 'Easy Search', 
    description: 'Find your perfect car in seconds.', 
    link: '/browse_cars',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border border-blue-100'
  },
  { 
    icon: Shield, 
    title: 'Secure & Safe', 
    description: 'Full insurance included.', 
    link: '/support&safety/insurance',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border border-blue-100'
  },
  { 
    icon: Star, 
    title: 'Top Rated', 
    description: 'Trusted community reviews.', 
    link: '/reviews',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border border-blue-100'
  },
  { 
    icon: Zap, 
    title: 'Instant Booking', 
    description: 'No waiting, book immediately.', 
    link: '/browse_cars', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border border-blue-100'
  },
];

export function HomeHero() {
  return (
    <>
      {/* HERO SECTION S ANIMACIJAMA */}
      <div className="relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Drive your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">adventure</span>.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl"
          >
            Connect with local car owners. Rent affordable, verified vehicles. 
            Experience the freedom of the road.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link href="/browse_cars">
              <button className="bg-white text-blue-900 px-8 py-4 rounded-full hover:bg-blue-50 transition-all font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95">
                Browse Cars <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/host">
              <button className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all font-bold hover:scale-105 active:scale-95">
                Become a Host
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* FEATURES SECTION (KARTICE KOJE VODE NEGDJE) */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link href={feature.link} key={feature.title} className="block h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }} // Animacija lebdenja
                  className="bg-white h-full rounded-2xl shadow-xl p-6 border border-gray-100 cursor-pointer group"
                >
                  <div className={`p-4 rounded-2xl w-fit mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-gray-900 mb-2 font-bold text-lg group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}