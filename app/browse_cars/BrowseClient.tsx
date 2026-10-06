"use client";

import { Search, MapPin, SlidersHorizontal, ChevronRight, ChevronLeft, X, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { ImageWithFallback } from '../_components/ImageWithFallback';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, Variants } from 'framer-motion'; 

const ITEMS_PER_PAGE = 6;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50 } 
  }
};

export default function BrowseClient({ initialCars }: { initialCars: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [locationSearch, setLocationSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500,
    transmission: 'any',
    seats: 'any'
  });

  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    }
    getUser();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ minPrice: 0, maxPrice: 500, transmission: 'any', seats: 'any' });
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const filteredCars = useMemo(() => {
    return initialCars.filter(car => {
      if (userId && car.owner_id === userId) return false;

      const matchesLocation = car.location.toLowerCase().includes(locationSearch.toLowerCase());
      const matchesModel = car.model.toLowerCase().includes(modelSearch.toLowerCase()) || 
                           car.type.toLowerCase().includes(modelSearch.toLowerCase());
      
      const carPrice = parseFloat(car.price);
      const matchesPrice = carPrice >= filters.minPrice && carPrice <= filters.maxPrice;

      const matchesTransmission = filters.transmission === 'any' 
        ? true 
        : car.transmission?.toLowerCase() === filters.transmission.toLowerCase();

      const matchesSeats = filters.seats === 'any'
        ? true
        : car.seats?.toString() === filters.seats;

      return matchesLocation && matchesModel && matchesPrice && matchesTransmission && matchesSeats;
    });
  }, [locationSearch, modelSearch, initialCars, filters, userId]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCars = filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-4xl md:text-5xl mb-8 font-bold tracking-tight">Find Your Perfect Ride</h1>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl relative text-gray-900 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                <MapPin size={20} className="text-blue-600" />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Zagreb)" 
                  className="bg-transparent outline-none w-full font-medium placeholder:text-gray-400"
                  value={locationSearch}
                  onChange={(e) => { setLocationSearch(e.target.value); setCurrentPage(1); }}
                />
                {locationSearch && <button onClick={() => setLocationSearch('')}><X size={16} className="text-gray-400 hover:text-red-500"/></button>}
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl relative text-gray-900 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                <Search size={20} className="text-blue-600" />
                <input 
                  type="text" 
                  placeholder="Car model (e.g. BMW)" 
                  className="bg-transparent outline-none w-full font-medium placeholder:text-gray-400"
                  value={modelSearch}
                  onChange={(e) => { setModelSearch(e.target.value); setCurrentPage(1); }}
                />
                {modelSearch && <button onClick={() => setModelSearch('')}><X size={16} className="text-gray-400 hover:text-red-500"/></button>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- REZULTATI --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <p className="text-gray-600 font-medium">
            Showing <span className="text-gray-900 font-bold">{filteredCars.length}</span> available cars
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 border px-5 py-2.5 rounded-full transition-all text-sm font-bold shadow-sm ${
               filters.transmission !== 'any' || filters.seats !== 'any' || filters.minPrice > 0 || filters.maxPrice < 500
               ? 'border-blue-600 text-blue-600 bg-blue-50 ring-2 ring-blue-100' 
               : 'border-gray-200 bg-white hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
          </motion.button>
        </div>

        {filteredCars.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={`${currentPage}-${userId || 'guest'}`}
          >
            {currentCars.map((car) => (
              <motion.div key={car.id} variants={itemVariants}>
                <Link href={`/browse_cars/${car.id}`} className="group block h-full">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative h-60 bg-gray-200 overflow-hidden">
                      <div className="w-full h-full group-hover:scale-110 transition-transform duration-700">
                        <ImageWithFallback src={car.image} alt={car.model} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-gray-800">Available</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{car.model}</h3>
                          <p className="text-sm text-gray-500 font-medium">{car.type} • {car.transmission}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-blue-600">€{car.price}</span>
                          <span className="text-sm text-gray-500 block">/day</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 bg-gray-50 p-2 rounded-lg w-fit">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="font-medium">{car.location}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3 justify-between">
                         <span className={`text-xs font-bold px-2 py-1 rounded ${car.source === 'supabase' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'}`}>
                            {car.source === 'supabase' ? 'Private Host' : 'RentEase Fleet'}
                         </span>
                         {car.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                               <span className="text-yellow-400">★</span> {car.rating} ({car.reviews})
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
          >
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters.</p>
            <button onClick={resetFilters} className="text-blue-600 font-bold hover:underline">Clear all filters</button>
          </motion.div>
        )}

        {/* --- PAGINACIJA --- */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 border rounded-full hover:bg-gray-50 disabled:opacity-30 transition-colors"><ChevronLeft size={20} /></button>
            <span className="font-bold text-gray-700">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 border rounded-full hover:bg-gray-50 disabled:opacity-30 transition-colors"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>

      {/* --- ANIMIRANI FILTER MODAL --- */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            
            {/* Sidebar Slide-in */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* PRICE RANGE */}
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><Filter size={18} className="text-blue-600"/> Price Range</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Min (€)</label>
                      <input 
                        type="number" 
                        value={filters.minPrice} 
                        onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Max (€)</label>
                      <input 
                        type="number" 
                        value={filters.maxPrice} 
                        onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* TRANSMISSION */}
                <div>
                  <h3 className="font-bold mb-4 text-gray-800">Transmission</h3>
                  <div className="flex gap-2">
                    {['any', 'Automatic', 'Manual'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('transmission', type)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-1 ${
                          filters.transmission === type 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type === 'any' ? 'Any' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SEATS */}
                <div>
                  <h3 className="font-bold mb-4 text-gray-800">Seats</h3>
                  <div className="flex gap-3 flex-wrap">
                    {['any', '2', '4', '5', '7'].map(num => (
                      <button
                        key={num}
                        onClick={() => handleFilterChange('seats', num)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold border transition-all ${
                          filters.seats === num 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-110' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {num === 'any' ? 'All' : num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                <button 
                  onClick={resetFilters}
                  className="flex-1 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3.5 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}