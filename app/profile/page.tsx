"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit, Shield, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; // <--- DODANO

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

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [user, setUser] = useState<any>(null); 
  const [profile, setProfile] = useState<any>(null); 

  // --- DOHVAĆANJE PODATAKA ---
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Middleware handles redirect to login
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data?.avatar_url) {
        const timestamp = Date.now();
        const separator = data.avatar_url.includes('?') ? '&' : '?';
        data.avatar_url = `${data.avatar_url}${separator}t=${timestamp}`;
      }

      setProfile(data);
      setLoading(false);
    }

    getProfile();
  }, []);

  // --- UPLOAD SLIKE ---
  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingImage(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${user.id}/avatar-${timestamp}.${fileExt}`;

      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list(user.id);
        
        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(filesToRemove);
        }
      } catch (deleteError) {
        console.log('No old avatar to delete or error:', deleteError);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      const freshUrl = `${publicUrl}?t=${timestamp}`;

      setProfile((prev: any) => ({
        ...prev,
        avatar_url: freshUrl,
        updated_at: new Date().toISOString()
      }));
      
      toast.success('Avatar updated successfully!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar!');
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-16 flex justify-between items-center"
        >
          <div>
            <h1 className="text-5xl mb-2 font-bold">My Profile</h1>
            <p className="text-blue-100 text-lg">Manage your account information</p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* GLAVNA KARTICA PROFILA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-100"
        >
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-6">
              
              {/* AVATAR KONTJNER */}
              <div className="relative group w-24 h-24">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md"
                >
                  {profile?.avatar_url ? (
                    <img 
                      key={profile.avatar_url}
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <User size={32} />
                    </div>
                  )}
                  {uploadingImage && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                </motion.div>
                
                {/* KAMERA GUMB ZA UPLOAD */}
                <motion.label 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors z-10"
                >
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploadingImage} className="hidden" />
                </motion.label>
              </div>

              {/* PODACI KORISNIKA */}
              <div>
                <h2 className="text-2xl mb-1 font-bold">{profile?.full_name || 'User'}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {profile?.is_verified ? (
                      <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-700 text-sm border border-green-100 font-medium">
                         <Shield size={14} /> Verified Driver
                      </span>
                  ) : (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-500 text-sm border border-gray-200 font-medium">
                         <Shield size={14} /> Not Verified
                      </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link href="/profile/edit">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold"
              >
                <Edit size={18} /> Edit Profile
              </motion.button>
            </Link>
          </div>

          {/* GRID PODATAKA (ANIMIRANI) */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
                { icon: User, label: "Full Name", value: profile?.full_name },
                { icon: Mail, label: "Email", value: user?.email },
                { icon: Phone, label: "Phone", value: profile?.phone },
                { icon: MapPin, label: "Location", value: profile?.location },
                { icon: Calendar, label: "Date of Birth", value: profile?.date_of_birth },
            ].map((item, index) => (
                <motion.div variants={itemVariants} key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <item.icon className="text-blue-400" size={20} />
                    <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">{item.label}</p>
                        <p className="font-medium text-gray-900">{item.value || '-'}</p>
                    </div>
                </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
          <h3 className="mb-6 font-bold text-lg text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/profile/edit">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Edit className="text-gray-500 group-hover:text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-700">Edit Profile</div>
                  <div className="text-sm text-gray-500">Update your information</div>
                </div>
              </motion.button>
            </Link>
            <Link href="/profile/verify_license">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                    <Shield className="text-gray-500 group-hover:text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-700">Verify License</div>
                  <div className="text-sm text-gray-500">Add or update license</div>
                </div>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}