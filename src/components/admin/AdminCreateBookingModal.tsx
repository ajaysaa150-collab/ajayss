import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Users, Check, Sparkles, Send } from 'lucide-react';
import { createAdminBooking } from '../../firebase/bookingService';
import { TableBooking } from '../../types';

interface AdminCreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: TableBooking) => void;
}

export const AdminCreateBookingModal: React.FC<AdminCreateBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    userEmail: '',
    guests: '2',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    seating: 'Indoor Cozy Corner',
    specialNotes: '',
    source: 'Phone Call',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Please provide customer name and phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notesWithSource = formData.specialNotes
        ? `[${formData.source}] ${formData.specialNotes}`
        : `[Booked via ${formData.source} by Admin]`;

      const newBooking = await createAdminBooking({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        userEmail: formData.userEmail.trim() || 'walkin@brewandbloom.example',
        guests: formData.guests,
        date: formData.date,
        time: formData.time,
        seating: formData.seating,
        specialNotes: notesWithSource,
        status: 'Confirmed',
      });

      onBookingCreated(newBooking);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#3B241A]/15 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#87986A] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#C96F4A]" />
            <span>Admin Staff Entry</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#3B241A]">
            Create New Reservation
          </h3>
          <p className="text-xs text-[#3B241A]/70 mt-1">
            Quickly book a table for walk-in guests or telephone inquiries.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Guest Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Guest Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  placeholder="guest@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Booking Channel
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              >
                <option value="Phone Call">Phone Call / WhatsApp</option>
                <option value="Walk-in">Walk-in at Counter</option>
                <option value="VIP / Regular">VIP / Regular Guest</option>
                <option value="Staff Reservation">Staff / Internal Booking</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Reservation Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Time Slot *
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              >
                <option value="08:30">08:30 AM (Breakfast)</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:30">11:30 AM (Brunch)</option>
                <option value="13:00">01:00 PM (Lunch)</option>
                <option value="14:30">02:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="18:00">06:00 PM (Sunset)</option>
                <option value="19:00">07:00 PM</option>
                <option value="19:30">07:30 PM (Dinner)</option>
                <option value="20:30">08:30 PM</option>
                <option value="21:15">09:15 PM (Late)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Party Size *
              </label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5-8">5 to 8 People</option>
                <option value="8+">8+ People (Large Party)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Table / Seating Assignment
            </label>
            <select
              value={formData.seating}
              onChange={(e) => setFormData({ ...formData, seating: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
            >
              <option value="Indoor Cozy Corner">Indoor Cozy Nook (AC Main Hall)</option>
              <option value="Work Desk with Sockets">Quiet Work Desk (Dedicated Power)</option>
              <option value="Outdoor Pet-Friendly Garden">Outdoor Garden Patio (Pet Friendly)</option>
              <option value="Window Booth Table">Window Booth (Street View)</option>
              <option value="Center Round Table">Center Round Table (Group)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Staff Notes / Assigned Table Number
            </label>
            <textarea
              rows={2}
              value={formData.specialNotes}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              placeholder="e.g. Table 6 assigned, complimentary welcome drink, high chair requested..."
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
              className="px-5 py-2.5 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create & Confirm Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
