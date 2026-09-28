import React, { useState } from 'react';
import { Star, MessageSquarePlus, Check, Quote } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/cafeData';
import { Review } from '../types';

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(CUSTOMER_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: '',
    tag: 'Café Visitor',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const created: Review = {
      id: `rev-${Date.now()}`,
      name: newReview.name,
      role: newReview.role || 'Guest',
      rating: newReview.rating,
      date: 'Just now',
      comment: newReview.comment,
      avatarBg: '#87986A',
      tag: newReview.tag || 'Community Review',
    };

    setReviews([created, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setNewReview({ name: '', role: '', rating: 5, comment: '', tag: 'Café Visitor' });
    }, 1200);
  };

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
              Words From Our Community
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B241A] tracking-tight">
              Customer Reviews
            </h2>
            <p className="text-sm sm:text-base text-[#3B241A]/75 mt-3 max-w-xl">
              See what students, remote workers, and food enthusiasts have to say about their Brew & Bloom moments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#3B241A] bg-white border border-[#3B241A]/20 hover:border-[#3B241A] hover:bg-[#F5ECD9] rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#C96F4A]" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#3B241A]/10 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Rating */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shrink-0"
                      style={{ backgroundColor: rev.avatarBg }}
                    >
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#3B241A]">{rev.name}</h3>
                      <p className="text-[11px] text-[#3B241A]/60">{rev.role}</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-[#C96F4A] text-[#C96F4A]'
                            : 'text-[#3B241A]/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review comment */}
                <p className="text-xs sm:text-sm text-[#3B241A]/80 leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer metadata without pill containers */}
              <div className="pt-4 border-t border-[#3B241A]/5 flex items-center justify-between text-[11px] text-[#3B241A]/50">
                <span>{rev.tag}</span>
                <span aria-hidden="true">·</span>
                <span>{rev.date}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Aggregate Social Proof Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-[#F5ECD9]/70 border border-[#3B241A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#3B241A', '#87986A', '#C96F4A', '#6C7D52'].map((bg, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-[#FFF8EE] flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: bg }}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3B241A]">
                Over 1,200+ Happy Guests in Lucknow
              </p>
              <p className="text-[11px] text-[#3B241A]/60">
                Average 4.9 out of 5 stars across reviews
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#3B241A]">
            <span className="font-serif text-lg text-[#C96F4A] font-bold">4.9</span>
            <div className="flex items-center text-[#C96F4A]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#C96F4A]" />
              ))}
            </div>
            <span className="text-[#3B241A]/60 ml-1">· Verified Feedback</span>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FFF8EE] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#3B241A]/15 shadow-2xl relative">
            <div className="mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#3B241A]">
                Share Your Experience
              </h3>
              <p className="text-xs text-[#3B241A]/70 mt-1">
                Tell us about your favorite brew or study session at Brew & Bloom.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#87986A] text-white flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#3B241A]">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-[#3B241A]/70 mt-1">
                  Your review has been added to our community wall.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="e.g. Ishaan Kapoor"
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                    Role or Interest (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                    placeholder="e.g. Student / Software Developer"
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= newReview.rating
                              ? 'fill-[#C96F4A] text-[#C96F4A]'
                              : 'text-[#3B241A]/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#3B241A] ml-2">
                      {newReview.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share what you loved about our coffee, pastries, or space..."
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#3B241A]/70 hover:text-[#3B241A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#3B241A] hover:bg-[#2A1810] rounded-xl transition-colors cursor-pointer"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
