"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 

export interface Rental {
  id: string;
  carId: string;
  carName: string;
  image: string;
  pickupDate: string;
  returnDate: string;
  location: string;
  price: number;
  status: 'Active' | 'Upcoming' | 'Past';
}

interface RentalContextType {
  rentals: Rental[];
  refreshRentals: () => Promise<void>;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [rentals, setRentals] = useState<Rental[]>([]);

  const fetchRentals = async () => {
    try {
      // 1. Dohvati trenutnog korisnika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRentals([]); // Ako nije ulogiran, nema najmova
        return;
      }

      // 2. Dohvati bookinge iz baze
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('renter_id', user.id)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Greška pri dohvatu bookinga:', error);
        return;
      }

      if (bookings) {
        const loadedRentals: Rental[] = bookings.map((booking: any) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const pickup = new Date(booking.start_date);
          const returnD = new Date(booking.end_date);
          
          let status: 'Active' | 'Upcoming' | 'Past' = 'Upcoming';
          if (returnD < today) status = 'Past';
          else if (pickup <= today && returnD >= today) status = 'Active';

          return {
            id: booking.id,
            carId: booking.car_id,
            carName: "Vozilo ID: " + booking.car_id, 
            image: '/placeholder-car.jpg',
            pickupDate: booking.start_date,
            returnDate: booking.end_date,
            location: 'Zadar, Croatia', 
            price: booking.total_price || 0, 
            status: status,
          };
        });
        
        setRentals(loadedRentals);
      }
    } catch (err) {
      console.error('Neočekivana greška:', err);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <RentalContext.Provider value={{ rentals, refreshRentals: fetchRentals }}>
      {children}
    </RentalContext.Provider>
  );
}

export function useRentals() {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRentals must be used within a RentalProvider');
  }
  return context;
}