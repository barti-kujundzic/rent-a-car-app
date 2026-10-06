import { supabase } from '@/lib/supabase';
import ReviewsClient from './ReviewsClient'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllReviews() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, profiles:renter_id(avatar_url, full_name)')
      .order('created_at', { ascending: false });

    if (error || !reviews) {
        return [];
    }

    return reviews.map((item: any) => ({
      id: item.id,
      userName: item.profiles?.full_name || item.user_name || 'Anonymous',
      avatar: item.profiles?.avatar_url || null,
      rating: item.rating,
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      comment: item.comment || '',
      carModel: item.car_model || 'Unknown Car',
    }));

  } catch (error) {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rounded = Math.round(r.rating);
    if (rounded >= 1 && rounded <= 5) {
      // @ts-ignore
      counts[rounded]++;
    }
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    // @ts-ignore
    count: counts[stars],
    // @ts-ignore
    percentage: totalReviews > 0 ? (counts[stars] / totalReviews) * 100 : 0
  }));

  // SVE PODATKE ŠALJEMO KLIJENTSKOJ KOMPONENTI ZA PRIKAZ
  return (
    <div className="min-h-screen bg-gray-50">
        <ReviewsClient 
            reviews={reviews} 
            averageRating={averageRating} 
            totalReviews={totalReviews} 
            ratingBreakdown={ratingBreakdown} 
        />
    </div>
  );
}