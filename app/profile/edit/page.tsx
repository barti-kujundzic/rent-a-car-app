"use client";

import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    date_of_birth: ''
  });

  const [errors, setErrors] = useState({
    full_name: '',
    phone: '',
    location: ''
  });

  const [email, setEmail] = useState('');

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Middleware handles redirect to login
        return;
      }

      setEmail(user.email || '');

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          date_of_birth: data.date_of_birth || ''
        });
      }
      setLoading(false);
    }
    getData();
  }, []);

  const validateForm = () => {
    let isValid = true;
    let newErrors = { full_name: '', phone: '', location: '' };

    // 1. VALIDACIJA IMENA I PREZIMENA
    const name = formData.full_name.trim();
    if (name.length < 4) {
        newErrors.full_name = "Name must be at least 4 characters long.";
        isValid = false;
    } else if (/\d/.test(name)) {
        newErrors.full_name = "Name cannot contain numbers.";
        isValid = false;
    } else if (!name.includes(' ')) {
        newErrors.full_name = "Please enter both First and Last name.";
        isValid = false;
    }

    // 2. VALIDACIJA TELEFONA
    const phoneRegex = /^[0-9+\s-]*$/;
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');

    if (formData.phone && !phoneRegex.test(formData.phone)) {
        newErrors.phone = "Phone can only contain numbers, +, - and spaces.";
        isValid = false;
    } else if (formData.phone && cleanPhone.length < 6) {
        newErrors.phone = "Phone number is too short.";
        isValid = false;
    } else if (formData.phone && cleanPhone.length > 15) {
        newErrors.phone = "Phone number is too long.";
        isValid = false;
    }

    // 3. VALIDACIJA LOKACIJE
    if (formData.location && formData.location.length < 3) {
        newErrors.location = "Location name is too short.";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
        setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return; 

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
      
      if (error) {
        toast.error("Error saving profile");
      } else {
        router.push('/profile');
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          <h1 className="text-5xl mb-2 font-bold">Edit Profile</h1>
          <p className="text-blue-100 text-lg">Update your personal information</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            
            {/* FULL NAME */}
            <motion.div variants={itemVariants}>
               <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
               <input 
                 name="full_name" 
                 type="text" 
                 placeholder="First and Last Name"
                 value={formData.full_name} 
                 onChange={handleChange} 
                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.full_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
               />
               {errors.full_name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.full_name}</p>}
            </motion.div>

            {/* EMAIL - READ ONLY */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
            </motion.div>
            
            {/* PHONE NUMBER */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
            </motion.div>
            
            {/* LOCATION */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input 
                name="location" 
                type="text" 
                value={formData.location} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`} 
              />
              {errors.location && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.location}</p>}
            </motion.div>
            
            {/* DATE OF BIRTH */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4 pt-6 border-t border-gray-200">
              <Link href="/profile" className="flex-1">
                <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-bold">
                  Cancel
                </button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave} 
                disabled={saving} 
                className="flex-1 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}