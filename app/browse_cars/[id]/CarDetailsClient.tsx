"use client";

import { useRouter } from 'next/navigation';
import { MapPin, ChevronLeft, ChevronRight, Star, User, Edit, Check } from 'lucide-react'; 
import { ImageWithFallback } from '../../_components/ImageWithFallback';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion'; 

// --- SIDEBAR RECENZIJE ---
function SidebarReviews({ reviews }: { reviews: any[] }) {
  const topReviews = reviews.slice(0, 5);

  if (topReviews.length === 0) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">No reviews yet for this car.</p>
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm p-6 mt-6 border border-gray-100"
    >
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <Star size={18} className="fill-yellow-400 text-yellow-400" /> 
        Recent Reviews
      </h3>
      <div className="space-y-4">
        {topReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-sm">
                    {review.avatar ? (
                        <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                    ) : (
                        <User size={14} className="text-gray-500"/>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{review.author}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full">
                  <span className="text-yellow-500">★</span> {review.rating}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 italic">"{review.comment}"</p>
            <p className="text-xs text-gray-400 mt-1 text-right">{review.date}</p>
          </div>
        ))}
      </div>
      
      {reviews.length > 5 && (
        <div className="mt-4 pt-2 border-t border-gray-100 text-center">
              <Link href="/reviews" className="text-blue-600 text-sm font-bold hover:underline">
                View all {reviews.length} reviews
              </Link>
        </div>
      )}
    </motion.div>
  );
}

// --- GLAVNA KOMPONENTA ---
export default function CarDetailsClient({ car }: { car: any }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
    }
    getUser();
  }, []);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);

  const isOwner = currentUserId && car.owner_id && currentUserId === car.owner_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER ZA NAZAD */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
            <ChevronLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LIJEVI STUPAC - SLIKE I DETALJI */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            
            {/* GALERIJA SLIKA */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 relative group border border-gray-100">
              <div className="h-[400px] bg-gray-200">
                <ImageWithFallback src={car.images[currentImageIndex]} alt={car.model} className="w-full h-full object-cover" />
              </div>
              {car.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"><ChevronLeft className="text-gray-800"/></button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"><ChevronRight className="text-gray-800"/></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                     {car.images.map((_: any, idx: number) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                     ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 text-gray-900">{car.model}</h1>
                  <div className="flex items-center gap-3">
                     <p className="flex items-center gap-1 text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full"><MapPin size={16} className="text-blue-500"/> {car.location}</p>
                     {car.reviews && car.reviews.length > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-3 py-1 rounded-full">
                           <Star size={16} className="fill-current" />
                           <span className="text-gray-800">{Number(car.rating).toFixed(1)} <span className="text-gray-400 font-normal">({car.reviewsCount})</span></span>
                        </div>
                     )}
                  </div>
                </div>
                <div className="text-right bg-blue-50 p-4 rounded-xl">
                  <span className="text-4xl font-black text-blue-700">€{car.price}</span>
                  <span className="text-blue-500 font-medium text-sm block">per day</span>
                </div>
              </div>
              
              {/* TEHNIČKI PODACI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-gray-100 my-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Year</p><p className="font-bold text-lg text-gray-900">{car.year}</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Seats</p><p className="font-bold text-lg text-gray-900">{car.seats}</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Transmission</p><p className="font-bold text-lg text-gray-900">{car.transmission}</p></div>
                <div className="text-center p-4 bg-gray-50 rounded-xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Fuel</p><p className="font-bold text-lg text-gray-900">{car.fuel}</p></div>
              </div>

              {/* FEATURES */}
              {car.features && car.features.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Car Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature: string, index: number) => (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 flex items-center gap-2 shadow-sm hover:border-blue-300 transition-colors"
                      >
                        <Check size={16} className="text-green-500" /> {feature}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold mb-4 text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">{car.description}</p>
            </div>
          </motion.div>

          {/* DESNI STUPAC - BOOKING & SIDEBAR */}
          <div className="lg:col-span-1">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-blue-100"
            >
              
              {isOwner ? (
                 <div className="text-center">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Your Vehicle</h3>
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm font-medium border border-blue-100">
                       👋 This is your car listing. You cannot book your own vehicle.
                    </div>
                    <Link href={`/host/manage_listing?id=${car.id}`}>
                        <button className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                          <Edit size={18} /> Manage Listing
                        </button>
                    </Link>
                 </div>
              ) : (
                 <>
                    <div className="mb-6">
                       <span className="text-gray-500 text-sm font-medium">Daily Rate</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-900">€{car.price}</span>
                       </div>
                    </div>
                    
                    <Link href={`/booking/book?id=${car.slug}`}>
                        <motion.button 
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all text-lg"
                        >
                          Book Now
                        </motion.button>
                    </Link>
                    <p className="text-center text-xs text-gray-400 mt-4">You won't be charged yet</p>
                 </>
              )}

            </motion.div>

            <SidebarReviews reviews={car.reviews} />

          </div>
        </div>
      </div>
    </div>
  );
}