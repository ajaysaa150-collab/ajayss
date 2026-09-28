import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Check, AlertCircle } from 'lucide-react';
import { TableBooking } from '../../types';
import { updateBookingDetailsByAdmin } from '../../firebase/bookingService';

interface AdminEditBookingModalProps {
  booking: TableBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: (updated: TableBooking) => void;
}

export const AdminEditBookingModal: React.FC<AdminEditBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
}) => {
  if (!isOpen || !booking) return null;

  const [status, setStatus] = useState<'Confirmed' | 'Completed' | 'Cancelled'>(booking.status);
  const [seating, setSeating] = useState(booking.seating);
  const [guests, setGuests] = useState(booking.guests);
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState(booking.time);
  const [notes, setNotes] = useState(booking.specialNotes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates: Partial<TableBooking> = {
      status,
      seating,
      guests,
      date,
      time,
      specialNotes: notes,
    };

    try {
      await updateBookingDetailsByAdmin(booking.id, updates, booking.confirmationCode);
      onBookingUpdated({ ...booking, ...updates });
      onClose();
    } catch (err) {
      console.warn('Could not update booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#3B241A]/15 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-mono font-bold text-[#C96F4A]">
            Ref: {booking.confirmationCode}
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#3B241A] mt-0.5">
            Manage Reservation
          </h3>
          <p className="text-xs text-[#3B241A]/70">
            Guest: <strong>{booking.customerName}</strong> ({booking.customerPhone})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Reservation Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Confirmed', 'Completed', 'Cancelled'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    status === s
                      ? s === 'Confirmed'
                        ? 'bg-[#87986A] text-white border-[#87986A]'
                        : s === 'Completed'
                        ? 'bg-[#3B241A] text-white border-[#3B241A]'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-[#3B241A] border-[#3B241A]/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Time
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Party Size
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5-8">5 to 8 People</option>
                <option value="8+">8+ People</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Table Seating
              </label>
              <select
                value={seating}
                onChange={(e) => setSeating(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              >
                <option value="Indoor Cozy Corner">Indoor Cozy Nook</option>
                <option value="Work Desk with Sockets">Work Desk (Sockets)</option>
                <option value="Outdoor Pet-Friendly Garden">Outdoor Garden Patio</option>
                <option value="Window Booth Table">Window Booth</option>
                <option value="Center Round Table">Center Round Table</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Staff Notes / Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#3B241A]/70 hover:text-[#3B241A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
