"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { client } from '@/lib/contentful';
import { supabase } from '@/lib/supabase';
import { User, Fuel, Gauge, Users, ArrowRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function BookClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get('id'); 

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [driverData, setDriverData] = useState({
    fullName: '',
    email: '',
    phone: '',
    license: ''
  });

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    license: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  useEffect(() => {
    async function initializePage() {
      // Middleware handles auth redirect - user is guaranteed to be logged in here
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Middleware handles redirect to login
        return;
      }

      if (!carId) { setLoading(false); return; }

      // Supabase fetch
      if (carId.length > 30) {
        const { data } = await supabase.from('cars').select('*').eq('id', carId).single();
        if (data) {
          setCar({
            modelName: `${data.make} ${data.model}`,
            pricePerDay: data.price_per_day,
            image: { fields: { file: { url: data.image_url } } },
            fuel: data.fuel || 'N/A',
            transmission: data.transmission,
            seats: data.seats
          });
          setLoading(false);
          return;
        }
      }

      // Contentful fetch
      if (client) {
        try {
          const res = await client.getEntries({ content_type: 'car', 'fields.slug': carId, limit: 1 });
          if (res.items.length > 0) setCar(res.items[0].fields);
        } catch (err) { console.error(err); }
      }
      setLoading(false);
    }
    initializePage();
  }, [carId, router]);

  const handleContinue = () => {
    if (!carId) return;

    const newErrors = {
      fullName: !driverData.fullName.trim(),
      email: !driverData.email.trim() || !driverData.email.includes('@'),
      phone: !driverData.phone.trim(),
      license: !driverData.license.trim()
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(isError => isError)) return; 

    const queryParams = new URLSearchParams({
      id: carId,
      driver: driverData.fullName,
      email: driverData.email
    }).toString();

    router.push(`/booking?${queryParams}`);
  };

  const handleBack = () => router.back();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!car) return <div className="text-center p-10 font-bold">Car not found</div>;

  let carImageUrl = '';
  if (typeof car.image === 'string') {
     carImageUrl = car.image;
  } else {
     const rawUrl = car.images?.[0]?.fields?.file?.url || car.image?.fields?.file?.url;
     if (rawUrl) carImageUrl = rawUrl.startsWith('http') ? rawUrl : `https:${rawUrl}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl font-bold mb-2">Driver Details</h1>
          <p className="text-blue-100 text-lg">Step 1: Provide your information</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row border-b border-gray-100">
            <div className="md:w-1/3 h-48 md:h-auto relative bg-gray-100 group overflow-hidden">
              <img src={carImageUrl} alt={car.modelName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-blue-600 text-sm font-bold uppercase tracking-wider">Selected Vehicle</span>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{car.modelName}</h2>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-bold text-blue-600">€{car.pricePerDay}</p>
                </div>
              </div>
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-600"><Fuel size={18} className="text-blue-500" /><span>{car.fuel || 'N/A'}</span></div>
                <div className="flex items-center gap-2 text-gray-600"><Gauge size={18} className="text-blue-500" /><span>{car.transmission || 'Manual'}</span></div>
                <div className="flex items-center gap-2 text-gray-600"><Users size={18} className="text-blue-500" /><span>{car.seats || 5} Seats</span></div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><User size={20} className="text-blue-600" /> Driver Information</h3>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants} initial="hidden" animate="show">
                
                {/* FULL NAME */}
                <motion.div variants={itemVariants}>
                    <label className={`block text-sm font-semibold mb-2 ${errors.fullName ? 'text-red-500' : 'text-gray-700'}`}>Full Name</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="fullName" 
                            placeholder="e.g. John Doe"
                            value={driverData.fullName} 
                            onChange={handleInputChange} 
                            className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                errors.fullName ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                            }`} 
                        />
                        {errors.fullName && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
                    </div>
                </motion.div>

                {/* EMAIL */}
                <motion.div variants={itemVariants}>
                    <label className={`block text-sm font-semibold mb-2 ${errors.email ? 'text-red-500' : 'text-gray-700'}`}>Email</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="name@example.com"
                            value={driverData.email} 
                            onChange={handleInputChange} 
                            className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                errors.email ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                            }`} 
                        />
                        {errors.email && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
                    </div>
                </motion.div>

                {/* PHONE */}
                <motion.div variants={itemVariants}>
                    <label className={`block text-sm font-semibold mb-2 ${errors.phone ? 'text-red-500' : 'text-gray-700'}`}>Phone</label>
                    <div className="relative">
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder="+385 9x xxx xxxx"
                            value={driverData.phone} 
                            onChange={handleInputChange} 
                            className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                errors.phone ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                            }`} 
                        />
                        {errors.phone && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
                    </div>
                </motion.div>

                {/* LICENSE */}
                <motion.div variants={itemVariants}>
                    <label className={`block text-sm font-semibold mb-2 ${errors.license ? 'text-red-500' : 'text-gray-700'}`}>License Number</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="license" 
                            placeholder="e.g. 12345678"
                            value={driverData.license} 
                            onChange={handleInputChange} 
                            className={`w-full px-4 py-3 border rounded-xl transition-all ${
                                errors.license ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                            }`} 
                        />
                        {errors.license && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
                    </div>
                </motion.div>

            </motion.div>
            
            <div className="pt-8 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={handleBack} 
                  className="flex-1 py-4 border-2 border-gray-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft /> Back
                </button>
                <button 
                  onClick={handleContinue} 
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
                >
                  Continue <ArrowRight />
                </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}