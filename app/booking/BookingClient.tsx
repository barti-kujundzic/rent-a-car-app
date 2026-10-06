"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { client } from '@/lib/contentful';
import { supabase } from '@/lib/supabase';
import { Calendar as CalendarIcon, CreditCard, CheckCircle, ArrowRight, Loader2, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const steps = [
  { number: 1, title: 'Driver Info', description: 'Personal details', icon: CheckCircle, status: 'completed' },
  { number: 2, title: 'Select Dates', description: 'Pickup & Return', icon: CalendarIcon, status: 'active' },
  { number: 3, title: 'Payment', description: 'Secure checkout', icon: CreditCard, status: 'pending' },
];

export default function BookingClient() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('id');

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  const getDaysArray = (start: Date, end: Date) => {
    const arr = [];
    for(const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
  };

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         setIsLoggedIn(false);
      } else {
         setIsLoggedIn(true);
      }

      if (!carId) { setLoading(false); return; }

      // 2. Dohvat Auta
      if (carId.length > 30) {
        const { data } = await supabase.from('cars').select('*').eq('id', carId).single();
        if (data) {
          setCar({
            modelName: `${data.make} ${data.model}`,
            pricePerDay: data.price_per_day,
          });
        }
      } else if (client) {
        try {
          const res = await client.getEntries({ content_type: 'car', 'fields.slug': carId, limit: 1 });
          if (res.items.length > 0) setCar(res.items[0].fields);
        } catch (e) {}
      }

      // 3. DOHVAT ZAUZETIH TERMINA
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('car_id', carId)
        .neq('status', 'cancelled');

      if (existingBookings) {
        let allBlocked: Date[] = [];
        existingBookings.forEach((b: any) => {
            const days = getDaysArray(new Date(b.start_date), new Date(b.end_date));
            allBlocked = [...allBlocked, ...days];
        });
        setBlockedDates(allBlocked);
      }

      setLoading(false);
    }
    fetchData();
  }, [carId]);

  useEffect(() => {
    if (pickupDate && returnDate) {
      const diffTime = returnDate.getTime() - pickupDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalDays(diffDays > 0 ? diffDays : 0);
    }
  }, [pickupDate, returnDate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  if (!isLoggedIn) {
    const redirectUrl = encodeURIComponent(`/booking?id=${carId}`);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full border border-gray-100"
        >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Prijava potrebna</h1>
            <p className="text-gray-500 mb-8">
                Kako biste mogli rezervirati vozilo, molimo vas da se prijavite ili registrirate.
            </p>
            <div className="space-y-3">
                <Link href={`/login?redirect=${redirectUrl}`} className="block w-full">
                    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2">
                        <LogIn size={20} />
                        Prijavi se i nastavi
                    </button>
                </Link>
                <Link href={`/browse_cars`} className="block w-full">
                    <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                        Odustani
                    </button>
                </Link>
            </div>
        </motion.div>
      </div>
    );
  }

  if (!car) return <div>Car not found</div>;

  const dailyRate = car.pricePerDay || 0;
  const insuranceFee = 45;
  const serviceFee = 15;
  const carTotal = dailyRate * totalDays;
  const grandTotal = carTotal + insuranceFee + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Book Your {car.modelName}</h1>
              <p className="text-blue-100">Step 2: Select rental dates</p>
            </div>
            <div className="hidden md:block text-right">
                <p className="text-sm opacity-80">Daily Rate</p>
                <p className="text-3xl font-bold">€{dailyRate}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md p-6 border transition-all ${step.status === 'active' ? 'border-blue-600 ring-2 ring-blue-100 transform scale-105' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step.status === 'active' ? 'bg-blue-600 text-white' : step.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step.number}
                </div>
                <div>
                  <h3 className={`font-bold ${step.status === 'active' ? 'text-blue-900' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CalendarIcon className="text-blue-600"/> Select Dates
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                  <div className="customDatePickerWidth">
                    <DatePicker 
                        selected={pickupDate} 
                        onChange={(date: Date | null) => setPickupDate(date)} 
                        selectsStart
                        startDate={pickupDate}
                        endDate={returnDate}
                        minDate={new Date()}
                        excludeDates={blockedDates}
                        placeholderText="Select pickup date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-shadow"
                        wrapperClassName="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date</label>
                  <div className="customDatePickerWidth">
                    <DatePicker 
                        selected={returnDate} 
                        onChange={(date: Date | null) => setReturnDate(date)} 
                        selectsEnd
                        startDate={pickupDate}
                        endDate={returnDate}
                        minDate={pickupDate || new Date()}
                        excludeDates={blockedDates}
                        placeholderText="Select return date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-shadow"
                        wrapperClassName="w-full"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {totalDays > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 flex items-center gap-3 overflow-hidden"
                  >
                      <CheckCircle size={20} className="text-blue-600"/>
                      <span>Excellent choice! You selected <strong>{totalDays} days</strong>.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-10 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 border-b pb-4">Booking Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 font-medium">{car.modelName}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">x{totalDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate (€{dailyRate}/day)</span>
                    <span className="font-medium">€{carTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium">€{insuranceFee}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">€{serviceFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <motion.span 
                    key={grandTotal} // Animira promjenu cijene
                    initial={{ scale: 1.2, color: '#2563EB' }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-black text-blue-600"
                  >
                    {totalDays > 0 ? `€${grandTotal}` : '---'}
                  </motion.span>
                </div>
              </div>
              
              <Link href={
                  totalDays > 0 && pickupDate && returnDate 
                  ? `/booking/payment_options?id=${carId}&total=${grandTotal}&pickup=${pickupDate.toISOString()}&return=${returnDate.toISOString()}` 
                  : '#'
              }>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={totalDays <= 0} 
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${totalDays > 0 ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Proceed to Payment <ArrowRight size={20}/>
                </motion.button>
              </Link>
              {totalDays <= 0 && (<p className="text-xs text-center text-gray-400 mt-3">Please select valid dates to continue</p>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}