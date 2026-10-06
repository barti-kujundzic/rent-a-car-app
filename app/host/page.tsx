"use client";

import { PlusCircle, Car, TrendingUp, Calendar, DollarSign, Trash2, MapPin, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; 

// Varijante za stagger animaciju (domino efekt)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HostPage() {
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    earnings: 0,
    activeListings: 0,
    bookingsMonth: 0,
    avgRating: "N/A" as string | number
  });

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Middleware handles redirect to login
        return;
      }

      // 1. Dohvati aute vlasnika
      const { data: myCars } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!myCars) {
        setLoading(false);
        return;
      }
      
      setCars(myCars);

      if (myCars.length === 0) {
        setLoading(false);
        return;
      }

      const carIds = myCars.map(c => c.id);

      // 2. Dohvati rezervacije
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price, start_date, renter_id')
        .in('car_id', carIds);

      // 3. Dohvati recenzije
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('car_id', carIds);

      // --- FILTRIRANJE ---
      const realBookings = bookings?.filter(b => b.renter_id !== user.id) || [];

      // A) Zarada
      const totalEarnings = realBookings.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);

      // B) Bookings This Month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const bookingsThisMonth = realBookings.filter(b => {
        const d = new Date(b.start_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      // C) Prosječna ocjena
      let avg = "N/A";
      if (reviews && reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        avg = (sum / reviews.length).toFixed(1);
      }

      setStats({
        earnings: totalEarnings,
        activeListings: myCars.length,
        bookingsMonth: bookingsThisMonth,
        avgRating: avg
      });

      setLoading(false);
    }
    getData();
  }, []);

  const handleDelete = async (carId: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovo vozilo? To će obrisati i sve buduće rezervacije!")) return;

    const { error } = await supabase.from('cars').delete().eq('id', carId);

    if (!error) {
      setCars(cars.filter(c => c.id !== carId));
      setStats(prev => ({...prev, activeListings: prev.activeListings - 1}));
      toast.success("Vozilo obrisano.");
    } else {
      toast.error("Greška pri brisanju vozila.");
    }
  };

  const statCards = [
    { label: 'Total Earnings', value: `€${stats.earnings}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Active Listings', value: stats.activeListings, icon: Car, color: 'bg-blue-100 text-blue-600' },
    { label: 'Bookings This Month', value: stats.bookingsMonth, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { label: 'Average Rating', value: stats.avgRating, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER ANIMATION */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="text-5xl mb-2 font-bold">Host Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Manage your car listings and track earnings
              </p>
            </div>
            <Link href="/host/manage_listing">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-3 shadow-lg font-bold"
              >
                <PlusCircle size={20} />
                <span>Add New Listing</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid Animation */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-12">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                variants={itemVariants}
                key={stat.label} 
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  {stat.label === 'Average Rating' && stats.avgRating !== "N/A" && (
                     <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  )}
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Listings Animation */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
        </motion.div>

        {cars.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {cars.map((car) => (
              <motion.div 
                variants={itemVariants}
                key={car.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group relative hover:shadow-xl transition-shadow"
              >
                
                {/* Slika */}
                <div className="h-52 bg-gray-200 relative overflow-hidden">
                  {car.images && car.images.length > 0 ? (
                     <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : car.image_url ? (
                    <img src={car.image_url} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <Car size={40} />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    ACTIVE
                  </div>
                </div>
                
                <button 
                    onClick={() => handleDelete(car.id)}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete Listing"
                >
                    <Trash2 size={20} />
                </button>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{car.make} {car.model}</h3>
                    <div className="text-right">
                       <span className="block text-xl font-black text-blue-600">€{car.price_per_day}</span>
                       <span className="text-xs text-gray-400">/day</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin size={16} /> 
                    <span className="truncate">{car.location || "No location set"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                      <div className="flex flex-col">
                         <span className="text-xs text-gray-400 uppercase">Year</span>
                         <span className="font-semibold">{car.year}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs text-gray-400 uppercase">Fuel</span>
                         <span className="font-semibold">{car.fuel || "-"}</span>
                      </div>
                  </div>
                  
                  <Link href={`/host/manage_listing?id=${car.id}`}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold"
                    >
                       Edit Details
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300"
            >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Car size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No cars listed yet</h3>
                <p className="text-gray-500 mb-6">Start earning by listing your car on RentEase.</p>
                <Link href="/host/manage_listing">
                    <button className="text-white bg-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md">
                        Add your first listing
                    </button>
                </Link>
            </motion.div>
        )}
      </div>
    </div>
  );
}