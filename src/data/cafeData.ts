import { MenuItem, Review, GalleryItem } from '../types';

export const BUSINESS_INFO = {
  name: 'Brew & Bloom Café',
  type: 'Specialty Café & Bakery',
  tagline: 'Fresh Brews. Fresh Bakes. Good Vibes.',
  established: '2021',
  location: 'Gomti Nagar, Lucknow, Uttar Pradesh',
  fullAddress: 'Plot 14, Vibhuti Khand, Near Riverside Mall, Gomti Nagar, Lucknow, UP 226010',
  phone: '+91 98765 43210',
  email: 'hello@brewandbloom.example',
  openingHours: '8:00 AM – 10:30 PM',
  instagram: '@brewandbloomcafe',
  instagramUrl: 'https://instagram.com/brewandbloomcafe',
  mapCoordinates: { lat: 26.8528, lng: 80.9995 },
  mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Gomti+Nagar+Lucknow+Brew+and+Bloom+Cafe'
};

export const MENU_ITEMS: MenuItem[] = [
  // Coffee
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'Coffee',
    price: 180,
    description: 'Double shot of estate-grown Arabica with silky steamed whole milk and velvety microfoam dusted with organic cocoa.',
    image: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['House Favorite', 'Hot'],
    dietary: 'Vegetarian'
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    category: 'Coffee',
    price: 220,
    description: 'Layered handcrafted espresso poured over sweet condensed milk and cold whole milk with rich natural crema.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['Bestseller', 'Iced / Hot'],
    dietary: 'Vegetarian'
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    category: 'Coffee',
    price: 190,
    description: 'Slow-blended signature cold brew with creamy milk, vanilla bean extract, and subtle caramel undertones.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['Chilled Classic'],
    dietary: 'Vegetarian'
  },
  {
    id: 'americano',
    name: 'Americano',
    category: 'Coffee',
    price: 150,
    description: 'Precision-pulled espresso shots lengthened with pure hot mineral water, highlighting bright stone-fruit notes.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['Zero Sugar', 'Bold'],
    dietary: 'Vegan'
  },

  // Non-Coffee
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    category: 'Non-Coffee',
    price: 230,
    description: 'First-harvest ceremonial Uji matcha stone-ground and whisked with velvety steamed oat or whole milk.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['Antioxidant Rich', 'Japanese Matcha'],
    dietary: 'Vegetarian'
  },
  {
    id: 'chocolate-frappe',
    name: 'Chocolate Frappe',
    category: 'Non-Coffee',
    price: 220,
    description: 'Decadent Belgian dark chocolate ganache blended with crushed ice and rich cream, topped with cocoa nibs.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['Sweet Indulgence', 'Kid Favorite'],
    dietary: 'Vegetarian'
  },

  // Food
  {
    id: 'grilled-cheese-sandwich',
    name: 'Grilled Cheese Sandwich',
    category: 'Food',
    price: 240,
    description: 'Melted aged cheddar and creamy mozzarella toasted golden on artisan country sourdough with garlic butter.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['Comfort Food', 'Warm'],
    dietary: 'Vegetarian'
  },
  {
    id: 'pesto-paneer-sandwich',
    name: 'Pesto Paneer Sandwich',
    category: 'Food',
    price: 260,
    description: 'Marinated soft malai cottage cheese, house-whipped pine nut basil pesto, sun-dried tomatoes, and crisp rocket.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['Chef Special', 'Savory'],
    dietary: 'Vegetarian'
  },
  {
    id: 'veggie-croissant',
    name: 'Veggie Croissant',
    category: 'Food',
    price: 210,
    description: 'Flaky warm butter croissant stuffed with herb-roasted bell peppers, zucchini, baby spinach, and herb feta spread.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['All-Day Breakfast'],
    dietary: 'Vegetarian'
  },

  // Dessert
  {
    id: 'lotus-biscoff-cheesecake',
    name: 'Lotus Biscoff Cheesecake',
    category: 'Dessert',
    price: 280,
    description: 'Silky smooth baked New York cheesecake on a spiced speculoos cookie crust, finished with warm molten Biscoff spread.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['Signature Dessert', 'Eggless'],
    dietary: 'Eggless'
  },
  {
    id: 'chocolate-brownie',
    name: 'Chocolate Brownie',
    category: 'Dessert',
    price: 180,
    description: 'Fudgy 70% dark Valrhona chocolate brownie with molten pockets, roasted walnuts, and a pinch of Maldon sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    tags: ['Warm & Gooey', 'Served with cream'],
    dietary: 'Eggless'
  },

  // Bakery
  {
    id: 'butter-croissant',
    name: 'Butter Croissant',
    category: 'Bakery',
    price: 140,
    description: 'Classic French viennoiserie laminated with 84% Normandy butter, baked daily at 6:30 AM for airy honeycomb interior.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    tags: ['Baked Fresh Daily', 'Golden Flaky'],
    dietary: 'Vegetarian'
  }
];

