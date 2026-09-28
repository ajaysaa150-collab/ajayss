import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { fetchUserBookings, cancelBooking } from '../firebase/bookingService';
import { TableBooking } from '../types';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewBookingClick: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  onNewBookingClick,
}) => {
  const { user, userProfile } = useAuth();
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetchUserBookings(user.uid)
        .then((data) => {
          setBookings(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    const handleUpdate = () => {
      if (user) {
        fetchUserBookings(user.uid).then(setBookings).catch(() => {});
      }
    };
    window.addEventListener('brew_bloom_bookings_updated', handleUpdate);
    return () => window.removeEventListener('brew_bloom_bookings_updated', handleUpdate);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCancel = async (bookingId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to cancel this table reservation?')) {
      await cancelBooking(bookingId, user.uid);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b))
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#3B241A]/15 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
          aria-label="Close bookings modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-[#87986A] uppercase tracking-wider block mb-1">
            Gomti Nagar Reservations
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#3B241A]">
            My Table Bookings
          </h3>
          <p className="text-xs text-[#3B241A]/70 mt-1">
            Saved under <strong className="text-[#3B241A]">{userProfile?.displayName || user?.email}</strong>
          </p>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#3B241A]/60">
              Loading your reservations from Firebase...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl p-6 border border-[#3B241A]/10">
              <Calendar className="w-10 h-10 text-[#3B241A]/30 mx-auto mb-2" />
              <h4 className="font-serif text-base font-bold text-[#3B241A]">
                No Bookings Yet
              </h4>
              <p className="text-xs text-[#3B241A]/60 mt-1 mb-4">
                You haven't reserved a table yet. Book a cozy corner or breezy garden patio now!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewBookingClick();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <span>Reserve a Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            bookings.map((booking) => {
              const isCancelled = booking.status === 'Cancelled';
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3B241A]/10 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#3B241A]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#3B241A]">
                          Ref: {booking.confirmationCode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isCancelled
                              ? 'bg-red-50 text-red-600'
                              : 'bg-[#87986A]/15 text-[#87986A]'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#3B241A] mt-1">
                        {booking.customerName}
                      </p>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        className="text-[11px] text-red-600 hover:text-red-800 underline cursor-pointer"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 text-xs text-[#3B241A]/75">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C96F4A]" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#87986A]" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#3B241A]" />
                      <span>{booking.guests} Guests</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3B241A]/5 flex items-center justify-between text-[11px] text-[#3B241A]/60">
                    <span>{booking.seating}</span>
                    {booking.customerPhone && <span>{booking.customerPhone}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#3B241A]/10 flex items-center justify-between">
          <span className="text-[11px] text-[#3B241A]/60">
            Plot 14, Vibhuti Khand, Gomti Nagar
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNewBookingClick();
            }}
            className="px-4 py-2 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Book Another Table
          </button>
        </div>
      </div>
    </div>
  );
};
