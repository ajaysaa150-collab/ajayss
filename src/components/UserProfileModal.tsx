import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Sparkles,
  Coffee,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  MapPin,
  Users,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { fetchUserBookings, cancelBooking } from '../firebase/bookingService';
import { fetchUserPastOrders, syncAndFetchUserOrders, extractFavoriteItems, FavoriteItemSummary } from '../utils/orderHistory';
import { CartItem, PastOrder, TableBooking, MenuItem } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'orders' | 'bookings' | 'profile';
  onReorderItems: (items: CartItem[]) => void;
  onAddToCart: (item: MenuItem) => void;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onExploreMenu: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'orders',
  onReorderItems,
  onAddToCart,
  onOpenCart,
  onOpenReservation,
  onExploreMenu,
}) => {
  const { user, userProfile, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'profile'>(initialTab);
  
  // Data states
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Interaction states
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load orders for current user
  const loadOrders = () => {
    if (user?.uid) {
      const userOrders = fetchUserPastOrders(user.uid);
      setOrders(userOrders);
      // Fetch latest from Firestore
      syncAndFetchUserOrders(user.uid).then((latest) => {
        if (latest && latest.length > 0) {
          setOrders(latest);
        }
      }).catch(() => {});
    } else {
      setOrders([]);
    }
  };

  // Load bookings for current user
  const loadBookings = () => {
    if (user?.uid) {
      setLoadingBookings(true);
      fetchUserBookings(user.uid)
        .then((data) => {
          setBookings(data);
          setLoadingBookings(false);
        })
        .catch(() => setLoadingBookings(false));
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
      loadBookings();
    }
  }, [isOpen, user]);

  // Listen for real-time background events
  useEffect(() => {
    const handleOrdersUpdated = () => {
      loadOrders();
    };
    const handleBookingsUpdated = () => {
      loadBookings();
    };

    window.addEventListener('brew_bloom_orders_updated', handleOrdersUpdated);
    window.addEventListener('brew_bloom_bookings_updated', handleBookingsUpdated);
    return () => {
      window.removeEventListener('brew_bloom_orders_updated', handleOrdersUpdated);
      window.removeEventListener('brew_bloom_bookings_updated', handleBookingsUpdated);
    };
  }, [user]);

  // Extract top favorites from user's past orders
  const favoriteItems: FavoriteItemSummary[] = useMemo(() => {
    return extractFavoriteItems(orders);
  }, [orders]);

  if (!isOpen || !user) return null;

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Patron';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const handleReorderWholeOrder = (order: PastOrder) => {
    onReorderItems(order.items);
    setReorderedOrderId(order.id);
    setToastMessage(`Added all ${order.items.length} items from ${order.id} to your bag`);
    setTimeout(() => {
      setReorderedOrderId(null);
    }, 2500);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleReorderSingleItem = (cartItem: CartItem, orderId: string) => {
    onAddToCart(cartItem.item);
    const key = `${orderId}-${cartItem.item.id}`;
    setAddedItemKey(key);
    setToastMessage(`Added ${cartItem.item.name} to your order bag`);
    setTimeout(() => {
      setAddedItemKey(null);
    }, 2000);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleQuickAddFavorite = (fav: FavoriteItemSummary) => {
    onAddToCart(fav.item);
    setAddedItemKey(`fav-${fav.item.id}`);
    setToastMessage(`Added ${fav.item.name} to your order bag`);
    setTimeout(() => {
      setAddedItemKey(null);
    }, 2000);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this table reservation?')) {
      await cancelBooking(bookingId, user.uid);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b))
      );
      setToastMessage('Table reservation cancelled');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-2xl w-full border border-[#3B241A]/15 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
          aria-label="Close profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & User Summary Card */}
        <div className="bg-gradient-to-r from-[#3B241A] to-[#4A3022] text-[#FFF8EE] p-5 sm:p-6 border-b border-white/10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {userProfile?.photoURL || user.photoURL ? (
                <img
                  src={userProfile?.photoURL || user.photoURL || ''}
                  alt={displayName}
                  className="w-13 h-13 rounded-2xl object-cover shadow-md shrink-0 border-2 border-white/20"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-[#87986A] text-white flex items-center justify-center text-xl font-serif font-bold shadow-md shrink-0 border-2 border-white/20">
                  {initialLetter}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white truncate max-w-[240px] sm:max-w-xs">
                    {displayName}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#87986A]/30 text-[#A3B882] rounded-full border border-[#87986A]/40 uppercase tracking-wider">
                    Patron
                  </span>
                </div>
                <p className="text-xs text-[#FFF8EE]/70 truncate max-w-xs mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#C96F4A] shrink-0" />
                  <span>{user.email}</span>
                  {userProfile?.phoneNumber && (
                    <>
                      <span className="text-white/30">·</span>
                      <Phone className="w-3 h-3 text-[#87986A] shrink-0" />
                      <span>{userProfile.phoneNumber}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
              <div className="text-center pr-3 border-r border-white/15">
                <span className="block font-bold text-sm text-[#FFF8EE]">{orders.length}</span>
                <span className="text-[10px] text-[#FFF8EE]/60 uppercase tracking-wider">Orders</span>
              </div>
              <div className="text-center pl-1">
                <span className="block font-bold text-sm text-[#A3B882]">{bookings.length}</span>
                <span className="text-[10px] text-[#FFF8EE]/60 uppercase tracking-wider">Bookings</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-[#3B241A] shadow-sm'
                  : 'text-[#FFF8EE]/75 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C96F4A]" />
              <span>Past Orders & Reorder</span>
              {orders.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-[#C96F4A] text-white' : 'bg-white/20 text-white'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-white text-[#3B241A] shadow-sm'
                  : 'text-[#FFF8EE]/75 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#87986A]" />
              <span>Table Bookings</span>
              {bookings.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'bookings' ? 'bg-[#87986A] text-white' : 'bg-white/20 text-white'
                }`}>
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-[#3B241A] shadow-sm'
                  : 'text-[#FFF8EE]/75 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#A3B882]" />
              <span>Preferences</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* ================= TAB 1: PAST ORDERS & REORDER ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Favorites / Frequently Ordered Carousel (if user has ordered items) */}
              {favoriteItems.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C96F4A]" />
                      <h4 className="font-serif text-sm font-bold text-[#3B241A]">
                        Your Favorite Bites & Sips
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#3B241A]/60">
                      1-Tap Quick Reorder
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {favoriteItems.slice(0, 4).map((fav) => {
                      const isAdded = addedItemKey === `fav-${fav.item.id}`;
                      return (
                        <div
                          key={fav.item.id}
                          className="flex items-center justify-between p-2.5 bg-[#FFF8EE] rounded-xl border border-[#3B241A]/10 hover:border-[#3B241A]/30 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#3B241A]/5">
                              <ImageWithFallback
                                src={fav.item.image}
                                alt={fav.item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#3B241A] truncate">
                                {fav.item.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#3B241A]/70">
                                <span className="font-bold text-[#C96F4A]">₹{fav.item.price}</span>
                                <span>·</span>
                                <span className="text-[10px] text-[#87986A] bg-[#87986A]/15 px-1.5 py-0.2 rounded-md font-semibold">
                                  Ordered {fav.totalOrderedCount}x
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuickAddFavorite(fav)}
                            className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ml-2 ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#3B241A] hover:bg-[#2A1810] text-white shadow-xs'
                            }`}
                            title="Reorder this favorite"
                          >
                            {isAdded ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Add</span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order History List */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#87986A]" />
                    <h4 className="font-serif text-sm font-bold text-[#3B241A]">
                      Past Orders ({orders.length})
                    </h4>
                  </div>
                  {orders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCart();
                      }}
                      className="text-xs font-semibold text-[#C96F4A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View Current Bag</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 px-6 text-center bg-white rounded-2xl border border-[#3B241A]/10">
                    <div className="w-12 h-12 rounded-full bg-[#FFF8EE] text-[#C96F4A] flex items-center justify-center mx-auto mb-3">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <h5 className="font-serif text-base font-bold text-[#3B241A]">
                      No Past Orders Found
                    </h5>
                    <p className="text-xs text-[#3B241A]/70 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                      Whenever you place an order for our artisanal sourdough, pour-over specialty coffee, or desserts, it will be saved here for instant 1-tap reordering.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onExploreMenu();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>Explore Café Menu & Order</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isOrderReordered = reorderedOrderId === order.id;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3B241A]/12 shadow-xs hover:border-[#3B241A]/25 transition-all"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#3B241A]/10">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-[#3B241A] bg-[#FFF8EE] px-2.5 py-1 rounded-lg border border-[#3B241A]/10">
                                #{order.id}
                              </span>
                              <span className="text-xs text-[#3B241A]/70 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#87986A]" />
                                {order.relativeTime || order.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF8EE] text-[#3B241A]/80 border border-[#3B241A]/10">
                                {order.orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Order Items List */}
                          <div className="py-3 space-y-2.5">
                            {order.items.map((cartItem, idx) => {
                              const itemKey = `${order.id}-${cartItem.item.id}`;
                              const isSingleAdded = addedItemKey === itemKey;

                              return (
                                <div
                                  key={`${order.id}-${cartItem.item.id}-${idx}`}
                                  className="flex items-center justify-between text-xs py-1"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#3B241A]/5">
                                      <ImageWithFallback
                                        src={cartItem.item.image}
                                        alt={cartItem.item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-[#3B241A] truncate">
                                          {cartItem.item.name}
                                        </span>
                                        <span className="text-[#3B241A]/60 font-semibold">
                                          × {cartItem.quantity}
                                        </span>
                                      </div>
                                      {cartItem.notes && (
                                        <p className="text-[10px] text-[#C96F4A] italic truncate">
                                          {cartItem.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-[#3B241A] tabular-nums">
                                      ₹{cartItem.item.price * cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleReorderSingleItem(cartItem, order.id)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                                        isSingleAdded
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-[#FFF8EE] hover:bg-[#F5ECD9] text-[#3B241A] border border-[#3B241A]/15'
                                      }`}
                                      title="Reorder this specific item"
                                    >
                                      {isSingleAdded ? (
                                        <>
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Added</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3 h-3 text-[#C96F4A]" />
                                          <span>Reorder</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Notes if present */}
                          {order.notes && (
                            <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#FFF8EE] text-[11px] text-[#3B241A]/80 italic border border-[#3B241A]/10">
                              {order.notes}
                            </div>
                          )}

                          {/* Order Footer with Total & 1-Click Reorder All */}
                          <div className="pt-3 border-t border-[#3B241A]/10 flex flex-wrap items-center justify-between gap-3 bg-[#FAF4EA]/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-2xl">
                            <div>
                              <span className="text-[11px] text-[#3B241A]/60 block">Order Total (incl. GST)</span>
                              <span className="font-serif text-base font-bold text-[#3B241A]">
                                ₹{order.total}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleReorderWholeOrder(order)}
                              disabled={isOrderReordered}
                              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                                isOrderReordered
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE]'
                              }`}
                            >
                              {isOrderReordered ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                                  <span>Added to Bag!</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 text-[#C96F4A]" />
                                  <span>Reorder Entire Order ({order.items.length} items)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: TABLE BOOKINGS ================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#3B241A]">
                    My Gomti Nagar Reservations
                  </h4>
                  <p className="text-xs text-[#3B241A]/70">
                    Manage your dining tables at Vibhuti Khand
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReservation();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#C96F4A] hover:bg-[#B35F3C] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reserve Table</span>
                </button>
              </div>

              {loadingBookings ? (
                <div className="py-12 text-center text-xs text-[#3B241A]/60">
                  Loading reservations from database...
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-12 px-6 text-center bg-white rounded-2xl border border-[#3B241A]/10">
                  <Calendar className="w-10 h-10 text-[#3B241A]/30 mx-auto mb-2" />
                  <h5 className="font-serif text-base font-bold text-[#3B241A]">
                    No Table Reservations Yet
                  </h5>
                  <p className="text-xs text-[#3B241A]/60 mt-1 mb-4">
                    Book a quiet work corner, sunny garden table, or indoor booth for your next visit.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReservation();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Reserve a Table Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-4 border border-[#3B241A]/10 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3B241A] bg-[#FFF8EE] px-2.5 py-1 rounded-lg border border-[#3B241A]/10">
                            {booking.confirmationCode}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              booking.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        {booking.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#3B241A]/80 bg-[#FFF8EE]/60 p-2.5 rounded-xl border border-[#3B241A]/5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C96F4A] shrink-0" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#87986A] shrink-0" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#3B241A]/60 shrink-0" />
                          <span>{booking.guests} Guests</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#C96F4A] shrink-0" />
                          <span className="truncate">{booking.seating}</span>
                        </div>
                      </div>

                      {booking.specialNotes && (
                        <p className="text-[11px] text-[#3B241A]/70 italic">
                          "{booking.specialNotes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ACCOUNT & PREFERENCES ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-[#3B241A]/10 shadow-xs space-y-4">
                <h4 className="font-serif text-sm font-bold text-[#3B241A]">
                  Account Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10">
                    <span className="text-[11px] text-[#3B241A]/60 block mb-0.5">Full Name</span>
                    <span className="font-bold text-[#3B241A]">{displayName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10">
                    <span className="text-[11px] text-[#3B241A]/60 block mb-0.5">Email Address</span>
                    <span className="font-bold text-[#3B241A]">{user.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10">
                    <span className="text-[11px] text-[#3B241A]/60 block mb-0.5">Primary Contact</span>
                    <span className="font-bold text-[#3B241A]">{userProfile?.phoneNumber || 'Not provided'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#3B241A]/10">
                    <span className="text-[11px] text-[#3B241A]/60 block mb-0.5">Member Status</span>
                    <span className="font-bold text-[#87986A]">Brew & Bloom Patron Member</span>
                  </div>
                </div>

                {/* Café Amenities Info */}
                <div className="pt-3 border-t border-[#3B241A]/10">
                  <h5 className="text-xs font-bold text-[#3B241A] mb-2">
                    Member Perks at Gomti Nagar Branch
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#3B241A]/80">
                    <div className="p-2.5 bg-[#87986A]/10 rounded-xl border border-[#87986A]/20">
                      <strong className="text-[#3B241A] block">High-Speed Wi-Fi</strong>
                      <span>Complimentary for remote work sessions</span>
                    </div>
                    <div className="p-2.5 bg-[#C96F4A]/10 rounded-xl border border-[#C96F4A]/20">
                      <strong className="text-[#3B241A] block">Pet Friendly Garden</strong>
                      <span>Bring along your fur friends on patio</span>
                    </div>
                    <div className="p-2.5 bg-[#3B241A]/5 rounded-xl border border-[#3B241A]/10">
                      <strong className="text-[#3B241A] block">Priority Table Hold</strong>
                      <span>15-min courtesy buffer for bookings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await logOut();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#3B241A] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-[#87986A] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
