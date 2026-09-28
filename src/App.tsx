import React, { useState, useEffect } from 'react';
import { AuthProvider } from './firebase/AuthContext';
import { AdminAuthProvider } from './firebase/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { MenuSection } from './components/MenuSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { CustomerReviews } from './components/CustomerReviews';
import { GallerySection } from './components/GallerySection';
import { LocationContact } from './components/LocationContact';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ReservationModal } from './components/ReservationModal';
import { AuthModal } from './components/AuthModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { VeoVideoModal } from './components/VeoVideoModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { CartItem, MenuItem } from './types';
import { Phone, Navigation, UtensilsCrossed, Calendar } from 'lucide-react';
import { BUSINESS_INFO } from './data/cafeData';

function MainApp() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'orders' | 'bookings' | 'profile'>('orders');
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);
  const [veoInitialImage, setVeoInitialImage] = useState<string | undefined>(undefined);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL hash for direct admin link
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsAdminPortalOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenProfile = (tab: 'orders' | 'bookings' | 'profile' = 'orders') => {
    setProfileTab(tab);
    setIsProfileOpen(true);
  };

  const handleOpenVeo = (img?: string) => {
    setVeoInitialImage(img);
    setIsVeoModalOpen(true);
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === menuItem.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === menuItem.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item: menuItem, quantity: 1 }];
    });

    setToastMessage(`Added "${menuItem.name}" to order bag`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleReorderItems = (items: CartItem[]) => {
    setCart((prev) => {
      const updated = [...prev];
      items.forEach((newItem) => {
        const existingIndex = updated.findIndex((ci) => ci.item.id === newItem.item.id);
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
          };
        } else {
          updated.push({ ...newItem });
        }
      });
      return updated;
    });

    setToastMessage(`Added ${items.length} item${items.length > 1 ? 's' : ''} to bag`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EE] text-[#3B241A] font-sans selection:bg-[#C96F4A]/25 selection:text-[#3B241A]">
      {/* Top Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenMyBookings={() => handleOpenProfile('bookings')}
        onOpenPastOrders={() => handleOpenProfile('orders')}
        onOpenProfile={handleOpenProfile}
        onOpenVeoVideo={handleOpenVeo}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreMenu={() => handleScrollToSection('menu')}
          onVisitUs={() => handleScrollToSection('location')}
        />

        {/* About Section */}
        <About />

        {/* Popular & Full Menu Section */}
        <MenuSection onAddToCart={handleAddToCart} />

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* Customer Reviews Section */}
        <CustomerReviews />

        {/* Gallery Section with Veo AI Video Animator */}
        <GallerySection onOpenVeoVideo={handleOpenVeo} />

        {/* Location & Contact Section */}
        <LocationContact
          onOpenAuth={handleOpenAuth}
          onOpenMyBookings={() => handleOpenProfile('bookings')}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminPortalOpen(true)} />

      {/* Order Bag Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onReorderItems={handleReorderItems}
        onAddToCart={handleAddToCart}
        onOpenAuth={handleOpenAuth}
      />

      {/* Table Reservation Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onOpenAuth={handleOpenAuth}
        onOpenMyBookings={() => handleOpenProfile('bookings')}
      />

      {/* Customer Profile & Past Orders / Bookings Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialTab={profileTab}
        onReorderItems={(items) => {
          handleReorderItems(items);
          setIsCartOpen(true);
        }}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        onExploreMenu={() => handleScrollToSection('menu')}
      />

      {/* Google Veo Photo-to-Video Animation Modal */}
      <VeoVideoModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        defaultImage={veoInitialImage}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          setToastMessage('Authentication successful!');
          setTimeout(() => setToastMessage(null), 2400);
        }}
        onAdminSuccess={() => {
          setIsAdminPortalOpen(true);
          setToastMessage('Signed in as Administrator');
          setTimeout(() => setToastMessage(null), 2400);
        }}
      />

      {/* My Bookings Stored in Firebase Modal (fallback direct trigger) */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        onNewBookingClick={() => setIsReservationOpen(true)}
      />

      {/* Admin Portal Modal / Full-Screen View */}
      {isAdminPortalOpen && (
        <AdminPortal onClose={() => setIsAdminPortalOpen(false)} />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#3B241A] text-[#FFF8EE] px-4 py-3 rounded-2xl shadow-xl border border-white/10 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#87986A]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="ml-2 underline text-[#87986A] hover:text-white cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}

      {/* Mobile Bottom Quick-Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFF8EE]/95 backdrop-blur-md border-t border-[#3B241A]/10 px-3 py-2 flex items-center justify-around text-[10px] font-semibold text-[#3B241A]">
        <button
          type="button"
          onClick={() => handleScrollToSection('menu')}
          className="flex flex-col items-center gap-0.5 p-1 text-[#3B241A]"
        >
          <UtensilsCrossed className="w-4 h-4 text-[#C96F4A]" />
          <span>Menu</span>
        </button>
        <button
          type="button"
          onClick={() => setIsReservationOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1 text-[#3B241A]"
        >
          <Calendar className="w-4 h-4 text-[#87986A]" />
          <span>Reserve</span>
        </button>
        <a
          href={BUSINESS_INFO.mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 p-1 text-[#3B241A]"
        >
          <Navigation className="w-4 h-4 text-[#3B241A]" />
          <span>Directions</span>
        </a>
        <a
          href={`tel:${BUSINESS_INFO.phone}`}
          className="flex flex-col items-center gap-0.5 p-1 text-[#3B241A]"
        >
          <Phone className="w-4 h-4 text-[#3B241A]" />
          <span>Call Us</span>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <MainApp />
      </AdminAuthProvider>
    </AuthProvider>
  );
}
