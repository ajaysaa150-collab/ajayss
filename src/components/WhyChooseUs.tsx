import React from 'react';
import { Coffee, Flame, Wifi, Armchair, PawPrint } from 'lucide-react';
import { WHY_CHOOSE_US_FEATURES } from '../data/cafeData';

export const WhyChooseUs: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    'fresh-coffee': <Coffee className="w-5 h-5 text-[#3B241A]" />,
    'baked-morning': <Flame className="w-5 h-5 text-[#C96F4A]" />,
    'free-wifi': <Wifi className="w-5 h-5 text-[#87986A]" />,
    'cozy-workspace': <Armchair className="w-5 h-5 text-[#3B241A]" />,
    'pet-friendly': <PawPrint className="w-5 h-5 text-[#C96F4A]" />,
  };

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-[#F5ECD9]/40 border-t border-[#3B241A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
            The Brew & Bloom Standard
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B241A] tracking-tight">
            Why Lucknow Loves Us
          </h2>
          <p className="text-sm sm:text-base text-[#3B241A]/75 mt-3 leading-relaxed">
            Every element—from our roast profiles to our ergonomic chairs—is chosen with intent so you can work, meet, or unwind in genuine comfort.
          </p>
        </div>

        {/* 5 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {WHY_CHOOSE_US_FEATURES.map((feature, idx) => {
            const isWide = idx === 0 || idx === 3;
            return (
              <div
                key={feature.id}
                className={`bg-white rounded-2xl p-7 border border-[#3B241A]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  isWide ? 'md:col-span-1 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10 flex items-center justify-center">
                      {iconMap[feature.id]}
                    </div>
                    <span className="text-[11px] font-semibold text-[#87986A] bg-[#87986A]/10 px-2.5 py-1 rounded-md">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#3B241A] mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#3B241A]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#3B241A]/5 flex items-center justify-between text-[11px] text-[#3B241A]/50">
                  <span>Standard 0{idx + 1}</span>
                  <span className="font-medium text-[#3B241A]/70">Gomti Nagar Flagship</span>
                </div>
              </div>
            );
          })}

          {/* Bonus Experience Card */}
          <div className="bg-[#3B241A] text-[#FFF8EE] rounded-2xl p-7 border border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#87986A] uppercase tracking-wider mb-2">
                Neighborhood Vibe
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-white">
                Fresh Brews. Fresh Bakes. Good Vibes.
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF8EE]/80 leading-relaxed">
                Step inside to the soothing aroma of roasted coffee and warm caramel pastries, surrounded by lush fiddle-leaf figs and warm ambient jazz.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#87986A]">
              <span>Open 7 Days a Week</span>
              <span className="text-white font-medium">8:00 AM – 10:30 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
