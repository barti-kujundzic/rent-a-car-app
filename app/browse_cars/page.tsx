import { client } from '@/lib/contentful';
import { supabase } from '@/lib/supabase';
import BrowseClient from './BrowseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeTransmission(value: string | undefined): string {
  if (!value) return 'Manual';
  const cleanValue = value.toString().toLowerCase().trim();
  if (cleanValue.includes('auto')) return 'Automatic';
  return 'Manual';
}

export default async function BrowsePage() {
  const contentfulPromise = client 
    ? client.getEntries({ content_type: 'car', order: ['-sys.createdAt'] }) 
    : Promise.resolve({ items: [] });

  const supabasePromise = supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });

  const reviewsPromise = supabase
    .from('reviews')
    .select('car_id, rating, car_model');

  const [contentfulRes, supabaseRes, reviewsRes] = await Promise.all([
    contentfulPromise,
    supabasePromise,
    reviewsPromise
  ]);

  const allReviews = reviewsRes.data || [];

  const calculateStats = (carId: string, carModel: string) => {
      const carReviews = allReviews.filter((r: any) => 
          r.car_id === carId || r.car_model === carModel
      );
      const count = carReviews.length;
      if (count === 0) return { rating: 0, reviews: 0 };
      const total = carReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const avg = total / count;
      return { rating: Number(avg.toFixed(1)), reviews: count };
  };

  const contentfulCars = contentfulRes.items.map((item: any) => {
    const stats = calculateStats(item.sys.id, item.fields.modelName);
    return {
      id: item.sys.id,
      model: item.fields.modelName,
      price: item.fields.pricePerDay,
      type: item.fields.type || 'Sedan',
      location: item.fields.location || 'Unknown',
      rating: stats.rating,
      reviews: stats.reviews,
      transmission: normalizeTransmission(item.fields.transmission),
      seats: item.fields.seats || 5,
      image: item.fields.images?.[0]?.fields?.file?.url 
        ? `https:${item.fields.images[0].fields.file.url}` 
        : '/placeholder-car.jpg',
      source: 'contentful',
      owner_id: null
    };
  });

  const supabaseCars = (supabaseRes.data || []).map((car: any) => {
    const fullModelName = `${car.make} ${car.model}`;
    const stats = calculateStats(car.id, fullModelName);
    return {
      id: car.id,
      model: fullModelName,
      price: car.price_per_day,
      type: 'Car',
      location: car.location || 'Unknown',
      rating: stats.rating,
      reviews: stats.reviews,
      transmission: normalizeTransmission(car.transmission),
      seats: car.seats || 5,
      image: car.image_url || '/placeholder-car.jpg',
      source: 'supabase',
      owner_id: car.owner_id
    };
  });

  return (
    <main>
      <BrowseClient initialCars={[...supabaseCars, ...contentfulCars]} />
    </main>
  );
}