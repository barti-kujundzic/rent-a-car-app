"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, LogIn, ShieldCheck, List, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, Variants } from 'framer-motion'; 
import { Outfit } from 'next/font/google';

const logoFont = Outfit({ 
  subsets: ['latin'],
  weight: ['700', '800'] 
});

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setIsLoggedIn(!!data.session);
          setIsLoading(false);
        }
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setIsLoggedIn(!!session);
          setIsLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false); 
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const active = isActive(href);
    return (
      <Link href={href} className="relative px-3 py-2 group whitespace-nowrap">
        <span className={`text-base font-semibold transition-colors ${active ? 'text-blue-700 font-extrabold' : 'text-gray-600 group-hover:text-blue-700'}`}>
          {children}
        </span>
        <span
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-[60%] rounded-full bg-gradient-to-r from-blue-400 via-blue-600 to-cyan-400 opacity-0 scale-x-0 group-hover:opacity-80 group-hover:scale-x-100 transition-all duration-300 ${active ? 'opacity-100 scale-x-100' : ''}`}
        />
      </Link>
    );
  };

  const menuVariants: Variants = {
    closed: { opacity: 0, y: -20, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.07 } }
  };

  const linkVariants: Variants = { closed: { opacity: 0, x: -20 }, open: { opacity: 1, x: 0 } };

  return (
    <motion.nav 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20"> 
          
          <div className="flex-1 flex justify-start items-center">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                {/* Logo image removed as per professor's request */}
                <span className={`${logoFont.className} -ml-4 text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tight`}>
                  RentEase
                </span>
              </motion.div>
            </Link>
          </div>

          {/* SREDINA: Linkovi (text-base) */}
          <div className="hidden xl:flex items-center space-x-8"> 
            <NavLink href="/">Home</NavLink>
            <NavLink href="/browse_cars">Browse</NavLink>
            <NavLink href="/reviews">Reviews</NavLink>
            <NavLink href="/host">Host</NavLink>
            {isLoggedIn && (
              <>
                <NavLink href="/profile">Profile</NavLink>
                <NavLink href="/my_rentals">My Rentals</NavLink>
                <NavLink href="/support&safety">Support</NavLink>
              </>
            )}
          </div>

          {/* DESNA STRANA: Logout */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-3">
            {isLoading ? (
               <Loader2 className="animate-spin text-blue-600" size={24} />
            ) : isLoggedIn ? (
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleSignOut} 
                className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <motion.button whileHover={{ scale: 1.05 }} className="text-gray-600 hover:text-blue-600 font-bold text-base px-4 py-2">
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          <div className="xl:hidden flex items-center ml-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 bg-gray-50 p-2.5 rounded-lg">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="closed" animate="open" exit="closed" variants={menuVariants}
            className="xl:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl left-0 h-screen overflow-y-auto pb-20"
          >
            <div className="px-6 pt-8 space-y-6">
              <motion.div variants={linkVariants}><Link href="/" onClick={() => setIsOpen(false)} className="block text-xl font-bold text-gray-800">Home</Link></motion.div>
              <motion.div variants={linkVariants}><Link href="/browse_cars" onClick={() => setIsOpen(false)} className="block text-xl font-bold text-gray-800">Browse Cars</Link></motion.div>
              <motion.div variants={linkVariants}><Link href="/reviews" onClick={() => setIsOpen(false)} className="block text-xl font-bold text-gray-800">Reviews</Link></motion.div>
              <motion.div variants={linkVariants}><Link href="/host" onClick={() => setIsOpen(false)} className="block text-xl font-bold text-gray-800">Host Dashboard</Link></motion.div>
              
              {isLoggedIn && (
                 <motion.div variants={linkVariants} className="space-y-6 border-t pt-6">
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-gray-700 font-medium"><User size={20} className="text-blue-600"/> Profile</Link>
                    <Link href="/my_rentals" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-gray-700 font-medium"><List size={20} className="text-blue-600"/> My Rentals</Link>
                    <Link href="/support&safety" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-gray-700 font-medium"><ShieldCheck size={20} className="text-blue-600"/> Support</Link>
                 </motion.div>
              )}

              <motion.div variants={linkVariants} className="pt-6 border-t border-gray-100">
                {isLoading ? <Loader2 className="animate-spin text-blue-600 mx-auto"/> : isLoggedIn ? (
                  <button onClick={handleSignOut} className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold text-lg flex justify-center gap-2 border border-red-100"><LogOut size={22}/> Log Out</button>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Link href="/login" onClick={() => setIsOpen(false)}><button className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg">Sign In</button></Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}><button className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg">Sign Up</button></Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}