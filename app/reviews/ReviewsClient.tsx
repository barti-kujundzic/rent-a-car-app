"use client";

import { Star, StarHalf, User, CarFront } from 'lucide-react';
import { motion } from 'framer-motion';

// Animacijske varijante
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf size={16} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
            <Star key={`empty-${i}`} size={16} className="text-gray-300" />
        ))}
      </div>
      <span className="font-bold text-gray-700 text-sm pt-0.5">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ReviewsClient({ reviews, averageRating, totalReviews, ratingBreakdown }: any) {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 py-16"
        >
           <h1 className="text-5xl mb-2 font-bold">Reviews & Ratings</h1>
           <p className="text-blue-100 text-lg">See what our community is saying</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center text-center border-r border-gray-200">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                        className="text-6xl font-black text-gray-900 mb-3"
                    >
                        {averageRating}
                    </motion.div>
                    <StarRating rating={Number(averageRating)} />
                    <p className="text-gray-600 mt-2">Based on {totalReviews} reviews</p>
                </div>
                <div className="space-y-3">
                  {ratingBreakdown.map((item: any, index: number) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-3">{item.stars}</span>
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                            className="h-full bg-blue-600 rounded-full" 
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
             </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl mb-8 font-bold text-gray-900"
        >
            Customer Reviews
        </motion.h2>
        
        {reviews.length > 0 ? (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {reviews.map((review: any) => (
              <motion.div 
                key={review.id} 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  
                  {/* PRIKAZ AVATARA */}
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                      {review.avatar ? (
                        <img 
                            src={review.avatar} 
                            alt={review.userName} 
                            className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <div>
                        <h3 className="text-gray-900 font-bold text-lg">{review.userName}</h3>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                      <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                         <StarRating rating={review.rating} />
                      </div>
                    </div>

                    {review.carModel && (
                        <div className="flex items-center gap-2 mb-3">
                            <CarFront size={16} className="text-blue-500" />
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                Rented: {review.carModel}
                            </span>
                        </div>
                    )}

                    <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-500">No reviews found yet.</p>
          </div>
        )}
      </div>
    </>
  );
}