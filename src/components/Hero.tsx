import React from 'react';
import { ArrowDown, MapPin, Coffee, Sparkles, Compass } from 'lucide-react';
import { BUSINESS_INFO } from '../data/cafeData';
import { ImageWithFallback } from './ImageWithFallback';

interface HeroProps {
  onExploreMenu: () => void;
  onVisitUs: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onVisitUs }) => {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      {/* Subtle organic warm background gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[550px] h-[550px] bg-[#87986A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-[-100px] -z-10 w-[450px] h-[450px] bg-[#C96F4A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Unboxed Metadata Kicker (Anti-Slop: No colored pill capsules) */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#3B241A]/70 uppercase tracking-widest mb-4">
              <span>{BUSINESS_INFO.type}</span>
              <span aria-hidden="true">·</span>
              <span>Gomti Nagar, Lucknow</span>
              <span aria-hidden="true">·</span>
              <span>Est. {BUSINESS_INFO.established}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B241A] leading-[1.12] mb-6 text-balance">
              Your New Favorite <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#C96F4A]">Coffee Spot</span>
            </h1>

            {/* Subheading as requested */}
            <p className="text-base sm:text-lg text-[#3B241A]/80 max-w-xl mb-8 leading-relaxed">
              Specialty coffee, fresh bakes, and cozy moments in the heart of Lucknow.
            </p>

            {/* Action Buttons: View Menu / Visit Us */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 w-full sm:w-auto">
              <button
                type="button"
                onClick={onExploreMenu}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-[#FFF8EE] bg-[#3B241A] hover:bg-[#2A1810] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>View Menu</span>
                <Coffee className="w-4 h-4 text-[#FFF8EE]/80 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onVisitUs}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-[#3B241A] bg-[#FFF8EE] border border-[#3B241A]/20 hover:border-[#3B241A] hover:bg-[#F5ECD9] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#C96F4A]" />
                <span>Visit Us</span>
              </button>
            </div>

            {/* Trust Markers: Adjacent proof */}
            <div className="pt-6 border-t border-[#3B241A]/10 w-full grid grid-cols-3 gap-4">
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-[#3B241A] tabular-nums">
                  100%
                </span>
                <span className="text-xs text-[#3B241A]/70 font-medium">
                  Estate Arabica Beans
                </span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-[#3B241A] tabular-nums">
                  6:30 AM
                </span>
                <span className="text-xs text-[#3B241A]/70 font-medium">
                  Daily Fresh Bakes
                </span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-[#3B241A] tabular-nums">
                  4.9★
                </span>
                <span className="text-xs text-[#3B241A]/70 font-medium">
                  Neighborhood Rating
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card frame with soft shadow & rounded geometry */}
              <div className="rounded-3xl p-3 bg-white/60 shadow-xl border border-[#3B241A]/10 backdrop-blur-xs">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                  alt="Brew & Bloom Café warm sunlit interior in Gomti Nagar"
                  aspectRatioClass="aspect-[4/3]"
                  className="rounded-2xl"
                  fallbackTitle="Brew & Bloom Café Gomti Nagar"
                />

                {/* Quiet Floating Tasting Note Card */}
                <div className="mt-3 p-4 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#87986A]/20 flex items-center justify-center text-[#3B241A]">
                      <Sparkles className="w-5 h-5 text-[#87986A]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#3B241A]">
                        Signature Spanish Latte
                      </p>
                      <p className="text-[11px] text-[#3B241A]/60">
                        Chilled condensed milk · Double shot espresso
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-serif font-bold text-[#C96F4A] tabular-nums">
                    ₹220
                  </span>
                </div>
              </div>

              {/* Decorative accent element */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-[#3B241A] text-[#FFF8EE] px-4 py-2.5 rounded-xl shadow-lg items-center gap-2 text-xs font-medium border border-white/10">
                <Compass className="w-4 h-4 text-[#87986A]" />
                <span>Vibhuti Khand, Gomti Nagar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
