import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BookingClient from './BookingClient'; 

export const dynamic = 'force-dynamic';

export default function BookingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
      }
    >
      <BookingClient />
    </Suspense>
  );
}