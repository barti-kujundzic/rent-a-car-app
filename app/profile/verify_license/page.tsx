"use client";

import { ChevronLeft, Upload, Shield, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; 

// Animacijske varijante
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export default function VerifyLicensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    license_number: '',
    license_expiry: '',
    license_country: ''
  });

  const [errors, setErrors] = useState({
    license_number: '',
    license_expiry: '',
    license_country: '',
    file: ''
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = { license_number: '', license_expiry: '', license_country: '', file: '' };

    if (!formData.license_number.trim() || formData.license_number.length < 5) {
      newErrors.license_number = 'License number must be at least 5 characters long.';
      isValid = false;
    }

    if (!formData.license_expiry) {
        newErrors.license_expiry = 'Expiry date is required.';
        isValid = false;
    } else {
        const expiryDate = new Date(formData.license_expiry);
        const today = new Date();
        if (expiryDate < today) {
            newErrors.license_expiry = 'License has already expired.';
            isValid = false;
        }
    }

    if (!formData.license_country) {
      newErrors.license_country = 'Please select a country.';
      isValid = false;
    }

    if (!file) {
      newErrors.file = 'Please upload a photo of your license.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      let licenseImageUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-license-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('licenses')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('licenses')
          .getPublicUrl(fileName);
          
        licenseImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          license_number: formData.license_number,
          license_expiry: formData.license_expiry,
          license_country: formData.license_country,
          license_image_url: licenseImageUrl,
          is_verified: true 
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      toast.success("License verification submitted successfully!");
      router.push('/profile');

    } catch (error) {
      console.error(error);
      toast.error("Error submitting license verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft size={20} />
            <span>Back to Profile</span>
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl mb-2 font-bold">Verify Driver's License</h1>
          <p className="text-blue-100 text-lg">Upload your license for verification</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
          <h3 className="mb-6 font-bold text-xl text-gray-800">License Information</h3>
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            
            {/* BROJ DOZVOLE */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input 
                name="license_number" 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g. 12345678" 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.license_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
              />
              {errors.license_number && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.license_number}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DATUM ISTEKA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input 
                    name="license_expiry" 
                    onChange={handleInputChange} 
                    type="date" 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.license_expiry ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
                />
                {errors.license_expiry && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.license_expiry}</p>}
              </div>

              {/* DRŽAVA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Country</label>
                <select 
                    name="license_country" 
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.license_country ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="">Select country...</option>
                  <option value="Croatia">Croatia</option>
                  <option value="Slovenia">Slovenia</option>
                  <option value="Serbia">Serbia</option>
                  <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                  <option value="Montenegro">Montenegro</option>
                  <option value="Germany">Germany</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                  <option value="France">France</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Other">Other</option>
                </select>
                {errors.license_country && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.license_country}</p>}
              </div>
            </motion.div>

            {/* UPLOAD */}
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Upload License Photo</label>
              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#f9fafb' }}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer relative ${errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-600'}`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      setErrors({ ...errors, file: '' });
                  }}
                />
                <Upload className={`mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} size={48} />
                <p className="text-gray-600 mb-1 font-medium">{file ? file.name : "Click to upload or drag and drop"}</p>
                <p className="text-sm text-gray-500">PNG, JPG or PDF (max. 5MB)</p>
              </motion.div>
              {errors.file && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.file}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4 pt-6 border-t border-gray-200">
              <Link href="/profile" className="flex-1">
                <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-bold">Cancel</button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-1 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex justify-center items-center gap-2 shadow-md"
              >
                {loading ? <Loader2 className="animate-spin"/> : "Submit for Verification"}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}