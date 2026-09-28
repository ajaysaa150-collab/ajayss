import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock3,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Lock,
  ArrowLeft,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAdminAuth } from '../../firebase/AdminAuthContext';
import {
  fetchAllBookingsForAdmin,
  updateBookingStatusByAdmin,
  deleteBookingByAdmin,
} from '../../firebase/bookingService';
import { TableBooking } from '../../types';
import { AdminCreateBookingModal } from './AdminCreateBookingModal';
import { AdminEditBookingModal } from './AdminEditBookingModal';

interface AdminPortalProps {
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const { isAdmin, adminEmail, adminLogin, adminLogout } = useAdminAuth();

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Past'>('All');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TableBooking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBookingsForAdmin();
      setBookings(data);
    } catch (err) {
      console.warn('Could not load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
    }
  }, [isAdmin]);

  // Listen for background updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchAllBookingsForAdmin().then(setBookings).catch(() => {});
    };
    window.addEventListener('brew_bloom_bookings_updated', handleUpdate);
    return () => window.removeEventListener('brew_bloom_bookings_updated', handleUpdate);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const success = await adminLogin(emailInput, passwordInput);
      if (!success) {
        setLoginError('Invalid admin email or password. Access is restricted to authorized managers.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAutofill = () => {
    setEmailInput('admin@gmail.com');
    setPasswordInput('jujharsingh');
    setLoginError(null);
  };

  const handleStatusChange = async (
    booking: TableBooking,
    newStatus: 'Confirmed' | 'Completed' | 'Cancelled'
  ) => {
    try {
      await updateBookingStatusByAdmin(booking.id, newStatus, booking.confirmationCode);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id || b.confirmationCode === booking.confirmationCode
            ? { ...b, status: newStatus }
            : b
        )
      );
      setActionToast(`Reservation ${booking.confirmationCode} status changed to "${newStatus}"`);
      setTimeout(() => setActionToast(null), 3200);
    } catch (err) {
      console.warn('Status change error:', err);
    }
  };

  const handleDelete = async (booking: TableBooking) => {
    const confirmMessage = `Permanently delete reservation ${booking.confirmationCode} for ${booking.customerName}?\n\nThis will remove it completely from all booking lists and floor schedules.`;
    if (window.confirm(confirmMessage)) {
      try {
        await deleteBookingByAdmin(booking.id, booking.confirmationCode);
        setBookings((prev) =>
          prev.filter(
            (b) => b.id !== booking.id && b.confirmationCode !== booking.confirmationCode
          )
        );
        setActionToast(`Reservation ${booking.confirmationCode} deleted permanently`);
        setTimeout(() => setActionToast(null), 3200);
      } catch (err) {
        console.warn('Delete booking error:', err);
      }
    }
  };

  // Metrics computation
  const todayStr = new Date().toISOString().split('T')[0];

  const metrics = useMemo(() => {
    const total = bookings.length;
    const today = bookings.filter((b) => b.date === todayStr).length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;

    const totalGuests = bookings.reduce((sum, b) => {
      let g = 2;
      if (b.guests === '1') g = 1;
      else if (b.guests === '3') g = 3;
      else if (b.guests === '4') g = 4;
      else if (b.guests === '5-8') g = 6;
      else if (b.guests === '8+') g = 10;
      return sum + g;
    }, 0);

    return { total, today, confirmed, completed, cancelled, totalGuests };
  }, [bookings, todayStr]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;

      // Date filter
      if (dateFilter === 'Today' && b.date !== todayStr) return false;
      if (dateFilter === 'Upcoming' && b.date < todayStr) return false;
      if (dateFilter === 'Past' && b.date >= todayStr) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.confirmationCode.toLowerCase().includes(q) ||
          b.userEmail.toLowerCase().includes(q) ||
          b.seating.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [bookings, statusFilter, dateFilter, searchQuery, todayStr]);

  // If not authenticated as Admin: Show dedicated Admin Login Screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3B241A]/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#FFF8EE] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/20 shadow-2xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
            aria-label="Back to store"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#3B241A] text-white flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-[#C96F4A]">
              <ShieldCheck className="w-7 h-7 text-[#87986A]" />
            </div>
            <span className="text-[11px] font-bold text-[#C96F4A] uppercase tracking-widest block mb-1">
              Gomti Nagar Floor Management
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3B241A]">
              Brew & Bloom Admin Portal
            </h2>
            <p className="text-xs text-[#3B241A]/70 mt-1">
              Authorized café staff access to view, update, and create table reservations.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#87986A]" />
              <span>{isLoggingIn ? 'Verifying...' : 'Sign In as Administrator'}</span>
            </button>
          </form>

          {/* Quick-fill helper for user convenience */}
          <div className="mt-5 p-3 rounded-xl bg-white border border-[#3B241A]/10 text-center">
            <p className="text-[11px] text-[#3B241A]/70 mb-2">
              Configured admin credentials: <br />
              <strong className="text-[#3B241A]">admin@gmail.com</strong> / <strong className="text-[#3B241A]">jujharsingh</strong>
            </p>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-xs font-semibold text-[#C96F4A] hover:underline cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#3B241A]/60 hover:text-[#3B241A] transition-colors"
            >
              Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= ADMIN DASHBOARD =================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F5ECD9]/95 backdrop-blur-sm flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#3B241A] text-[#FFF8EE] border-b border-white/10 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#87986A] text-[#3B241A] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-white tracking-tight">
                  Brew & Bloom Admin Portal
                </h1>
                <span className="text-[10px] font-bold text-[#87986A] bg-[#87986A]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Manager Session
                </span>
              </div>
              <p className="text-[11px] text-[#FFF8EE]/60">
                Logged in as <strong>{adminEmail}</strong> · Gomti Nagar Branch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#3B241A] bg-[#FFF8EE] hover:bg-white rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#C96F4A]" />
              <span>+ New Booking</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FFF8EE] bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Café Website</span>
            </button>

            <button
              type="button"
              onClick={adminLogout}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-200 hover:text-white bg-red-900/30 hover:bg-red-900/50 rounded-xl transition-colors cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-[#3B241A]/60 block mb-1">
              Total Reservations
            </span>
            <span className="font-serif text-2xl font-bold text-[#3B241A] tabular-nums">
              {metrics.total}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-[#C96F4A] block mb-1">
              Today's Schedule
            </span>
            <span className="font-serif text-2xl font-bold text-[#C96F4A] tabular-nums">
              {metrics.today}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-[#87986A] block mb-1">
              Confirmed Tables
            </span>
            <span className="font-serif text-2xl font-bold text-[#87986A] tabular-nums">
              {metrics.confirmed}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-[#3B241A]/60 block mb-1">
              Completed Visits
            </span>
            <span className="font-serif text-2xl font-bold text-[#3B241A] tabular-nums">
              {metrics.completed}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-red-600 block mb-1">
              Cancelled
            </span>
            <span className="font-serif text-2xl font-bold text-red-600 tabular-nums">
              {metrics.cancelled}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
            <span className="text-[11px] font-semibold text-[#3B241A]/60 block mb-1">
              Expected Covers (Guests)
            </span>
            <span className="font-serif text-2xl font-bold text-[#3B241A] tabular-nums">
              {metrics.totalGuests}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3B241A]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name, phone, code (e.g. BB-4892)..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFF8EE]/60 rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
            />
          </div>

          {/* Filter segment tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            <div className="flex bg-[#F5ECD9] p-1 rounded-xl">
              {(['All', 'Confirmed', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#3B241A] text-white shadow-xs'
                      : 'text-[#3B241A]/70 hover:text-[#3B241A]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date filter dropdown */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#FFF8EE] rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today Only</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Past">Past</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadBookings}
              disabled={loading}
              title="Refresh reservations from Firebase"
              className="p-2 bg-[#FFF8EE] hover:bg-[#F5ECD9] border border-[#3B241A]/20 rounded-xl text-[#3B241A] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bookings Table / List */}
        <div className="bg-white rounded-3xl border border-[#3B241A]/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#3B241A]/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3B241A]">
                All Table Bookings
              </h2>
              <p className="text-xs text-[#3B241A]/60">
                Showing {filteredBookings.length} of {bookings.length} reservations
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#87986A]" />
              <span>Create Walk-In / Phone Reservation</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-[#3B241A]/60">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C96F4A]" />
              <span>Fetching live bookings from Firestore...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#3B241A]/60">
              <Calendar className="w-10 h-10 text-[#3B241A]/20 mx-auto mb-2" />
              <p className="font-serif text-base font-bold text-[#3B241A]">
                No matching bookings found
              </p>
              <p className="text-xs text-[#3B241A]/60 mt-1 mb-4">
                Try adjusting your search terms or status filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setDateFilter('All');
                }}
                className="text-xs font-semibold text-[#C96F4A] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5ECD9]/50 text-[#3B241A]/70 uppercase tracking-wider text-[10px] border-b border-[#3B241A]/10">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ref Code</th>
                    <th className="py-3 px-4 font-semibold">Guest & Contact</th>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Guests & Seating</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Notes</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B241A]/5">
                  {filteredBookings.map((b) => {
                    const isToday = b.date === todayStr;
                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-[#FFF8EE]/50 transition-colors ${
                          isToday ? 'bg-[#FFF8EE]/20' : ''
                        }`}
                      >
                        {/* Ref Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#3B241A] whitespace-nowrap">
                          {b.confirmationCode}
                          {isToday && (
                            <span className="ml-2 inline-block px-1.5 py-0.2 text-[9px] font-bold bg-[#C96F4A] text-white rounded-md">
                              TODAY
                            </span>
                          )}
                        </td>

                        {/* Guest & Contact */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#3B241A]">{b.customerName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#3B241A]/70 mt-0.5">
                            <a
                              href={`tel:${b.customerPhone}`}
                              className="hover:text-[#C96F4A] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-[#87986A]" />
                              <span>{b.customerPhone}</span>
                            </a>
                          </div>
                          {b.userEmail && b.userEmail !== 'walkin@brewandbloom.example' && (
                            <span className="text-[10px] text-[#3B241A]/50 block truncate max-w-[180px]">
                              {b.userEmail}
                            </span>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-[#3B241A]">
                            <Calendar className="w-3.5 h-3.5 text-[#C96F4A]" />
                            <span>{b.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#3B241A]/60 mt-0.5">
                            <Clock className="w-3 h-3 text-[#87986A]" />
                            <span>{b.time}</span>
                          </div>
                        </td>

                        {/* Guests & Seating */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-[#3B241A]">
                            <Users className="w-3.5 h-3.5 text-[#3B241A]/60" />
                            <span>{b.guests} Guests</span>
                          </div>
                          <p className="text-[11px] text-[#87986A] mt-0.5 truncate max-w-[160px]">
                            {b.seating}
                          </p>
                        </td>

                        {/* Status with Quick Toggle & Quick Buttons */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleStatusChange(b, e.target.value as any)
                              }
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border focus:outline-hidden cursor-pointer ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : b.status === 'Completed'
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              <option value="Confirmed">● Confirmed</option>
                              <option value="Completed">✓ Completed</option>
                              <option value="Cancelled">✕ Cancelled</option>
                            </select>

                            <div className="flex items-center gap-1">
                              {b.status !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b, 'Completed')}
                                  title="Mark reservation as completed"
                                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-md transition-colors cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                              {b.status !== 'Cancelled' ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b, 'Cancelled')}
                                  title="Cancel this reservation"
                                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-md transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b, 'Confirmed')}
                                  title="Re-confirm this reservation"
                                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-md transition-colors cursor-pointer"
                                >
                                  Re-confirm
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="text-[11px] text-[#3B241A]/70 line-clamp-2">
                            {b.specialNotes || '—'}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForEdit(b)}
                              title="Edit reservation details"
                              className="p-1.5 rounded-lg bg-[#F5ECD9] hover:bg-[#3B241A] text-[#3B241A] hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(b)}
                              title="Permanently delete reservation"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Admin Modals */}
      <AdminCreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookingCreated={(newBk) => {
          setBookings((prev) => [newBk, ...prev]);
        }}
      />

      <AdminEditBookingModal
        isOpen={Boolean(selectedBookingForEdit)}
        booking={selectedBookingForEdit}
        onClose={() => setSelectedBookingForEdit(null)}
        onBookingUpdated={(updated) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }}
      />

      {/* Action Confirmation Toast */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B241A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#87986A] shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
};
