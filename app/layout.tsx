import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "./_components/navigation";
import Footer from "./_components/Footer"; 
import { RentalProvider } from "./_context/RentalContext"; 
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "RentEase",
  description: "Car rental application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <RentalProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <Navigation />
            
            <main className="flex-grow">
              {children}
              <Toaster position="top-center" richColors />
            </main>
            <Footer />
          </div>
        </RentalProvider>
      </body>
    </html>
  );
}