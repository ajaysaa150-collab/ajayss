export interface MenuItem {
  id: string;
  name: string;
  category: 'Coffee' | 'Non-Coffee' | 'Food' | 'Dessert' | 'Bakery';
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  tags?: string[];
  dietary?: 'Vegetarian' | 'Vegan' | 'Contains Dairy' | 'Eggless';
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  avatarBg: string;
  tag: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Interior' | 'Coffee' | 'Desserts & Bakes' | 'Outdoor';
  image: string;
  description: string;
}

export interface PastOrder {
  id: string;
  date: string;
  relativeTime: string;
  orderType: 'takeaway' | 'dine-in';
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Completed' | 'Ready for Pickup';
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt?: string;
  totalBookings?: number;
  totalOrders?: number;
}

export interface TableBooking {
  id: string;
  confirmationCode: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  guests: string;
  date: string;
  time: string;
  seating: string;
  specialNotes?: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}


