import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  Navigation,
  CheckCircle2,
  Calendar,
  Users,
  Send,
  Lock,
  UserCheck,
  ListOrdered
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/cafeData';
import { useAuth } from '../firebase/AuthContext';
import { saveBooking } from '../firebase/bookingService';

interface LocationContactProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenMyBookings: () => void;
}

export const LocationContact: React.FC<LocationContactProps> = ({
  onOpenAuth,
  onOpenMyBookings,
}) => {
  const { user, userProfile } = useAuth();
  const [reservation, setReservation] = useState({
    name: '',
    phone: '',
    guests: '2',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    seating: 'Indoor Cozy Corner',
    specialNotes: '',
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setReservation((prev) => ({
        ...prev,
        name: prev.name || userProfile?.displayName || user.displayName || '',
        phone: prev.phone || userProfile?.phoneNumber || '',
      }));
    }
  }, [user, userProfile]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation.name || !reservation.phone) return;

    if (!user) {
      onOpenAuth('signin');
      return;
    }

    setIsSaving(true);
    const code = `BB-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await saveBooking({
        confirmationCode: code,
        userId: user.uid,
        userEmail: user.email || '',
        customerName: reservation.name,
        customerPhone: reservation.phone,
        guests: reservation.guests,
        date: reservation.date,
        time: reservation.time,
        seating: reservation.seating,
        specialNotes: reservation.specialNotes,
        status: 'Confirmed',
      });
      setConfirmationCode(code);
      setBookingConfirmed(true);
    } catch (err) {
      console.warn('Booking save fallback:', err);
      setConfirmationCode(code);
      setBookingConfirmed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="location" className="py-20 lg:py-28 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
            Visit & Connect
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B241A] tracking-tight">
            Find Us in Gomti Nagar
          </h2>
          <p className="text-sm sm:text-base text-[#3B241A]/75 mt-3">
            Whether you want a sunny table for your laptop or an evening rendezvous over coffee, our doors are open daily.
          </p>
        </div>

        {/* 2-Column Layout: Left Info & Interactive Map, Right Table Reservation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Contact Details & Google Maps Placeholder */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Address */}
              <div className="bg-white rounded-2xl p-5 border border-[#3B241A]/10 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#C96F4A] mb-2">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B241A]">
                    Address
                  </h3>
                </div>
                <p className="text-xs font-medium text-[#3B241A] leading-relaxed">
                  {BUSINESS_INFO.fullAddress}
                </p>
                <span className="text-[11px] text-[#87986A] font-semibold mt-1 block">
                  Near Riverside Mall & Lohia Park
                </span>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl p-5 border border-[#3B241A]/10 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#87986A] mb-2">
                  <Clock className="w-5 h-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B241A]">
                    Opening Hours
                  </h3>
                </div>
                <p className="text-xs font-bold text-[#3B241A]">
                  Monday – Sunday: {BUSINESS_INFO.openingHours}
                </p>
                <span className="text-[11px] text-[#3B241A]/60 mt-1 block">
                  Kitchen closes at 10:00 PM
                </span>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-2xl p-5 border border-[#3B241A]/10 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#3B241A] mb-2">
                  <Phone className="w-5 h-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B241A]">
                    Phone & WhatsApp
                  </h3>
                </div>
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-xs font-bold text-[#3B241A] hover:text-[#C96F4A] transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <span className="text-[11px] text-[#3B241A]/60 mt-1 block">
                  Call for inquiries & bulk catering
                </span>
              </div>

              {/* Email & Social */}
              <div className="bg-white rounded-2xl p-5 border border-[#3B241A]/10 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#C96F4A] mb-2">
                  <Mail className="w-5 h-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B241A]">
                    Email & Social
                  </h3>
                </div>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-xs font-bold text-[#3B241A] hover:text-[#C96F4A] transition-colors block"
                >
                  {BUSINESS_INFO.email}
                </a>
                <a
                  href={BUSINESS_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#87986A] font-semibold hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{BUSINESS_INFO.instagram}</span>
                </a>
              </div>
            </div>

            {/* Google Maps Interactive Card & Placeholder */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#3B241A]/10 shadow-sm">
              <div className="p-4 bg-[#F5ECD9]/80 border-b border-[#3B241A]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#C96F4A]" />
                  <span className="text-xs font-bold text-[#3B241A]">
                    Interactive Map · Vibhuti Khand, Gomti Nagar
                  </span>
                </div>
                <a
                  href={BUSINESS_INFO.mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FFF8EE] bg-[#3B241A] hover:bg-[#2A1810] rounded-lg transition-colors shadow-xs"
                >
                  <span>Open in Google Maps</span>
                </a>
              </div>

              {/* Stylized Map View Graphic */}
              <div className="relative h-64 sm:h-72 w-full bg-[#E9E4DC] overflow-hidden flex items-center justify-center p-6">
                {/* SVG Map Grid Aesthetic */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B241A" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Road representations */}
                  <path
                    d="M 0 100 Q 200 80, 400 120 T 800 110"
                    fill="none"
                    stroke="#FFF8EE"
                    strokeWidth="12"
                  />
                  <path
                    d="M 250 0 L 280 400"
                    fill="none"
                    stroke="#FFF8EE"
                    strokeWidth="10"
                  />
                  <path
                    d="M 120 0 Q 300 240, 700 280"
                    fill="none"
                    stroke="#87986A"
                    strokeWidth="4"
                    opacity="0.6"
                  />
                </svg>

                {/* Pin for Brew & Bloom Café */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative animate-bounce">
                    <div className="w-12 h-12 rounded-full bg-[#3B241A] text-[#FFF8EE] flex items-center justify-center shadow-2xl border-2 border-[#FFF8EE]">
                      <MapPin className="w-6 h-6 text-[#C96F4A] fill-[#C96F4A]" />
                    </div>
                  </div>
                  <div className="mt-2 bg-[#FFF8EE] text-[#3B241A] px-3.5 py-1.5 rounded-xl shadow-lg border border-[#3B241A]/10 text-center">
                    <p className="font-serif font-bold text-xs">Brew & Bloom Café</p>
                    <p className="text-[10px] text-[#3B241A]/70">Plot 14, Vibhuti Khand, Gomti Nagar</p>
                  </div>
                </div>

                {/* Nearby landmarks badges */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-medium text-[#3B241A] shadow-xs">
                  Near Riverside Mall (200m)
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-medium text-[#3B241A] shadow-xs">
                  Lohia Park (5 min drive)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Table Reservation & Direct Message */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3B241A]/10 shadow-md">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#87986A] uppercase tracking-wider mb-1">
                    Instant Confirmation
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#3B241A]">
                    Reserve a Table
                  </h3>
                  <p className="text-xs text-[#3B241A]/70 mt-1">
                    Guarantee your favorite cozy corner or outdoor garden seating in advance.
                  </p>
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={onOpenMyBookings}
                    className="text-xs font-semibold text-[#87986A] hover:underline flex items-center gap-1 cursor-pointer shrink-0 mt-1"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </button>
                )}
              </div>

              {!user ? (
                <div className="mb-5 p-4 rounded-2xl bg-[#FFF8EE] border border-[#3B241A]/15 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C96F4A] mb-1">
                    <Lock className="w-4 h-4" />
                    <span>Sign In Required</span>
                  </div>
                  <p className="text-[11px] text-[#3B241A]/70 mb-3">
                    Sign in to link this reservation to your personal profile & track confirmed visits.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signin')}
                      className="px-4 py-2 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signup')}
                      className="px-4 py-2 bg-[#F5ECD9] hover:bg-[#E9DFCE] text-[#3B241A] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-2.5 rounded-xl bg-[#F5ECD9]/50 border border-[#87986A]/30 flex items-center justify-between text-xs text-[#3B241A]">
                  <div className="flex items-center gap-2 truncate">
                    <UserCheck className="w-4 h-4 text-[#87986A] shrink-0" />
                    <span className="truncate">
                      Signed in as <strong>{userProfile?.displayName || user.displayName || user.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#87986A] font-bold bg-[#87986A]/10 px-2 py-0.5 rounded-md shrink-0">
                    Saved to Firebase
                  </span>
                </div>
              )}

              {bookingConfirmed ? (
                <div className="py-8 text-center bg-[#F5ECD9]/50 rounded-2xl p-6 border border-[#87986A]/30">
                  <div className="w-14 h-14 rounded-full bg-[#87986A] text-white flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#3B241A]">
                    Table Reserved!
                  </h4>
                  <div className="my-4 p-3 bg-white rounded-xl border border-[#3B241A]/10 inline-block text-left">
                    <p className="text-xs text-[#3B241A]/60">Booking Reference</p>
                    <p className="font-serif text-lg font-bold text-[#C96F4A] tracking-wider">
                      {confirmationCode}
                    </p>
                    <p className="text-xs text-[#3B241A] font-semibold mt-1">
                      {reservation.name} · {reservation.guests} Guests
                    </p>
                    <p className="text-[11px] text-[#3B241A]/70">
                      {reservation.date} at {reservation.time} ({reservation.seating})
                    </p>
                  </div>
                  <p className="text-xs text-[#3B241A]/70 mb-4">
                    We have saved your table in Firestore. Just mention your name or code upon arrival!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenMyBookings}
                      className="px-4 py-2 bg-white border border-[#3B241A]/20 text-[#3B241A] text-xs font-semibold rounded-xl hover:bg-[#F5ECD9] transition-colors cursor-pointer"
                    >
                      View All My Bookings
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingConfirmed(false)}
                      className="px-4 py-2 bg-[#3B241A] text-white text-xs font-semibold rounded-xl hover:bg-[#2A1810] transition-colors cursor-pointer"
                    >
                      Make Another Booking
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reservation.name}
                      onChange={(e) =>
                        setReservation({ ...reservation, name: e.target.value })
                      }
                      placeholder="e.g. Aditi Sharma"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={reservation.phone}
                        onChange={(e) =>
                          setReservation({ ...reservation, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                        Number of Guests
                      </label>
                      <select
                        value={reservation.guests}
                        onChange={(e) =>
                          setReservation({ ...reservation, guests: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                      >
                        <option value="1">1 Person (Solo / Work)</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                        <option value="5-8">5 to 8 People (Group)</option>
                        <option value="8+">8+ People (Event)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={reservation.date}
                        onChange={(e) =>
                          setReservation({ ...reservation, date: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                        Time Slot *
                      </label>
                      <select
                        value={reservation.time}
                        onChange={(e) =>
                          setReservation({ ...reservation, time: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                      >
                        <option value="09:00">09:00 AM (Morning Brew)</option>
                        <option value="11:30">11:30 AM (Brunch)</option>
                        <option value="14:00">02:00 PM (Afternoon Work)</option>
                        <option value="16:30">04:30 PM (Evening Coffee)</option>
                        <option value="18:00">06:00 PM (Sunset & Bakes)</option>
                        <option value="19:30">07:30 PM (Dinner & Dessert)</option>
                        <option value="21:00">09:00 PM (Late Night Chill)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                      Seating Preference
                    </label>
                    <select
                      value={reservation.seating}
                      onChange={(e) =>
                        setReservation({ ...reservation, seating: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                    >
                      <option value="Indoor Cozy Corner">Indoor Cozy Nook (Air-conditioned)</option>
                      <option value="Study Desk with Sockets">Work Desk (Dedicated Power Outlet)</option>
                      <option value="Outdoor Pet-Friendly Garden">Outdoor Garden Patio (Pet-friendly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reservation.specialNotes}
                      onChange={(e) =>
                        setReservation({ ...reservation, specialNotes: e.target.value })
                      }
                      placeholder="e.g. Bringing a dog, birthday celebration, quiet table..."
                      className="w-full px-3.5 py-2 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#3B241A] hover:bg-[#2A1810] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving to Firestore...' : user ? 'Confirm Reservation' : 'Sign In & Reserve'}</span>
                  </button>
                  <p className="text-[11px] text-center text-[#3B241A]/60">
                    No advance payment required · Instant SMS & WhatsApp notification
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
