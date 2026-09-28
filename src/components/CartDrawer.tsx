import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  Coffee,
  Check,
  Sparkles,
  ChevronRight,
  Receipt,
  Lock,
  UserCheck
} from 'lucide-react';
import { CartItem, MenuItem, PastOrder } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { useAuth } from '../firebase/AuthContext';
import { fetchUserPastOrders, saveUserPastOrder } from '../utils/orderHistory';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onReorderItems?: (items: CartItem[]) => void;
  onAddToCart?: (item: MenuItem) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onReorderItems,
  onAddToCart,
  onOpenAuth,
}) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [baristaNotes, setBaristaNotes] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);

  // Sync user details when authenticated
  useEffect(() => {
    if (user) {
      if (!customerName) {
        setCustomerName(userProfile?.displayName || user.displayName || '');
      }
      if (!customerPhone && userProfile?.phoneNumber) {
        setCustomerPhone(userProfile.phoneNumber);
      }
    }
  }, [user, userProfile]);

  // User-scoped Past Orders State: new accounts start with an empty order history
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);

  // Load orders strictly for the current authenticated user
  const loadUserOrders = () => {
    if (user?.uid) {
      setPastOrders(fetchUserPastOrders(user.uid));
    } else {
      setPastOrders([]);
    }
  };

  useEffect(() => {
    loadUserOrders();

    const handleUpdate = () => {
      loadUserOrders();
    };
    window.addEventListener('brew_bloom_orders_updated', handleUpdate);
    return () => window.removeEventListener('brew_bloom_orders_updated', handleUpdate);
  }, [user?.uid]);

  if (!isOpen) return null;

  const currentCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + gst;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Login requirement: user must be logged in to place an order
    if (!user) {
      onOpenAuth?.('signin');
      return;
    }

    if (!customerName || !customerPhone) return;

    const id = `BB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(id);
    setIsOrdered(true);

    // Record into Past Orders history state
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeString = today.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newPastOrder: PastOrder = {
      id,
      date: formattedDate,
      relativeTime: `Today · ${timeString}`,
      orderType,
      items: [...cart],
      subtotal,
      tax: gst,
      total,
      status: 'Ready for Pickup',
      notes: baristaNotes ? `Note: ${baristaNotes}` : undefined,
    };

    if (user?.uid) {
      const updated = saveUserPastOrder(user.uid, newPastOrder);
      setPastOrders(updated);
    } else {
      setPastOrders((prev) => [newPastOrder, ...prev]);
    }
  };

  const handleNewOrder = () => {
    setIsOrdered(false);
    onClearCart();
    setCustomerName('');
    setCustomerPhone('');
    setBaristaNotes('');
    onClose();
  };

  const handleReorderOrder = (order: PastOrder) => {
    if (onReorderItems) {
      onReorderItems(order.items);
    } else if (onAddToCart) {
      order.items.forEach(({ item, quantity }) => {
        for (let i = 0; i < quantity; i++) {
          onAddToCart(item);
        }
      });
    }

    setReorderedOrderId(order.id);
    setTimeout(() => {
      setReorderedOrderId(null);
      setActiveTab('current');
    }, 600);
  };

  const handleReorderSingleItem = (item: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(item);
    } else if (onReorderItems) {
      onReorderItems([{ item, quantity: 1 }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFF8EE] shadow-2xl flex flex-col justify-between border-l border-[#3B241A]/10">
          {/* Header & Segmented Tabs */}
          <div className="border-b border-[#3B241A]/10 bg-white">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#3B241A]" />
                <h3 className="font-serif text-lg font-bold text-[#3B241A]">
                  Brew & Bloom Orders
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#3B241A]/70 hover:text-[#3B241A] rounded-lg transition-colors cursor-pointer hover:bg-[#F5ECD9]"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Control / Tabs */}
            <div className="px-4 pb-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'current'
                    ? 'bg-[#3B241A] text-[#FFF8EE] shadow-xs'
                    : 'bg-[#F5ECD9]/80 text-[#3B241A]/80 hover:bg-[#F5ECD9] hover:text-[#3B241A]'
                }`}
              >
                <span>Current Bag</span>
                {currentCartCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full tabular-nums ${
                      activeTab === 'current'
                        ? 'bg-[#C96F4A] text-white'
                        : 'bg-[#3B241A] text-white'
                    }`}
                  >
                    {currentCartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#3B241A] text-[#FFF8EE] shadow-xs'
                    : 'bg-[#F5ECD9]/80 text-[#3B241A]/80 hover:bg-[#F5ECD9] hover:text-[#3B241A]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Past Orders</span>
                {pastOrders.length > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full tabular-nums ${
                      activeTab === 'history'
                        ? 'bg-[#87986A] text-white'
                        : 'bg-[#87986A]/20 text-[#87986A]'
                    }`}
                  >
                    {pastOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {/* ----------------- TAB 1: CURRENT BAG ----------------- */}
            {activeTab === 'current' && (
              <>
                {isOrdered ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#87986A] text-white flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-[#3B241A]">
                      Order Sent to Barista!
                    </h4>
                    <p className="text-xs text-[#3B241A]/70 mt-1 mb-6">
                      Freshly brewed and prepared with love at Gomti Nagar.
                    </p>

                    <div className="bg-white p-5 rounded-2xl border border-[#3B241A]/10 text-left mb-6 space-y-2">
                      <div className="flex justify-between text-xs text-[#3B241A]/60">
                        <span>Order Number:</span>
                        <span className="font-mono font-bold text-[#3B241A]">{orderId}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#3B241A]/60">
                        <span>Customer:</span>
                        <span className="font-medium text-[#3B241A]">{customerName}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#3B241A]/60">
                        <span>Service:</span>
                        <span className="capitalize font-medium text-[#87986A]">{orderType}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#3B241A]/60">
                        <span>Estimated Ready:</span>
                        <span className="font-bold text-[#C96F4A]">12–15 Minutes</span>
                      </div>
                      <div className="pt-2 border-t border-[#3B241A]/10 flex justify-between text-sm font-bold text-[#3B241A]">
                        <span>Total Amount:</span>
                        <span className="font-serif tabular-nums">₹{total}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOrdered(false);
                          onClearCart();
                          setActiveTab('history');
                        }}
                        className="w-full py-2.5 px-4 bg-white border border-[#3B241A]/20 hover:border-[#3B241A] text-[#3B241A] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#87986A]" />
                        <span>View in Past Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNewOrder}
                        className="w-full py-3 px-4 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Done & Back to Menu
                      </button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#F5ECD9] flex items-center justify-center mx-auto mb-4 text-[#3B241A]/40">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#3B241A] mb-1">
                      Your bag is empty
                    </h4>
                    <p className="text-xs text-[#3B241A]/60 max-w-xs mx-auto mb-6">
                      Add freshly pulled espresso, Lotus Biscoff cheesecake, or flaky croissants to get started.
                    </p>

                    {pastOrders.length > 0 && (
                      <div className="mb-6 p-4 rounded-2xl bg-white border border-[#3B241A]/10 text-left">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#87986A] mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span>Want your usual?</span>
                        </div>
                        <p className="text-xs text-[#3B241A]/70 mb-3">
                          You have {pastOrders.length} previous orders recorded. Reorder your favorites with 1 tap!
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('history')}
                          className="w-full py-2 px-3 text-xs font-semibold text-[#3B241A] bg-[#F5ECD9] hover:bg-[#3B241A] hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Browse Past Orders</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[#3B241A] rounded-xl hover:bg-[#2A1810] transition-colors cursor-pointer"
                    >
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Items list */}
                    <div className="space-y-3">
                      {cart.map(({ item, quantity }) => (
                        <div
                          key={item.id}
                          className="bg-white p-3.5 rounded-xl border border-[#3B241A]/10 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#3B241A] truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-[#3B241A]/60 font-serif tabular-nums">
                              ₹{item.price} each
                            </p>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex items-center gap-2 bg-[#F5ECD9]/80 px-2 py-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1 hover:text-[#C96F4A] transition-colors cursor-pointer"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-serif tabular-nums px-1 text-[#3B241A]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1 hover:text-[#87986A] transition-colors cursor-pointer"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="text-xs font-serif font-bold text-[#3B241A] tabular-nums min-w-[50px] text-right">
                            ₹{item.price * quantity}
                          </span>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#3B241A]/40 hover:text-[#C96F4A] transition-colors cursor-pointer p-1"
                            aria-label={`Remove ${item.name} from order`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Dine-in or Takeaway choice */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#3B241A] mb-2">
                        Service Option
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderType('takeaway')}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                            orderType === 'takeaway'
                              ? 'bg-[#3B241A] text-white border-[#3B241A]'
                              : 'bg-white text-[#3B241A] border-[#3B241A]/20'
                          }`}
                        >
                          Takeaway / Pickup
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('dine-in')}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                            orderType === 'dine-in'
                              ? 'bg-[#3B241A] text-white border-[#3B241A]'
                              : 'bg-white text-[#3B241A] border-[#3B241A]/20'
                          }`}
                        >
                          Dine-in at Table
                        </button>
                      </div>
                    </div>

                    {/* User Authentication Status or Login Gate */}
                    {!user ? (
                      <div className="p-4 rounded-2xl bg-white border border-[#3B241A]/15 text-center shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-[#3B241A]/10 text-[#C96F4A] flex items-center justify-center mx-auto mb-2">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#3B241A]">
                          Sign In Required to Place Order
                        </h4>
                        <p className="text-xs text-[#3B241A]/70 max-w-xs mx-auto mt-1 mb-3.5 leading-relaxed">
                          Please sign in or create an account to proceed with placing your café order.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenAuth?.('signin')}
                            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#3B241A] hover:bg-[#2A1810] rounded-xl transition-colors cursor-pointer shadow-xs"
                          >
                            Sign In to Order
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAuth?.('signup')}
                            className="flex-1 py-2 px-3 text-xs font-semibold text-[#3B241A] bg-white border border-[#3B241A]/20 hover:bg-[#F5ECD9] rounded-xl transition-colors cursor-pointer"
                          >
                            Create Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-white border border-[#87986A]/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#87986A]" />
                          <span className="text-[#3B241A]/80">
                            Ordering as <strong className="text-[#3B241A]">{userProfile?.displayName || user.displayName || user.email}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] text-[#87986A] font-semibold bg-[#87986A]/10 px-2 py-0.5 rounded-md">
                          Verified User
                        </span>
                      </div>
                    )}

                    {/* Customer Details Form */}
                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Rahul Verma"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                          Phone Number (for pickup SMS) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                          Notes for Barista (Optional)
                        </label>
                        <input
                          type="text"
                          value={baristaNotes}
                          onChange={(e) => setBaristaNotes(e.target.value)}
                          placeholder="e.g. Oat milk, extra hot, less sweet..."
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                        />
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}

            {/* ----------------- TAB 2: PAST ORDERS (CUSTOMER RETENTION) ----------------- */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Retention banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#87986A]/20 via-[#F5ECD9] to-[#C96F4A]/15 border border-[#3B241A]/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3B241A] mb-0.5">
                    <Sparkles className="w-4 h-4 text-[#C96F4A]" />
                    <span>Loyalty & Quick Reorder</span>
                  </div>
                  <p className="text-[11px] text-[#3B241A]/75 leading-relaxed">
                    Reorder previous brews and treats with 1-click. Free signature butter croissant on every 5th order!
                  </p>
                </div>

                {pastOrders.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-2xl p-6 border border-[#3B241A]/10">
                    <Receipt className="w-10 h-10 text-[#3B241A]/30 mx-auto mb-2" />
                    <h4 className="font-serif text-base font-bold text-[#3B241A]">
                      No Past Orders Found
                    </h4>
                    <p className="text-xs text-[#3B241A]/60 mt-1 mb-5 max-w-xs mx-auto leading-relaxed">
                      When you order delicious bakes and handcrafted coffee, your completed orders will appear here for fast 1-tap reordering.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('current')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#3B241A] rounded-xl hover:bg-[#2A1810] transition-colors cursor-pointer"
                    >
                      Browse & Order Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastOrders.map((order) => {
                      const isRecentlyReordered = reorderedOrderId === order.id;
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3B241A]/10 shadow-xs hover:shadow-sm transition-all"
                        >
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#3B241A]/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#3B241A]">
                                  {order.id}
                                </span>
                                <span className="text-[10px] font-semibold text-[#87986A] bg-[#87986A]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {order.orderType}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#3B241A]/60 mt-0.5">
                                {order.relativeTime}
                              </p>
                            </div>

                            <span className="text-[11px] font-semibold text-[#87986A] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>{order.status}</span>
                            </span>
                          </div>

                          {/* Items in this past order */}
                          <div className="py-3 space-y-2.5">
                            {order.items.map(({ item, quantity, notes }, itemIdx) => (
                              <div
                                key={`${order.id}-${item.id}-${itemIdx}`}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#F5ECD9]">
                                    <ImageWithFallback
                                      src={item.image}
                                      alt={item.name}
                                      aspectRatioClass="aspect-square"
                                      fallbackTitle={item.name}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#3B241A] truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-[#3B241A]/60">
                                      {quantity}x · <span className="font-serif tabular-nums">₹{item.price}</span>
                                      {notes && <span className="italic ml-1">({notes})</span>}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-serif font-semibold text-[#3B241A] tabular-nums">
                                    ₹{item.price * quantity}
                                  </span>
                                  {/* Quick add single item */}
                                  <button
                                    type="button"
                                    onClick={() => handleReorderSingleItem(item)}
                                    title={`Add 1 ${item.name} to current bag`}
                                    className="p-1 rounded-md bg-[#F5ECD9] hover:bg-[#3B241A] text-[#3B241A] hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer with Total and Reorder Button */}
                          <div className="pt-3 border-t border-[#3B241A]/10 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] text-[#3B241A]/50 uppercase tracking-wider block">
                                Total Paid
                              </span>
                              <span className="font-serif text-sm font-bold text-[#3B241A] tabular-nums">
                                ₹{order.total}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleReorderOrder(order)}
                              disabled={isRecentlyReordered}
                              className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isRecentlyReordered
                                  ? 'bg-[#87986A] text-white'
                                  : 'bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] shadow-xs'
                              }`}
                            >
                              {isRecentlyReordered ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added to Bag!</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Reorder All ({order.items.length})</span>
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
            )}
          </div>

          {/* Footer & Checkout Button for Current Bag */}
          {activeTab === 'current' && !isOrdered && cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#3B241A]/10 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-[#3B241A]/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-medium text-[#3B241A] tabular-nums">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-serif font-medium text-[#3B241A] tabular-nums">
                    ₹{gst}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#3B241A] pt-2 border-t border-[#3B241A]/10">
                  <span>Total Payable</span>
                  <span className="font-serif text-base text-[#C96F4A] tabular-nums">
                    ₹{total}
                  </span>
                </div>
              </div>

              {!user ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenAuth?.('signin')}
                    className="w-full py-3 px-4 bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#C96F4A]" />
                    <span>Log In to Place Order (₹{total})</span>
                  </button>
                  <p className="text-[11px] text-center text-[#3B241A]/60">
                    Sign in or create an account to finalize your order
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3 px-4 bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Place Order · Pay ₹{total} (Counter / UPI)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
