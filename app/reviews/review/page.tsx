"use client";

import { Star, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

// Varijante
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export default function WriteReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/reviews" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-fit"
          >
            <ChevronLeft size={20} />
            <span>Back to Reviews</span>
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 py-16"
        >
          <h1 className="text-5xl mb-2">Write a Review</h1>
          <p className="text-blue-100 text-lg">
            Share your rental experience with the community
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
        >
          <h2 className="text-2xl mb-6 font-bold text-gray-800">Your Experience</h2>

          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Rating */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="transition-colors"
                  >
                    <Star
                      size={40}
                      className={`${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>
                ))}
                {rating > 0 && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3 text-gray-600 font-medium"
                  >
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* Car Selection */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Rented
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                <option value="">Select a car...</option>
                <option value="1">Mercedes-Benz E-Class</option>
                <option value="2">Toyota RAV4</option>
                <option value="3">VW Golf</option>
                <option value="4">Tesla Model 3</option>
                <option value="5">Porsche 911</option>
              </select>
            </motion.div>

            {/* Review Title */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                placeholder="Sum up your experience in one line"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </motion.div>

            {/* Review Text */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                placeholder="Tell us about your rental experience. What did you like? What could be improved?"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters
              </p>
            </motion.div>

            {/* Category Ratings */}
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 font-semibold text-gray-800">Rate Different Aspects</h3>
              <div className="space-y-4">
                {['Cleanliness', 'Communication', 'Value for Money', 'Overall Experience'].map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" className="transition-transform hover:scale-110">
                          <Star size={24} className="text-gray-300 hover:fill-yellow-400 hover:text-yellow-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div variants={itemVariants} className="flex gap-4 pt-6 border-t border-gray-200">
              <Link href="/reviews" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </Link>
              <div className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  Submit Review
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}