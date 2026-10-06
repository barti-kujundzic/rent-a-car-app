"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import { Home, ArrowLeft } from "lucide-react";

const font = Outfit({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function NotFound() {
  return (
    <div
      className={`${font.className} min-h-[100dvh] w-full flex items-center justify-center bg-white px-4 py-6 md:p-8 overscroll-none`}
    >
      {/* Glavni layout */}
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        
        {/* LIJEVO: Ilustracija */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-[380px]">
            <Image
              src="/404-car.png"
              alt="Lost GPS Illustration"
              width={400}
              height={400}
              quality={100}
              priority
              className="w-full h-auto object-contain drop-shadow-xl"
            />
          </div>
        </motion.div>

        {/* DESNO: Tekst */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center lg:text-left space-y-4 md:space-y-6"
        >
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter">
              404
            </h1>
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-slate-800 mt-2">
              Ups! Ruta nije pronađena.
            </h2>
          </div>

          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
            Izgleda da je vaš GPS zakazao i odveo vas na pogrešnu cestu.
            Bez brige — brzo ćemo vas vratiti na pravi put.
          </p>

          {/* Gumbi */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center lg:justify-start">
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-full font-bold text-base shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95">
                <Home size={18} />
                Naslovnica
              </button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-7 py-3 rounded-full font-bold text-base hover:bg-slate-200 transition-all border border-slate-200 active:scale-95"
            >
              <ArrowLeft size={18} />
              Vrati me nazad
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
