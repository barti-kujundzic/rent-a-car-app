import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}