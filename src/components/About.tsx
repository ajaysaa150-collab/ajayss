import React from 'react';
import { Sparkles, Utensils, HeartHandshake, Award } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { BUSINESS_INFO } from '../data/cafeData';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-[#F5ECD9]/50 border-y border-[#3B241A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image & "Made Fresh Every Day" Highlight Block */}
          <div className="lg:col-span-6 relative">
            <div className="relative">
              {/* Main Interior / Café Photo */}
              <div className="rounded-3xl overflow-hidden shadow-xl border border-[#3B241A]/10 bg-white">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80"
                  alt="Brew & Bloom Café barista crafting specialty coffee and fresh pastries"
                  aspectRatioClass="aspect-[4/3]"
                  className="w-full"
                  fallbackTitle="Artisan Coffee & Bakery"
                />
              </div>

              {/* “Made Fresh Every Day” Highlight Box */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-8 sm:-right-8 bg-[#3B241A] text-[#FFF8EE] p-6 rounded-2xl shadow-xl max-w-xs border border-white/10">
                <div className="flex items-center gap-2 text-[#87986A] text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>The Kitchen Promise</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">
                  Made Fresh Every Day
                </h3>
                <p className="text-xs text-[#FFF8EE]/80 leading-relaxed">
                  Croissants rolled before dawn, single-origin espresso extracted on order, and sauces made from scratch with real ingredients.
                </p>
              </div>
            </div>
          </div>

          {/* Text Story & Pillars */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Unboxed editorial category */}
            <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
              Our Story & Heritage
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241A] leading-tight mb-6">
              A Warm Sanctuary for Lucknow's Thinkers, Dreamers & Coffee Lovers
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#3B241A]/85 leading-relaxed mb-8">
              <p>
                Founded in <strong className="text-[#3B241A] font-semibold">{BUSINESS_INFO.established}</strong> in Gomti Nagar, 
                <strong className="text-[#3B241A] font-semibold"> {BUSINESS_INFO.name}</strong> was born out of a profound love for third-wave specialty coffee and honest, European-style bakery craft.
              </p>
              <p>
                We envisioned more than just a coffee shop. We created a modern neighborhood refuge tailored for university students preparing for exams, remote professionals taking deep-work sprints, creators brainstorming, and families sharing sweet weekend breakfasts over warm slices of Lotus Biscoff cheesecake.
              </p>
              <p>
                Whether you stop by for a quick Spanish Latte on your morning commute or stay all afternoon in our sunny reading nook with our signature Pesto Paneer sourdough sandwich, you are welcomed with genuine warmth and unhurried hospitality.
              </p>
            </div>

            {/* Core Values / Editorial Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#3B241A]/10">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#87986A]/20 flex items-center justify-center shrink-0 text-[#3B241A] mt-0.5">
                  <Utensils className="w-4 h-4 text-[#87986A]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#3B241A]">Zero Shortcuts</h4>
                  <p className="text-[12px] text-[#3B241A]/70 mt-0.5">
                    100% pure butter viennoiserie, unbleached flour, no artificial essences.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C96F4A]/20 flex items-center justify-center shrink-0 text-[#3B241A] mt-0.5">
                  <HeartHandshake className="w-4 h-4 text-[#C96F4A]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#3B241A]">Community First</h4>
                  <p className="text-[12px] text-[#3B241A]/70 mt-0.5">
                    Pet-friendly garden, student-friendly power sockets, and cozy vibes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
