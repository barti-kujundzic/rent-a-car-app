"use client";

import { Loader2, LogIn, AlertCircle, Star, StarHalf, X, CheckCircle, Trash2, AlertTriangle, Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '../_components/ImageWithFallback';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { client } from '@/lib/contentful';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; 

// --- POMOĆNE FUNKCIJE ---
function formatDateRaw(dateString: string) {
  if (!dateString) return '';
  const cleanDate = dateString.split('T')[0];
  const [year, month, day] = cleanDate.split('-');
  return `${day}.${month}.${year}.`;
}

// Animacijske varijante
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

export default function MyRentalsPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRentals, setActiveRentals] = useState<any[]>([]);
  const [upcomingRentals, setUpcomingRentals] = useState<any[]>([]);

  // State za Review modal
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [rentalToReview, setRentalToReview] = useState<any>(null);
  const [ratingInput, setRatingInput] = useState("0");
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // State za DELETE Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const promptDelete = (id: string) => {
      setBookingToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!bookingToDelete) return;
      setIsDeleting(true);
      try {
          const { error, count } = await supabase
            .from('bookings')
            .delete({ count: 'exact' }) 
            .eq('id', bookingToDelete);

          if (error) throw error;

          if (count === 0) {
            toast.error("Nije moguće obrisati: Čini se da ova rezervacija ne pripada trenutno prijavljenom korisniku.");
            setIsDeleteModalOpen(false);
            return;
          }

          setActiveRentals(prev => prev.filter(r => r.id !== bookingToDelete));
          setUpcomingRentals(prev => prev.filter(r => r.id !== bookingToDelete));
          
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
          toast.success("Booking cancelled successfully.");
      } catch (error: any) {
          toast.error("Greška pri brisanju: " + error.message);
      } finally {
          setIsDeleting(false);
      }
  };

  useEffect(() => {
    async function getRentals() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) { 
          setIsLoggedIn(false); 
          setLoading(false); 
          return; 
      }
      
      const user = session.user;
      setIsLoggedIn(true);

      const { data: bookings } = await supabase
        .from('bookings').select('*').eq('renter_id', user.id).order('start_date', { ascending: true });

      if (!bookings || bookings.length === 0) {
          setActiveRentals([]); setUpcomingRentals([]); setLoading(false); return;
      }

      const { data: userReviews } = await supabase.from('reviews').select('car_id').eq('renter_id', user.id);
      const reviewedCarIds = new Set(userReviews?.map(r => r.car_id));

      const enriched = await Promise.all(bookings.map(async (b) => {
          let carData = { name: 'Loading...', image: null as string | null, location: 'Unknown' };
          
          if (b.car_id.length > 30) { 
            const { data: car } = await supabase.from('cars').select('*').eq('id', b.car_id).single();
            if (car) carData = { name: `${car.make} ${car.model}`, image: car.image_url || (car.images ? car.images[0] : null), location: car.location };
          } 
          else if (client) {
             try {
                const res = await client.getEntries({ content_type: 'car', 'fields.slug': b.car_id });
                if (res.items.length > 0) {
                   const f: any = res.items[0].fields;
                   carData = { name: f.modelName, image: f.images?.[0]?.fields?.file?.url ? `https:${f.images[0].fields.file.url}` : null, location: f.location };
                }
             } catch(e) {}
          }

          const now = new Date();
          const start = new Date(b.start_date); start.setHours(0, 0, 0, 0); 
          const end = new Date(b.end_date); end.setHours(23, 59, 59, 999); 
          
          let status = 'Upcoming';
          if (now > end) status = 'Past'; else if (now >= start) status = 'Active';
          
          return { ...b, ...carData, computedStatus: status };
      }));

      setActiveRentals(enriched.filter(r => r.computedStatus === 'Active'));
      setUpcomingRentals(enriched.filter(r => r.computedStatus === 'Upcoming'));

      const sortedByRecent = [...enriched].sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
      const unreviewedRental = sortedByRecent.find(r => {
          if (reviewedCarIds.has(r.car_id)) return false;
          if (localStorage.getItem(`dismiss_review_${r.id}`)) return false;
          if (r.computedStatus !== 'Past') return false; 
          const hoursSinceEnd = (new Date().getTime() - new Date(r.end_date).setHours(23,59,59,999)) / (1000 * 60 * 60);
          return hoursSinceEnd < 48; 
      });
      
      if (unreviewedRental) { setRentalToReview(unreviewedRental); setShowThankYouModal(true); }
      
      setLoading(false);
    }
    getRentals();
  }, []);

  const handleDismiss = () => {
      if (rentalToReview) { localStorage.setItem(`dismiss_review_${rentalToReview.id}`, 'true'); setShowThankYouModal(false); }
  };
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value; if (parseFloat(val) > 5) val = "5"; if (parseFloat(val) < 0) val = "0"; setRatingInput(val);
  };
  const submitReview = async () => {
    const numericRating = parseFloat(ratingInput);
    if (!numericRating || numericRating <= 0) { toast.error("Please enter a rating."); return; }
    setReviewSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
        const { error } = await supabase.from('reviews').insert([{
            car_id: rentalToReview.car_id, renter_id: user.id, user_name: user.user_metadata?.full_name || user.email?.split('@')[0], rating: numericRating, comment: comment, car_model: rentalToReview.name 
        }]);
        if (error) throw error; setReviewSuccess(true); setTimeout(() => { setShowThankYouModal(false); setReviewSuccess(false); }, 2500);
    } catch (e) { console.error(e); toast.error("Something went wrong."); } finally { setReviewSubmitting(false); }
  };
  const renderDynamicStars = (val: string) => {
      const rating = parseFloat(val) || 0; const fullStars = Math.floor(rating); const hasHalf = rating % 1 >= 0.3;
      return (<div className="flex justify-center gap-2 mb-4">{[...Array(5)].map((_, i) => { if (i < fullStars) return <Star key={i} size={32} className="fill-yellow-400 text-yellow-400" />; else if (i === fullStars && hasHalf) return <StarHalf key={i} size={32} className="fill-yellow-400 text-yellow-400" />; else return <Star key={i} size={32} className="text-gray-300" />; })}</div>);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!isLoggedIn) return (<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center"><Link href="/login"><button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl">Login</button></Link></div>);

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl mb-2 font-bold">My Rentals</h1>
          <p className="text-blue-100 text-lg">Track and manage your car rentals</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ACTIVE RENTALS */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl mb-6 font-bold text-gray-800"
          >
            Active Rentals
          </motion.h2>
          
          {activeRentals.length > 0 ? (
             <motion.div 
               className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
               variants={containerVariants}
               initial="hidden"
               animate="show"
             >
                {activeRentals.map(rental => (
                   <motion.div 
                     variants={itemVariants}
                     whileHover={{ y: -5 }}
                     key={rental.id} 
                     className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-green-500 relative group"
                   >
                      <button 
                        onClick={() => promptDelete(rental.id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100"
                        title="Obriši rezervaciju"
                      >
                        <Trash2 size={20} />
                      </button>

                      <Link href={`/my_rentals/${rental.id}`}>
                         <div className="h-52 bg-gray-200 cursor-pointer relative overflow-hidden">
                            <ImageWithFallback src={rental.image} alt={rental.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                                LIVE
                            </div>
                         </div>
                      </Link>
                      <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900">{rental.name}</h3>
                          <div className="mt-3 text-sm text-gray-600 space-y-1">
                             <p className="flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> {formatDateRaw(rental.start_date)} — {formatDateRaw(rental.end_date)}</p>
                             <p className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {rental.location}</p>
                          </div>
                          <Link href={`/my_rentals/${rental.id}`} className="mt-4 block text-blue-600 font-bold text-sm hover:underline">View Details &rarr;</Link>
                      </div>
                   </motion.div>
                ))}
             </motion.div>
          ) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 italic">No active rentals.</motion.p>}
        </div>

        {/* UPCOMING RENTALS */}
        <div className="mb-12">
           <motion.h2 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="text-3xl mb-6 font-bold text-gray-800"
           >
             Upcoming Rentals
           </motion.h2>
           
           {upcomingRentals.length > 0 ? (
             <motion.div 
               className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
               variants={containerVariants}
               initial="hidden"
               animate="show"
             >
                {upcomingRentals.map(rental => (
                   <motion.div 
                     variants={itemVariants}
                     whileHover={{ y: -5 }}
                     key={rental.id} 
                     className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 relative group transition-shadow hover:shadow-xl"
                   >
                      <button 
                        onClick={() => promptDelete(rental.id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100"
                        title="Obriši rezervaciju"
                      >
                        <Trash2 size={20} />
                      </button>

                      <Link href={`/my_rentals/${rental.id}`}>
                          <div className="h-52 bg-gray-200 cursor-pointer relative overflow-hidden">
                             <ImageWithFallback src={rental.image} alt={rental.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                      </Link>
                      <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-xl font-bold text-gray-900">{rental.name}</h3>
                             <span className="bg-blue-50 text-blue-700 px-2 py-1 text-xs font-bold rounded-lg border border-blue-100">Upcoming</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                             <p className="flex items-center gap-2"><Calendar size={14} className="text-gray-400"/> {formatDateRaw(rental.start_date)} — {formatDateRaw(rental.end_date)}</p>
                          </div>
                          <Link href={`/my_rentals/${rental.id}`} className="mt-4 block text-blue-600 font-bold text-sm hover:underline">View Details &rarr;</Link>
                      </div>
                   </motion.div>
                ))}
             </motion.div>
           ) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 italic">No upcoming rentals.</motion.p>}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between flex-wrap gap-4"
        >
            <div>
               <h3 className="text-lg font-bold text-gray-900">Looking for past trips?</h3>
               <p className="text-gray-500 text-sm">View your complete rental history and receipts.</p>
            </div>
            <Link href="/my_rentals/history">
               <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                 View History
               </button>
            </Link>
        </motion.div>
      </div>

      {/* --- DELETE MODAL --- */}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Otkaži rezervaciju?</h3>
                    <p className="text-gray-500 mb-6 text-sm">
                        Jesi li siguran da želiš otkazati i obrisati ovu rezervaciju? Ova radnja se ne može poništiti.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Odustani
                        </button>
                        <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                            {isDeleting ? <Loader2 className="animate-spin" size={18}/> : "Da, obriši"}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- REVIEW MODAL --- */}
      <AnimatePresence>
        {showThankYouModal && rentalToReview && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                  onClick={handleDismiss}
              />
              <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden z-10"
              >
                  <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 transition-colors"><X size={24} /></button>
                  {reviewSuccess ? (
                      <div className="text-center py-10">
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                          >
                              <CheckCircle className="text-green-600" size={40} />
                          </motion.div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hvala!</h2>
                      </div>
                  ) : (
                      <>
                          <div className="text-center mb-8 pt-4">
                              <h2 className="text-3xl font-bold text-gray-900 mb-2">Vožnja završena! 🎉</h2>
                              <p className="text-gray-500">Kako je bilo iskustvo s <strong>{rentalToReview.name}</strong>?</p>
                          </div>
                          {renderDynamicStars(ratingInput)}
                          <div className="mb-6 px-8">
                              <input type="number" min="1" max="5" step="0.1" value={ratingInput} onChange={handleRatingChange} className="w-full text-center text-3xl font-bold text-blue-600 border-b-2 border-blue-100 focus:border-blue-600 outline-none py-2" placeholder="0.0"/>
                          </div>
                          <div className="mb-6">
                              <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Podijeli svoje dojmove..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                          </div>
                          <div className="flex flex-col gap-3">
                              <button onClick={submitReview} disabled={reviewSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                                  {reviewSubmitting ? <Loader2 className="animate-spin" /> : "Pošalji recenziju"}
                              </button>
                              <button onClick={handleDismiss} className="w-full text-gray-400 py-2 text-sm font-medium hover:text-gray-600 transition-colors">Ne prikazuj ovo više</button>
                          </div>
                      </>
                  )}
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}