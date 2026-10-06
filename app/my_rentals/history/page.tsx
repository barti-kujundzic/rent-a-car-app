"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Star, StarHalf, X, Loader2, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { ImageWithFallback } from '../../_components/ImageWithFallback';
import { supabase } from '@/lib/supabase';
import { client } from '@/lib/contentful';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; 

function formatDateRaw(dateString: string) {
    if (!dateString) return '';
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}.${month}.${year}.`;
}

// Varijante za listu
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function RentalHistoryPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [historyRentals, setHistoryRentals] = useState<any[]>([]);

  // State za Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [ratingInput, setRatingInput] = useState("0"); 
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // State za Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('renter_id', user.id)
        .order('end_date', { ascending: false });

      if (bookings) {
        const enriched = await Promise.all(bookings.map(async (b) => {
           const endDate = new Date(b.end_date);
           endDate.setHours(23, 59, 59, 999); 

           if (endDate >= new Date()) return null;

           let carData = { name: 'Unknown Car', image: null as string | null };

           if (b.car_id.length > 30) {
              const { data: car } = await supabase.from('cars').select('*').eq('id', b.car_id).single();
              if (car) carData = { name: `${car.make} ${car.model}`, image: car.image_url };
           } else if (client) {
              try {
                  const res = await client.getEntries({ content_type: 'car', 'fields.slug': b.car_id });
                  if (res.items.length > 0) {
                      const f: any = res.items[0].fields;
                      carData = { 
                          name: f.modelName, 
                          image: f.images?.[0]?.fields?.file?.url ? `https:${f.images[0].fields.file.url}` : null 
                      };
                  }
              } catch(e) {}
           }

           return {
               ...b,
               carName: carData.name,
               image: carData.image,
               startDateRaw: b.start_date,
               endDateRaw: b.end_date,
               price: b.total_price || b.price 
           };
        }));

        setHistoryRentals(enriched.filter(Boolean));
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  const promptDelete = (rentalId: string) => {
      setRentalToDelete(rentalId);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!rentalToDelete) return;
      setIsDeleting(true);

      try {
          const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', rentalToDelete);

          if (error) throw error;

          setHistoryRentals(prev => prev.filter(item => item.id !== rentalToDelete));
          setIsDeleteModalOpen(false); 
          setRentalToDelete(null);
          toast.success("Removed from history.");
      } catch (e: any) {
          toast.error(`Error: ${e.message}`);
      } finally {
          setIsDeleting(false);
      }
  };

  const openReviewModal = (rental: any) => {
    setSelectedRental(rental);
    setRatingInput("0");
    setComment("");
    setIsModalOpen(true);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (parseFloat(val) > 5) val = "5";
      if (parseFloat(val) < 0) val = "0";
      setRatingInput(val);
  };

  const submitReview = async () => {
    const numericRating = parseFloat(ratingInput);
    if (!numericRating || numericRating <= 0) { toast.error("Please enter a valid rating (1-5)!"); return; }

    setSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const carIdentifier = selectedRental.car_id || selectedRental.carId;
        
        const { error } = await supabase.from('reviews').insert([{
            car_id: carIdentifier,
            renter_id: user.id,
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            rating: numericRating,
            comment: comment,
            car_model: selectedRental.carName 
        }]);

        if (error) throw error;
        setSuccess(true);
        setTimeout(() => { setIsModalOpen(false); setSuccess(false); setRatingInput("0"); setComment(""); }, 2000);
    } catch (e: any) {
        toast.error(`Failed: ${e.message}`);
    } finally {
        setSubmitting(false);
    }
  };

  const renderDynamicStars = (val: string) => {
      const rating = parseFloat(val) || 0;
      const fullStars = Math.floor(rating);
      const hasHalf = rating % 1 >= 0.3;
      return (
        <div className="flex justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => {
                if (i < fullStars) return <Star key={i} size={40} className="fill-yellow-400 text-yellow-400" />;
                else if (i === fullStars && hasHalf) return <StarHalf key={i} size={40} className="fill-yellow-400 text-yellow-400" />;
                else return <Star key={i} size={40} className="text-gray-300" />;
            })}
        </div>
      );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 w-fit font-medium">
            <ChevronLeft size={20} /><span>Back to My Rentals</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Rental History</h1>
          <p className="text-gray-500 mt-2">Archive of your completed trips</p>
        </motion.div>

        {historyRentals.length > 0 ? (
          <motion.div 
            className="space-y-6"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {historyRentals.map((rental) => (
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                key={rental.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row relative group hover:shadow-lg transition-all"
              >
                
                <button 
                    onClick={() => promptDelete(rental.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                >
                    <Trash2 size={18} />
                </button>

                <div className="md:w-72 h-48 md:h-auto bg-gray-100 relative shrink-0 overflow-hidden">
                  <ImageWithFallback src={rental.image} alt={rental.carName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                      <h3 className="text-2xl font-bold text-gray-800">{rental.carName}</h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
                        <Calendar size={16} /><span>{formatDateRaw(rental.startDateRaw)} — {formatDateRaw(rental.endDateRaw)}</span>
                      </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Paid</p><p className="text-2xl font-black text-gray-700">€{rental.price}</p></div>
                    <div className="flex gap-3">
                        <button onClick={() => openReviewModal(rental)} className="px-5 py-2.5 border border-yellow-500 text-yellow-600 rounded-xl hover:bg-yellow-50 text-sm font-bold flex items-center gap-2 transition-colors">
                            <Star size={16} /> Leave Review
                        </button>
                        <Link href={`/booking?id=${rental.car_id}`}> 
                            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold transition-colors shadow-md hover:shadow-lg">Book Again</button>
                        </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
          >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Calendar size={32} />
              </div>
              <p className="text-gray-500">No history items found.</p>
          </motion.div>
        )}
      </div>

      {/* --- REVIEW MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={() => setIsModalOpen(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative min-h-[300px] flex flex-col justify-center z-10"
                >
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"><X size={24} /></button>

                    {success ? (
                        <div className="text-center">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle className="text-green-600" size={40} />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                            <p className="text-gray-500">Your review has been submitted.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-2 text-center">Rate your trip</h2>
                            <p className="text-gray-500 mb-6 text-center">How was your experience with {selectedRental?.carName}?</p>
                            {renderDynamicStars(ratingInput)}
                            <div className="mb-6 px-12">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Rating (1.0 - 5.0)</label>
                                <input type="number" min="1" max="5" step="0.1" value={ratingInput} onChange={handleRatingChange} className="w-full text-center text-3xl font-bold text-blue-600 border-b-2 border-blue-200 focus:border-blue-600 outline-none py-2 bg-transparent" placeholder="0.0" />
                            </div>
                            <div className="mb-6">
                                <textarea className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none transition-shadow" placeholder="Write a review..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                            </div>
                            <button onClick={submitReview} disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:scale-[1.02]">
                                {submitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={() => setIsDeleteModalOpen(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center z-10"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Rental History?</h3>
                    <p className="text-gray-500 mb-6 text-sm">
                        Are you sure you want to remove this trip from your history? This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={18}/> : "Yes, Delete"}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}