"use client";

import { CreditCard, Shield, CheckCircle, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { client } from '@/lib/contentful';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const paymentOptions = [
  { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, American Express', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', description: 'Fast and secure online payment', icon: Shield },
  { id: 'bank', name: 'Bank Transfer', description: 'Direct bank transfer', icon: CheckCircle },
];

export default function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const carId = searchParams.get('id');
  const totalPrice = parseFloat(searchParams.get('total') || '0');
  const pickupDate = searchParams.get('pickup') || '';
  const returnDate = searchParams.get('return') || '';

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [carName, setCarName] = useState("Unknown Car");
  const [days, setDays] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('card');

  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({
    cardHolder: false,
    cardNumber: false,
    expiry: false,
    cvv: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  useEffect(() => {
    async function fetchCarDetails() {
      if (!carId) return;

      if (carId.length > 30) {
        const { data } = await supabase.from('cars').select('make, model').eq('id', carId).single();
        if (data) setCarName(`${data.make} ${data.model}`);
      } else if (client) {
         try {
           const res = await client.getEntries({ content_type: 'car', 'fields.slug': carId, limit: 1 });
           if (res.items.length > 0) setCarName(res.items[0].fields.modelName as string);
         } catch(e) { console.error(e); }
      }
      setLoading(false);
    }
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    if (pickupDate && returnDate) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setDays(diffDays > 0 ? diffDays : 0);
    }
  }, [pickupDate, returnDate]);

  const formatDateForSupabase = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
  };

  const handleConfirmPayment = async () => {
    if (selectedMethod === 'card') {
        const newErrors = {
            cardHolder: !formData.cardHolder.trim(),
            cardNumber: !formData.cardNumber.trim(),
            expiry: !formData.expiry.trim(),
            cvv: !formData.cvv.trim()
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(isError => isError)) {
            toast.error("Please fill in all required payment fields.");
            return;
        }
    }

    if (!pickupDate || !returnDate || !carId) {
        toast.error("Missing booking details!");
        return;
    }

    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first.");
        const currentPath = `/booking/payment_options?id=${carId}&total=${totalPrice}&pickup=${pickupDate}&return=${returnDate}`;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      let ownerId = null;
      if (carId.length > 30) {
        const { data } = await supabase.from('cars').select('owner_id').eq('id', carId).single();
        if (data) ownerId = data.owner_id;
      }

      const formattedPickup = formatDateForSupabase(pickupDate);
      const formattedReturn = formatDateForSupabase(returnDate);

      const bookingData = {
        car_id: carId,
        renter_id: user.id,
        owner_id: ownerId,
        start_date: formattedPickup,
        end_date: formattedReturn,
        total_price: totalPrice,
        status: 'confirmed'
      };

      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) throw error;

      toast.success("Booking confirmed!");
      router.push('/my_rentals');

    } catch (e: any) {
      toast.error(`Payment failed: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const insuranceFee = 45;
  const serviceFee = 15;
  const rentalPrice = totalPrice - insuranceFee - serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl mb-2">Payment Options</h1>
          <p className="text-blue-100 text-lg">Complete booking for {carName}</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <Lock className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="text-blue-900 mb-1">Secure Payment Processing</h3>
              <p className="text-sm text-blue-800">Your payment information is encrypted with 256-bit SSL technology.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{
             hidden: { opacity: 0 },
             show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMethod === option.id;
            return (
              <motion.label 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                key={option.id} 
                onClick={() => setSelectedMethod(option.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block bg-white rounded-xl shadow-md p-6 border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 ring-1 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg"><Icon className="text-blue-600" size={24} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900 font-bold">{option.name}</h3>
                      {option.id === 'card' && <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold">Popular</span>}
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </motion.label>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedMethod === 'card' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-100"
            >
              <h2 className="text-2xl mb-6 font-bold">Card Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <input 
                    type="text" 
                    name="cardHolder"
                    placeholder="John Doe" 
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.cardHolder ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  {errors.cardHolder && <p className="text-red-500 text-xs mt-1">Name is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456" 
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.cardNumber ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">Card number is required</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input 
                      type="text" 
                      name="expiry"
                      placeholder="MM/YY" 
                      value={formData.expiry}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.expiry ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input 
                      type="text" 
                      name="cvv"
                      placeholder="123" 
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.cvv ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
                    />
                    {errors.cvv && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100"
        >
          <h3 className="mb-4 font-bold text-lg">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Car Rental ({days} days)</span><span className="font-medium">€{rentalPrice}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Insurance</span><span className="font-medium">€{insuranceFee}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Service Fee</span><span className="font-medium">€{serviceFee}</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between"><span className="font-semibold">Total Amount</span><span className="text-2xl font-black text-blue-600">€{totalPrice}</span></div>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <Link href={`/booking?id=${carId}`} className="flex-1">
            <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium">Back</button>
          </Link>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmPayment} 
            disabled={processing}
            className="flex-1 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 className="animate-spin" /> : "Confirm & Pay"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}