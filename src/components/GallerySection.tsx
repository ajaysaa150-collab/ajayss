import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Film, Sparkles } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/cafeData';
import { GalleryItem } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface GallerySectionProps {
  onOpenVeoVideo?: (image?: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenVeoVideo }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filterOptions = ['All', 'Interior', 'Coffee', 'Desserts & Bakes', 'Outdoor'];

  const filteredGallery =
    selectedFilter === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedFilter);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeItem) return;
    const currentIndex = filteredGallery.findIndex((item) => item.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setActiveItem(filteredGallery[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeItem) return;
    const currentIndex = filteredGallery.findIndex((item) => item.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % filteredGallery.length;
    setActiveItem(filteredGallery[nextIndex]);
  };

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-[#F5ECD9]/30 border-y border-[#3B241A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
            Moments at Brew & Bloom
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B241A] tracking-tight">
            Café Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#3B241A]/75 mt-3">
            Glimpse our warm interior, barista pours, golden morning viennoiserie, and breezy Gomti Nagar patio.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-[#3B241A] text-[#FFF8EE] shadow-xs'
                  : 'bg-white text-[#3B241A]/70 hover:bg-[#F5ECD9] hover:text-[#3B241A] border border-[#3B241A]/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredGallery.map((item, index) => {
            const isTall = index === 0 || index === 5;
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#3B241A]/10 shadow-xs hover:shadow-lg transition-all duration-300 ${
                  isTall ? 'sm:col-span-1 lg:col-span-2' : ''
                }`}
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  aspectRatioClass={isTall ? 'aspect-[16/10]' : 'aspect-square'}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  fallbackTitle={item.title}
                />

                {/* Hover overlay with detail */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B241A]/90 via-[#3B241A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#87986A] font-semibold">
                      {item.category}
                    </span>
                    <Maximize2 className="w-4 h-4 text-white/80" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#FFF8EE]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#FFF8EE]/80 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Interactive Veo Video Animator Banner */}
        {onOpenVeoVideo && (
          <div className="mt-12 bg-gradient-to-r from-[#3B241A] to-[#4A2F22] rounded-3xl p-6 sm:p-8 text-[#FFF8EE] shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C96F4A] text-white flex items-center justify-center shrink-0 shadow-md">
                <Film className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#87986A]/30 text-[#A3B882] px-2.5 py-0.5 rounded-full border border-[#87986A]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Veo 3.1 Fast Video AI
                  </span>
                  <span className="text-xs text-[#FFF8EE]/60">16:9 Landscape & 9:16 Reels</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Animate Your Coffee Photos into Video
                </h3>
                <p className="text-xs text-[#FFF8EE]/80 mt-1 max-w-xl leading-relaxed">
                  Upload a photo of your coffee cup, latte art, or cozy bakery moment and watch Google Veo breathe life into it with cinematic steam, smooth motion, and café lighting.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenVeoVideo()}
              className="px-6 py-3 bg-[#C96F4A] hover:bg-[#B35F3C] text-white text-xs font-semibold rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Animate Photo with Veo</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#FFF8EE] rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              aria-label="Close image lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nav Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black text-white transition-colors cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black text-white transition-colors cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="max-h-[68vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[68vh] object-cover"
              />
            </div>

            {/* Caption & Actions */}
            <div className="p-6 bg-[#FFF8EE] border-t border-[#3B241A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#C96F4A] uppercase tracking-wider block mb-1">
                  {activeItem.category}
                </span>
                <h4 className="font-serif text-xl font-bold text-[#3B241A]">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-[#3B241A]/70 mt-1 max-w-xl">
                  {activeItem.description}
                </p>
              </div>

              {onOpenVeoVideo && (
                <button
                  type="button"
                  onClick={() => {
                    const img = activeItem.image;
                    setActiveItem(null);
                    onOpenVeoVideo(img);
                  }}
                  className="px-4 py-2.5 bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-2 shrink-0"
                >
                  <Film className="w-4 h-4 text-[#C96F4A]" />
                  <span>Animate with Veo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
