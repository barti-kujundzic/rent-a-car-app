import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

export default function PaymentOptionsPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
      }
    >
      <PaymentClient />
    </Suspense>
  );
}