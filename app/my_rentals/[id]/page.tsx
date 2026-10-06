"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, Phone, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../../_components/ImageWithFallback';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { client } from '@/lib/contentful';
import { motion } from 'framer-motion'; 

export default function RentalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState<any>(null);

  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) return;

      const { data: booking, error } = await supabase
        .from('bookings') 
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        setLoading(false);
        return;
      }

      let carData: any = { model: 'Unknown', image: null, location: 'Unknown' };

      if (booking.car_id && booking.car_id.length > 30) {
          const { data: car } = await supabase.from('cars').select('*').eq('id', booking.car_id).single();
          if (car) {
              carData = { model: `${car.make} ${car.model}`, image: car.image_url, location: car.location };
          }
      } 
      else if (client && booking.car_id) {
          try {
              const res = await client.getEntries({ content_type: 'car', 'fields.slug': booking.car_id, limit: 1 });
              if (res.items.length > 0) {
                  const f: any = res.items[0].fields;
                  carData = { model: f.modelName, image: f.images?.[0]?.fields?.file?.url ? `https:${f.images[0].fields.file.url}` : null, location: f.location };
              }
          } catch (e) {}
      }

      const getStatus = (startStr: string, endStr: string) => {
          const now = new Date();
          const start = new Date(startStr);
          const end = new Date(endStr);
          if (now > end) return 'Completed';
          if (now >= start && now <= end) return 'Active';
          return 'Upcoming';
      };

      setRental({
          ...booking,
          carName: carData.model,
          image: carData.image,
          location: carData.location,
          pickupDate: new Date(booking.start_date).toLocaleDateString(),
          returnDate: new Date(booking.end_date).toLocaleDateString(),
          price: booking.total_price,
          status: getStatus(booking.start_date, booking.end_date)
      });
      
      setLoading(false);
    }

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Rental Not Found</h2>
        <Link href="/my_rentals">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Back to My Rentals
          </button>
        </Link>
      </div>
    );
  }

  const isActive = rental.status === 'Active';
  const isUpcoming = rental.status === 'Upcoming';
  const statusColorBg = isActive ? 'bg-green-50' : (isUpcoming ? 'bg-blue-50' : 'bg-gray-50');
  const statusColorText = isActive ? 'text-green-700' : (isUpcoming ? 'text-blue-700' : 'text-gray-700');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit font-medium"
          >
            <ChevronLeft size={20} />
            <span>Back to My Rentals</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
            <div className={`${statusColorBg} border-b border-gray-100 px-8 py-4 flex justify-between items-center`}>
                <div className={`flex items-center gap-2 ${statusColorText} font-bold`}>
                    {isActive ? <Clock size={20} /> : <Calendar size={20} />}
                    <span>{rental.status} Rental</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto bg-gray-200 relative overflow-hidden group">
                    <ImageWithFallback 
                        src={rental.image} 
                        alt={rental.carName} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-gray-900">{rental.carName}</h1>
                        <p className="text-gray-400 font-mono text-xs bg-gray-50 w-fit px-2 py-1 rounded">
                            ID: {rental.id.slice(0, 8)}...
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg"><Calendar className="text-blue-600" size={20} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Rental Period</p>
                                <p className="font-bold text-gray-800">{rental.pickupDate} — {rental.returnDate}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg"><MapPin className="text-blue-600" size={20} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Location</p>
                                <p className="font-bold text-gray-800">{rental.location}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg"><Phone className="text-blue-600" size={20} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Support</p>
                                <a href="tel:+385912345678" className="text-blue-600 hover:underline text-sm font-bold">+385 91 234 5678</a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600 font-medium">Total Paid</span>
                            <span className="text-3xl font-black text-blue-600">€{rental.price}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                             <button className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold">
                                <AlertTriangle size={18} /> Report Issue
                             </button>
                             {isUpcoming && (
                                <button className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md">
                                    Manage Booking
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}