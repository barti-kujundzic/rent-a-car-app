import { client } from '@/lib/contentful';
import { supabase } from '@/lib/supabase';
import CarDetailsClient from './CarDetailsClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCar(id: string) {
  let carData: any = null;

  // 1. DOHVAT AUTA (Contentful)
  try {
    const carEntry: any = await client.getEntry(id);
    carData = {
      id: carEntry.sys.id,
      slug: carEntry.fields.slug,
      model: carEntry.fields.modelName,
      price: carEntry.fields.pricePerDay,
      location: carEntry.fields.location,
      images: carEntry.fields.images?.map((img: any) => `https:${img.fields.file.url}`) || [],
      description: carEntry.fields.description,
      features: carEntry.fields.features || [],
      year: carEntry.fields.year,
      seats: carEntry.fields.seats,
      transmission: carEntry.fields.transmission,
      fuel: carEntry.fields.fuel,
      owner_id: null, 
    };
  } catch (error) {
    // Nije contentful
  }

  // 2. DOHVAT AUTA (Supabase)
  if (!carData) {
    try {
      const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && car) {
        carData = {
          id: car.id,
          slug: car.id,
          model: `${car.make} ${car.model}`,
          price: car.price_per_day,
          location: car.location,
          images: car.images && car.images.length > 0 ? car.images : (car.image_url ? [car.image_url] : []),
          description: car.description,
          features: [],
          year: car.year,
          seats: car.seats,
          transmission: car.transmission,
          fuel: car.fuel || 'Diesel',
          owner_id: car.owner_id, 
        };
      }
    } catch (err) {
       console.error(err);
    }
  }

  if (!carData) return null;

  // 3. RECENZIJE
  const searchCriteria = [id, carData.model]; 
  if (carData.slug) searchCriteria.push(carData.slug);

  // SPAJANJE: Dohvaćamo profilne podatke (avatar) uz recenzije
  const { data: dbReviews } = await supabase
      .from('reviews')
      .select('*, profiles:renter_id(avatar_url, full_name)') 
      .in('car_id', searchCriteria) 
      .order('created_at', { ascending: false });

  const reviews = (dbReviews || []).map((r: any) => ({
      id: r.id,
      // Ime iz profila ima prednost
      author: r.profiles?.full_name || r.user_name || 'Verified User',
      // Slika iz profila
      avatar: r.profiles?.avatar_url || null,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString()
  }));

  let avgRating = 0;
  if (reviews.length > 0) {
      const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = total / reviews.length;
  }

  return {
      ...carData,
      rating: avgRating,
      reviewsCount: reviews.length,
      reviews: reviews
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    notFound();
  }

  return <CarDetailsClient car={car} />;
}