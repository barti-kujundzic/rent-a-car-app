"use client";

import { ChevronLeft, Upload, Save, Loader2, X, CheckCircle, Trash2, Fuel } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageListingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!carId);
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 5,
    transmission: 'automatic',
    fuel: 'Diesel',
    description: '',
    price_per_day: '',
    location: ''
  });

  useEffect(() => {
    if (!carId) return;

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (data) {
        setFormData({
          make: data.make,
          model: data.model,
          year: data.year,
          seats: data.seats,
          transmission: data.transmission,
          fuel: data.fuel || 'Diesel',
          description: data.description || '',
          price_per_day: data.price_per_day,
          location: data.location
        });

        if (data.images && data.images.length > 0) {
            setExistingImages(data.images);
        } else if (data.image_url) {
            setExistingImages([data.image_url]);
        }
      }
      setFetching(false);
    }

    fetchCar();
  }, [carId]);

  useEffect(() => {
    return () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const filesArray = Array.from(e.target.files);
          setNewFiles(prev => [...prev, ...filesArray]);
          const newPreviews = filesArray.map(file => URL.createObjectURL(file));
          setPreviewUrls(prev => [...prev, ...newPreviews]);
      }
  };

  const removeNewImage = (index: number) => {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const uploadPromises = newFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('car-images')
                .getPublicUrl(fileName);
            
            return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const finalImages = [...existingImages, ...uploadedUrls];
        const mainImage = finalImages.length > 0 ? finalImages[0] : null;

        const carData = {
            owner_id: user.id,
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year.toString()),
            seats: parseInt(formData.seats.toString()),
            transmission: formData.transmission,
            fuel: formData.fuel,
            description: formData.description,
            price_per_day: parseFloat(formData.price_per_day),
            location: formData.location,
            images: finalImages,
            image_url: mainImage
        };

        let error;

        if (carId) {
            const res = await supabase.from('cars').update(carData).eq('id', carId);
            error = res.error;
        } else {
            const res = await supabase.from('cars').insert([carData]);
            error = res.error;
        }

        if (error) throw error;

        setShowSuccessModal(true);

        setTimeout(() => {
            router.push('/host');
        }, 2000);

    } catch (error) {
        console.error("Error saving listing:", error);
        toast.error("Failed to save listing.");
    } finally {
        setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/host" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft size={20} /><span>Back to Host Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl mb-2">{carId ? 'Edit Listing' : 'Add New Listing'}</h1>
          <p className="text-blue-100 text-lg">
            {carId ? 'Update your car details' : 'Add a new car to your fleet'}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
          <h2 className="text-2xl mb-6 font-bold text-gray-800">Car Information</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <input name="make" value={formData.make} onChange={handleChange} type="text" placeholder="e.g., Audi" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input name="model" value={formData.model} onChange={handleChange} type="text" placeholder="e.g., A6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input name="year" value={formData.year} onChange={handleChange} type="number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                <select name="seats" value={formData.seats} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="8">8+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel</label>
                <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe the condition, features, etc." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (€)</label>
                <input name="price_per_day" value={formData.price_per_day} onChange={handleChange} type="number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} type="text" placeholder="e.g. Zagreb Airport" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Car Photos</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <AnimatePresence>
                    {existingImages.map((url, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            key={`exist-${idx}`} 
                            className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200"
                        >
                            <img src={url} alt="Car" className="w-full h-full object-cover" />
                            <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}

                    {previewUrls.map((url, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            key={`new-${idx}`} 
                            className="relative aspect-video rounded-lg overflow-hidden group border-2 border-blue-200"
                        >
                            <img src={url} alt="New Upload" className="w-full h-full object-cover" />
                            <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md text-red-500 hover:bg-red-50">
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                  </AnimatePresence>

                  <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-xs text-gray-500 font-medium">Add Photos</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileSelect} 
                      />
                  </label>
              </div>
              <p className="text-xs text-gray-400">Supported: JPG, PNG. Add multiple photos to showcase your car.</p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link href="/host" className="flex-1">
                <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium">
                  Cancel
                </button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {carId ? 'Update Listing' : 'Publish Listing'}</>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- ANIMIRANI SUCCESS MODAL --- */}
      <AnimatePresence>
        {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative z-10"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                    <p className="text-gray-500">
                        {carId ? "Your listing has been updated." : "Your car is now listed!"}
                    </p>
                    <div className="mt-6 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="h-full bg-green-500"
                        />
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}