export const POPULAR_ITEMS = MENU_ITEMS.filter((item) => item.isPopular);

export const WHY_CHOOSE_US_FEATURES = [
  {
    id: 'fresh-coffee',
    title: 'Freshly Roasted Coffee',
    description: 'Single-estate specialty beans sourced directly from Chikmagalur estates and roasted weekly for clean, nuanced flavor notes.',
    badge: '100% Arabica'
  },
  {
    id: 'baked-morning',
    title: 'Baked Every Morning',
    description: 'Our in-house pastry chef begins at 6:00 AM daily. Authentic laminated viennoiserie, sourdough breads, and preservative-free cakes.',
    badge: 'In-House Oven'
  },
  {
    id: 'free-wifi',
    title: 'Free High-Speed Wi-Fi',
    description: 'Dedicated 300 Mbps dual-band fiber connection with seamless roaming, tailored for remote professionals and students.',
    badge: '300 Mbps Fiber'
  },
  {
    id: 'cozy-workspace',
    title: 'Cozy Workspace',
    description: 'Ergonomic seating, abundant natural sunlight, personal charging sockets at every booth, and gentle acoustic playlists.',
    badge: 'Power Sockets'
  },
  {
    id: 'pet-friendly',
    title: 'Pet-Friendly Seating',
    description: 'A breezy outdoor garden patio filled with leafy green foliage where your four-legged companions are greeted with water bowls & treats.',
    badge: 'Pups Welcome'
  }
];

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Ananya Sharma',
    role: 'Remote Product Designer',
    rating: 5,
    date: '2 days ago',
    comment: 'My absolute go-to workspace in Gomti Nagar. The Spanish Latte is by far the best in Lucknow, and the Wi-Fi never drops during client calls. The baristas treat you like family!',
    avatarBg: '#87986A',
    tag: 'Remote Work Regular'
  },
  {
    id: 'rev-2',
    name: 'Raghav Mehra',
    role: 'Specialty Coffee Connoisseur',
    rating: 5,
    date: '1 week ago',
    comment: 'Finally, a café in Lucknow that understands espresso extraction! The Cappuccino has proper microfoam texture with sweet caramel notes. Do not leave without trying the Lotus Biscoff cheesecake.',
    avatarBg: '#3B241A',
    tag: 'Coffee & Dessert'
  },
  {
    id: 'rev-3',
    name: 'Dr. Priya Verma',
    role: 'Professor & Plant Enthusiast',
    rating: 5,
    date: '2 weeks ago',
    comment: 'The outdoor garden patio is my Sunday sanctuary. The sage green foliage, terracotta planters, and warm morning sun make reading a joy. Plus, they were so kind to my golden retriever!',
    avatarBg: '#C96F4A',
    tag: 'Patio & Pets'
  },
  {
    id: 'rev-4',
    name: 'Kabir Srivastava',
    role: 'Architect & Lucknow Native',
    rating: 5,
    date: '3 weeks ago',
    comment: 'From the earthy espresso tones to the sourdough Pesto Paneer sandwich, everything feels thoughtfully curated. Beautiful design, great acoustic balance, and genuine hospitality.',
    avatarBg: '#6C7D52',
    tag: 'Brunch & Ambience'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Main Espresso Bar & Sunlit Counter',
    category: 'Interior',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
    description: 'Handcrafted espresso machine and warm timber accents where our baristas pull morning shots.'
  },
  {
    id: 'gal-2',
    title: 'Precision Latte Art in Ceramic Cup',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=1000&q=80',
    description: 'Velvety microfoam rosettas poured on our single-origin Chikmagalur Arabica espresso.'
  },
  {
    id: 'gal-3',
    title: 'Lotus Biscoff Cheesecake Slice',
    category: 'Desserts & Bakes',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80',
    description: 'Rich cream cheese layer over crunchy spiced speculoos crust with warm cookie butter drizzle.'
  },
  {
    id: 'gal-4',
    title: 'Leafy Pet-Friendly Garden Patio',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    description: 'Breezy outdoor garden seating shaded by potted monsteras and glowing bistro string lights.'
  },
  {
    id: 'gal-5',
    title: 'Morning Croissant Display',
    category: 'Desserts & Bakes',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
    description: 'Golden honeycomb layers baked fresh every day at 6:30 AM with 84% European butter.'
  },
  {
    id: 'gal-6',
    title: 'Iced Spanish Latte & Cold Brews',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80',
    description: 'Refreshing chilled drinks served in modern ribbed glassware with double cold brew concentrates.'
  },
  {
    id: 'gal-7',
    title: 'Quiet Study & Remote Work Corner',
    category: 'Interior',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=80',
    description: 'Ergonomic oak tables equipped with personal power plugs and warm glare-free task lighting.'
  },
  {
    id: 'gal-8',
    title: 'Evening Lights on the Terrace',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1000&q=80',
    description: 'Warm terracotta hues and intimate acoustic evenings under Lucknow starlight.'
  }
];

