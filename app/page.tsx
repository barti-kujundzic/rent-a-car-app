import Link from 'next/link';
import { ImageWithFallback } from './_components/ImageWithFallback';
import { client } from '@/lib/contentful'; 
import { HomeHero } from './_components/HomeHero'; 
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getPopularCars() {
  try {
    const res = await client.getEntries({
      content_type: 'car',
      limit: 3, 
    });

    return res.items.map((item: any) => ({
      id: item.sys.id,
      slug: item.fields.slug,
      model: item.fields.modelName,
      price: item.fields.pricePerDay,
      rating: '5.0', 
      image: item.fields.images?.[0]?.fields?.file?.url 
        ? `https:${item.fields.images[0].fields.file.url}` 
        : '/placeholder-car.jpg',
    }));
  } catch (error) {
    console.error("Greška pri dohvatu popularnih auta:", error);
    return [];
  }
}

export default async function HomePage() {
  const popularCars = await getPopularCars();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. ANIMIRANI HERO I KARTICE */}
      <HomeHero />

      {/* 2. POPULAR CARS */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-10">
          <div>
             <h2 className="text-4xl mb-2 font-bold text-gray-900">Popular Rentals</h2>
             <p className="text-gray-500 text-lg">Don't miss out on our top picks</p>
          </div>
          <Link href="/browse_cars">
            <button className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all hidden md:block">
                View All Cars →
            </button>
          </Link>
        </div>

        {popularCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCars.map((car) => (
              <Link href={`/browse_cars/${car.id}`} key={car.id} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                  
                  {/* Slika s efektom */}
                  <div className="h-64 bg-gray-200 relative overflow-hidden">
                    <div className="w-full h-full group-hover:scale-110 transition-transform duration-500">
                        <ImageWithFallback src={car.image} alt={car.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-gray-800">{car.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-gray-900 font-bold text-xl mb-1 group-hover:text-blue-600 transition-colors">{car.model}</h3>
                    <p className="text-gray-400 text-sm mb-4">Automatic • Petrol • 5 Seats</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-black text-gray-900">€{car.price}</span>
                        <span className="text-gray-400 text-sm">/day</span>
                      </div>
                      <span className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        Rent Now
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
             <p className="text-gray-400">Loading popular cars...</p>
          </div>
        )}
        
        {/* Mobile View All Button */}
        <div className="mt-8 md:hidden text-center">
            <Link href="/browse_cars">
                <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold w-full shadow-sm">
                    View All Cars
                </button>
            </Link>
        </div>
      </div>
    </div>
  );
}