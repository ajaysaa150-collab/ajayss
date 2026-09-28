import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Calendar,
  Menu as MenuIcon,
  X,
  Clock,
  User as UserIcon,
  LogOut,
  ListOrdered,
  ChevronDown,
  ShieldCheck,
  Film
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/cafeData';
import { useAuth } from '../firebase/AuthContext';
import { useAdminAuth } from '../firebase/AdminAuthContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenMyBookings: () => void;
  onOpenPastOrders?: () => void;
  onOpenProfile?: (tab?: 'orders' | 'bookings' | 'profile') => void;
  onOpenVeoVideo?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenReservation,
  onOpenAuth,
  onOpenMyBookings,
  onOpenPastOrders,
  onOpenProfile,
  onOpenVeoVideo,
  onOpenAdmin,
}) => {
  const { user, userProfile, logOut } = useAuth();
  const { isAdmin, adminLogout } = useAdminAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    if (isAdmin) {
      adminLogout();
    }
    await logOut();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check whether cafe is open based on 8:00 AM - 10:30 PM IST (UTC+5:30)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const checkOpenStatus = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utc + 3600000 * 5.5);
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      setIsOpenNow(totalMinutes >= 480 && totalMinutes <= 1350);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Location', href: '#location' },
  ];

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-xs border-b border-[#3B241A]/10 py-3.5'
            : 'bg-[#FFF8EE]/95 border-b border-[#3B241A]/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#"
                className="font-serif text-2xl font-bold tracking-tight text-[#3B241A] hover:text-[#C96F4A] transition-colors"
              >
                Brew & Bloom
              </a>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#3B241A]/70 font-medium pl-3 border-l border-[#3B241A]/20">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpenNow ? 'bg-[#87986A]' : 'bg-[#C96F4A]'
                  }`}
                  aria-hidden="true"
                />
                <span>{isOpenNow ? 'Open Now' : 'Closed'}</span>
                <span aria-hidden="true">·</span>
                <span>8 AM – 10:30 PM</span>
              </span>
            </div>

            {/* Zone 2: 4-6 nav links (text with subtle hover underlines) */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#3B241A]/80">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#3B241A] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#C96F4A] hover:after:w-full after:transition-all after:duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Zone 3: 1-2 primary actions + Auth State */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* User authentication pill / dropdown */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#3B241A]/15 hover:border-[#3B241A]/40 bg-white text-xs font-semibold text-[#3B241A] transition-colors cursor-pointer"
                  >
                    {userProfile?.photoURL || user?.photoURL ? (
                      <img
                        src={userProfile?.photoURL || user?.photoURL || ''}
                        alt={displayName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#87986A] text-white flex items-center justify-center text-[10px] font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[90px] truncate">{displayName}</span>
                    <ChevronDown className="w-3 h-3 text-[#3B241A]/60" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#3B241A]/10 py-2 z-50 animate-fadeIn text-xs">
                      <div className="px-3.5 py-2 border-b border-[#3B241A]/10">
                        <p className="font-bold text-[#3B241A] truncate">{displayName}</p>
                        <p className="text-[11px] text-[#3B241A]/60 truncate">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenProfile) {
                            onOpenProfile('orders');
                          } else if (onOpenPastOrders) {
                            onOpenPastOrders();
                          } else {
                            onOpenMyBookings();
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#3B241A] hover:bg-[#F5ECD9] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#C96F4A]" />
                        <span>Past Orders & Reorder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenProfile) {
                            onOpenProfile('bookings');
                          } else {
                            onOpenMyBookings();
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#3B241A] hover:bg-[#F5ECD9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ListOrdered className="w-4 h-4 text-[#87986A]" />
                        <span>My Table Bookings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenProfile) {
                            onOpenProfile('profile');
                          } else {
                            onOpenMyBookings();
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#3B241A] hover:bg-[#F5ECD9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#3B241A]/70" />
                        <span>Account & Profile</span>
                      </button>

                      {isAdmin && onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#C96F4A] hover:bg-[#F5ECD9] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#C96F4A]" />
                          <span>Manager / Admin Portal</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors border-t border-[#3B241A]/5 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3B241A] bg-white border border-[#3B241A]/20 hover:border-[#3B241A] hover:bg-[#F5ECD9] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#3B241A]/70" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Admin Portal quick trigger: ONLY visible if authenticated as Admin */}
              {isAdmin && onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-white bg-[#C96F4A] hover:bg-[#B35F3C] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                  title="Manager / Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              )}

              {/* Animate Photo with Veo button */}
              {onOpenVeoVideo && (
                <button
                  type="button"
                  onClick={onOpenVeoVideo}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3B241A] bg-[#FFF8EE] border border-[#3B241A]/20 rounded-lg hover:border-[#C96F4A] hover:bg-[#F5ECD9] transition-colors cursor-pointer whitespace-nowrap"
                  title="Animate photos into cinematic video using Google Veo"
                >
                  <Film className="w-3.5 h-3.5 text-[#C96F4A]" />
                  <span>Animate with Veo</span>
                </button>
              )}

              {/* Reserve Table button */}
              <button
                type="button"
                onClick={onOpenReservation}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#3B241A] bg-[#FFF8EE] border border-[#3B241A]/20 rounded-lg hover:border-[#3B241A] hover:bg-[#F5ECD9] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C96F4A]" />
                <span>Reserve Table</span>
              </button>

              {/* Order Bag button */}
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Shopping bag with ${cartCount} items`}
                className="relative inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#3B241A] hover:bg-[#2A1810] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFF8EE]" />
                <span className="hidden sm:inline">Order Bag</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-[#C96F4A] text-white rounded-full tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#3B241A] hover:bg-[#F5ECD9] rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFF8EE] border-b border-[#3B241A]/10 px-4 pt-3 pb-6 shadow-md animate-fadeIn">
            <div className="flex items-center justify-between py-2 mb-2 border-b border-[#3B241A]/10 text-xs text-[#3B241A]/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#87986A]" />
                <span>8:00 AM – 10:30 PM Daily</span>
              </div>
              <span className="text-[#C96F4A] font-medium">{BUSINESS_INFO.location}</span>
            </div>

            {user && (
              <div className="mb-3 p-3.5 bg-white rounded-xl border border-[#3B241A]/10">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3B241A]/10">
                  <div className="flex items-center gap-2.5">
                    {userProfile?.photoURL || user?.photoURL ? (
                      <img
                        src={userProfile?.photoURL || user?.photoURL || ''}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border border-[#3B241A]/15 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#87986A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#3B241A]">{displayName}</p>
                      <p className="text-[11px] text-[#3B241A]/60">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#87986A] bg-[#87986A]/10 px-2 py-0.5 rounded-full">
                    Patron
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenProfile) {
                        onOpenProfile('orders');
                      } else if (onOpenPastOrders) {
                        onOpenPastOrders();
                      } else {
                        onOpenMyBookings();
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#FFF8EE] hover:bg-[#F5ECD9] text-[#3B241A] border border-[#3B241A]/15 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C96F4A]" />
                    <span>Past Orders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenProfile) {
                        onOpenProfile('bookings');
                      } else {
                        onOpenMyBookings();
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#FFF8EE] hover:bg-[#F5ECD9] text-[#3B241A] border border-[#3B241A]/15 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#87986A]" />
                    <span>Bookings</span>
                  </button>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-[#3B241A] hover:bg-[#F5ECD9] rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {onOpenVeoVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenVeoVideo();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#C96F4A] hover:bg-[#B35F3C] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Film className="w-4 h-4" />
                    <span>Animate Photo into Video (Veo AI)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenReservation();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#3B241A] bg-[#F5ECD9] rounded-lg hover:bg-[#E9DFCE] transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#C96F4A]" />
                  <span>Book a Table in Gomti Nagar</span>
                </button>

                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#3B241A] rounded-lg hover:bg-[#2A1810] transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}

                {isAdmin && onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C96F4A] hover:bg-[#B35F3C] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Manager / Admin Portal</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