export const SIMULATED_PAST_ORDERS: import('../types').PastOrder[] = [
  {
    id: 'BB-ORD-8421',
    date: 'Sep 26, 2026',
    relativeTime: 'Yesterday · 4:15 PM',
    orderType: 'takeaway',
    items: [
      {
        item: MENU_ITEMS.find((i) => i.id === 'spanish-latte') || MENU_ITEMS[1],
        quantity: 1,
        notes: 'Less sweet, whole milk'
      },
      {
        item: MENU_ITEMS.find((i) => i.id === 'lotus-biscoff-cheesecake') || MENU_ITEMS[9],
        quantity: 1,
        notes: 'Extra cookie crumble'
      }
    ],
    subtotal: 500,
    tax: 25,
    total: 525,
    status: 'Completed',
    notes: 'Takeaway pickup at Gomti Nagar counter'
  },
  {
    id: 'BB-ORD-7193',
    date: 'Sep 24, 2026',
    relativeTime: '3 days ago · 11:30 AM',
    orderType: 'dine-in',
    items: [
      {
        item: MENU_ITEMS.find((i) => i.id === 'cappuccino') || MENU_ITEMS[0],
        quantity: 1,
        notes: 'Double shot espresso'
      },
      {
        item: MENU_ITEMS.find((i) => i.id === 'pesto-paneer-sandwich') || MENU_ITEMS[7],
        quantity: 1,
        notes: 'Extra toasted sourdough'
      },
      {
        item: MENU_ITEMS.find((i) => i.id === 'butter-croissant') || MENU_ITEMS[11],
        quantity: 1
      }
    ],
    subtotal: 580,
    tax: 29,
    total: 609,
    status: 'Completed',
    notes: 'Dine-in at Table 4 (Indoor AC)'
  }
];

