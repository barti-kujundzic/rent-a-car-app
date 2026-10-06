import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SignUpClient from './SignUpClient';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
      }
    >
      <SignUpClient />
    </Suspense>
  );
}