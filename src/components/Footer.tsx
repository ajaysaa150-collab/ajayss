import React from 'react';
import { Instagram, MapPin, Phone, Mail, Clock, ArrowUp, Heart, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/cafeData';
import { useAdminAuth } from '../firebase/AdminAuthContext';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { isAdmin } = useAdminAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#3B241A] text-[#FFF8EE] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand & Tagline Zone (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <a
              href="#"
              className="font-serif text-2xl font-bold tracking-tight text-white hover:text-[#C96F4A] transition-colors inline-block mb-3"
            >
              {BUSINESS_INFO.name}
            </a>
            <p className="text-xs font-medium text-[#87986A] uppercase tracking-wider mb-4">
              {BUSINESS_INFO.tagline}
            </p>
            <p className="text-xs text-[#FFF8EE]/75 leading-relaxed max-w-sm mb-6">
              A cozy neighborhood specialty café & bakery in Gomti Nagar, Lucknow. Handcrafted coffee, artisanal sourdough bakes, and peaceful work friendly vibes since {BUSINESS_INFO.established}.
            </p>

            {/* Social Media Link */}
            <div className="flex items-center gap-3">
              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#C96F4A] flex items-center justify-center transition-colors text-white"
                aria-label="Instagram profile @brewandbloomcafe"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <span className="text-xs text-[#FFF8EE]/80">
                Follow <strong className="text-white">{BUSINESS_INFO.instagram}</strong>
              </span>
            </div>
          </div>

          {/* Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-sm font-bold text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FFF8EE]/75">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Bestsellers & Menu
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Café Gallery
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">
                  Table Reservation
                </a>
              </li>
              {isAdmin && onOpenAdmin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="hover:text-white transition-colors text-[#C96F4A] flex items-center gap-1.5 cursor-pointer mt-1 font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Manager & Admin Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Menu Highlights (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-sm font-bold text-white mb-4">
              Popular Specialties
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8EE]/75">
              <li className="flex justify-between items-center pr-4">
                <span>Spanish Latte</span>
                <span className="tabular-nums font-serif text-[#87986A]">₹220</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Lotus Biscoff Cheesecake</span>
                <span className="tabular-nums font-serif text-[#87986A]">₹280</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Pesto Paneer Sandwich</span>
                <span className="tabular-nums font-serif text-[#87986A]">₹260</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Butter Croissant</span>
                <span className="tabular-nums font-serif text-[#87986A]">₹140</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Ceremonial Matcha Latte</span>
                <span className="tabular-nums font-serif text-[#87986A]">₹230</span>
              </li>
            </ul>
          </div>

          {/* Contact Details (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-sm font-bold text-white mb-4">
              Visit & Contact
            </h4>
            <div className="space-y-3 text-xs text-[#FFF8EE]/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C96F4A] shrink-0 mt-0.5" />
                <span>Plot 14, Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#87986A] shrink-0" />
                <span>Open Daily: 8:00 AM – 10:30 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFF8EE]/60 shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FFF8EE]/60 shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF8EE]/60">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <span>Crafted in Lucknow</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
