"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, LogIn, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Hvatanje returnUrl parametra koji šalje BookClient ili redirect od middleware
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');
  const prefillEmail = searchParams.get('email');
  const msgFromUrl = searchParams.get('msg');
  const oauthError = searchParams.get('oauth_error');
  const signupComplete = searchParams.get('signup_complete');

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (msgFromUrl) setError(msgFromUrl);
    if (oauthError === '1' && !msgFromUrl) setError('OAuth failed. Please try again.');
    if (signupComplete === '1') setNotice('Registration successful! You can now sign in.');
  }, [prefillEmail, msgFromUrl, oauthError, signupComplete]);

 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled && session) {
        const target = returnUrl ? decodeURIComponent(returnUrl) : '/profile';
        if (target.startsWith('/login')) {
          router.replace('/profile');
        } else {
          router.replace(target);
        }
        router.refresh();
      }
    })();
    return () => { cancelled = true; };
  }, [router, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Email i lozinka su obavezni.");
      setLoading(false);
      return;
    }

    // Prijava putem Supabase-a
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      // Do not auto-redirect; show helpful guidance
      const msg = authError.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
        setError('Incorrect email or password. If you registered with Google/GitHub, use those buttons or reset your password.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // Osiguraj da je sesija spremljena prije preusmjeravanja
    await supabase.auth.getSession();

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (user?.id) {
        const { data: profCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id);
        if (!profCheck || profCheck.length === 0) {
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: (user.user_metadata as any)?.full_name ?? null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.log('Profile ensure failed (non-blocking):', e);
    }

    // Logika preusmjeravanja nakon uspješne prijave
    if (returnUrl) {
      const target = decodeURIComponent(returnUrl);
      if (target.startsWith('/login')) {
        router.replace('/profile');
      } else {
        router.replace(target);
      }
    } else {
      router.replace('/profile');
    }
    router.refresh();
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    
    // Nakon OAuth login-a, preusmjeri na profile stranicu (ili returnUrl ako postoji)
    const nextUrl = returnUrl ? encodeURIComponent(returnUrl) : '/profile';
    const redirectTo = `${window.location.origin}/auth/callback?next=${nextUrl}`;
    const scopes = provider === 'github' ? 'read:user user:email' : 'openid email profile';

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        scopes,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent select_account', // KLJUČNO ZA ODABIR RAČUNA
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter your email to reset your password.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
    if (error) {
      setError(error.message);
    } else {
      setNotice('Password reset email sent. Check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-3xl"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/50 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
             <LogIn className="text-blue-600" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Please enter your details to sign in</p>
          
          {/* Obavijest o povratku na booking */}
          {returnUrl && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center justify-center gap-2 border border-blue-100"
            >
              <AlertCircle size={16} /> Prijavite se kako biste dovršili rezervaciju.
            </motion.div>
          )}
        </motion.div>
        
        <AnimatePresence>
          {notice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-200"
            >
              {notice}
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 flex items-center justify-center gap-2"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="mt-8 space-y-6" onSubmit={handleLogin} autoComplete="off">
          <motion.div variants={itemVariants} className="space-y-4">
            
            {/* Email Polje */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <input 
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm pr-10 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="john@example.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                </div>
              </div>
            </div>

            {/* Password Polje */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm pr-10 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign in"}
            </motion.button>
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          </motion.div>
        </form>

        {/* OAuth Section */}
        <motion.div variants={itemVariants}>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-[#24292F] text-sm font-medium text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center pt-2">
          <Link 
            href={`/signup${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Don't have an account? <span className="text-blue-600 hover:underline">Sign up</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}