import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { TableBooking } from '../types';

const INITIAL_SAMPLE_BOOKINGS: TableBooking[] = [
  {
    id: 'sample-bk-1',
    confirmationCode: 'BB-4892',
    userId: 'user-sample-1',
    userEmail: 'priya.verma@example.com',
    customerName: 'Dr. Priya Verma',
    customerPhone: '+91 98765 12345',
    guests: '2',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    seating: 'Outdoor Pet-Friendly Garden',
    specialNotes: 'Bringing my golden retriever, outdoor corner preferred.',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sample-bk-2',
    confirmationCode: 'BB-7104',
    userId: 'user-sample-2',
    userEmail: 'rahul.s@example.com',
    customerName: 'Rahul Singhal',
    customerPhone: '+91 98210 99887',
    guests: '4',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    seating: 'Indoor Cozy Corner',
    specialNotes: 'Birthday celebration, bringing cake.',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'sample-bk-3',
    confirmationCode: 'BB-3389',
    userId: 'user-sample-3',
    userEmail: 'meera.das@example.com',
    customerName: 'Meera Das',
    customerPhone: '+91 94150 44321',
    guests: '1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '14:00',
    seating: 'Work Desk with Sockets',
    specialNotes: 'Remote work session with laptop.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-bk-4',
    confirmationCode: 'BB-9021',
    userId: 'user-sample-4',
    userEmail: 'aman.gupta@example.com',
    customerName: 'Aman Gupta',
    customerPhone: '+91 99360 88210',
    guests: '5-8',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:30',
    seating: 'Indoor Cozy Corner',
    specialNotes: 'University alumni reunion catch-up.',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

const ALL_BOOKINGS_STORAGE_KEY = 'brew_bloom_all_admin_bookings';
const DELETED_CODES_STORAGE_KEY = 'brew_bloom_deleted_booking_codes';

// Helper to manage deleted IDs/codes so they never reappear
const getDeletedCodes = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_CODES_STORAGE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
};

const markAsDeleted = (id: string, code?: string) => {
  try {
    const set = getDeletedCodes();
    if (id) set.add(id);
    if (code) set.add(code);
    localStorage.setItem(DELETED_CODES_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

const isDeletedBooking = (id?: string, code?: string): boolean => {
  const set = getDeletedCodes();
  if (id && set.has(id)) return true;
  if (code && set.has(code)) return true;
  return false;
};

const notifyBookingsChanged = () => {
  try {
    window.dispatchEvent(new CustomEvent('brew_bloom_bookings_updated'));
  } catch {}
};

const getStoredLocalBookings = (): TableBooking[] => {
  try {
    const raw = localStorage.getItem(ALL_BOOKINGS_STORAGE_KEY);
    if (raw) {
      const list: TableBooking[] = JSON.parse(raw);
      return list.filter((b) => !isDeletedBooking(b.id, b.confirmationCode));
    }
  } catch {}
  try {
    const initial = INITIAL_SAMPLE_BOOKINGS.filter((b) => !isDeletedBooking(b.id, b.confirmationCode));
    localStorage.setItem(ALL_BOOKINGS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {}
  return [];
};

const setStoredLocalBookings = (list: TableBooking[]) => {
  try {
    const filtered = list.filter((b) => !isDeletedBooking(b.id, b.confirmationCode));
    localStorage.setItem(ALL_BOOKINGS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
};

export const saveBooking = async (
  bookingData: Omit<TableBooking, 'id' | 'createdAt'>
): Promise<TableBooking> => {
  const localId = `BB-BK-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newBooking: TableBooking = {
    ...bookingData,
    id: localId,
    createdAt: nowIso,
  };

  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: serverTimestamp(),
      createdAtIso: nowIso,
    });
    newBooking.id = docRef.id;

    // Increment user's total bookings in Firestore
    try {
      const userRef = doc(db, 'users', bookingData.userId);
      await updateDoc(userRef, {
        totalBookings: increment(1),
        lastBookingDate: nowIso,
      });
    } catch {}
  } catch (err) {
    console.warn('Could not write to Firestore bookings collection (rules/network):', err);
  }

  // Update user specific cache
  try {
    const key = `brew_bloom_bookings_${bookingData.userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([newBooking, ...existing]));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Update global admin cache
  const allCurrent = getStoredLocalBookings();
  setStoredLocalBookings([newBooking, ...allCurrent.filter(b => b.confirmationCode !== newBooking.confirmationCode)]);

  notifyBookingsChanged();
  return newBooking;
};

export const fetchUserBookings = async (userId: string): Promise<TableBooking[]> => {
  const localKey = `brew_bloom_bookings_${userId}`;
  let localBookings: TableBooking[] = [];
  try {
    const parsed: TableBooking[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    localBookings = parsed.filter((b) => !isDeletedBooking(b.id, b.confirmationCode));
  } catch {}

  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const firestoreBookings = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            confirmationCode: data.confirmationCode,
            userId: data.userId,
            userEmail: data.userEmail,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            guests: data.guests,
            date: data.date,
            time: data.time,
            seating: data.seating,
            specialNotes: data.specialNotes,
            status: data.status || 'Confirmed',
            createdAt: data.createdAtIso || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
          } as TableBooking;
        })
        .filter((b) => !isDeletedBooking(b.id, b.confirmationCode));

      const map = new Map<string, TableBooking>();
      firestoreBookings.forEach((b) => map.set(b.confirmationCode || b.id, b));
      localBookings.forEach((b) => {
        if (!map.has(b.confirmationCode || b.id)) {
          map.set(b.confirmationCode || b.id, b);
        }
      });
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Firestore fetch bookings error, returning local cache:', err);
  }

  return localBookings;
};

export const cancelBooking = async (bookingId: string, userId: string): Promise<void> => {
  let targetCode = '';

  // Update in Firestore
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: 'Cancelled' });
  } catch (err) {
    console.warn('Firestore cancel booking error:', err);
  }

  // Update local user cache
  try {
    const key = `brew_bloom_bookings_${userId}`;
    const existing: TableBooking[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map((b) => {
      if (b.id === bookingId) {
        targetCode = b.confirmationCode;
        return { ...b, status: 'Cancelled' as const };
      }
      return b;
    });
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  // Update global admin cache
  const allCurrent = getStoredLocalBookings();
  setStoredLocalBookings(
    allCurrent.map((b) =>
      b.id === bookingId || (targetCode && b.confirmationCode === targetCode)
        ? { ...b, status: 'Cancelled' as const }
        : b
    )
  );

  notifyBookingsChanged();
};

// =================== ADMIN PORTAL SERVICES ===================

export const fetchAllBookingsForAdmin = async (): Promise<TableBooking[]> => {
  const localList = getStoredLocalBookings();

  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const firestoreBookings = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            confirmationCode: data.confirmationCode || `BB-${docSnap.id.slice(-4)}`,
            userId: data.userId || 'guest',
            userEmail: data.userEmail || '',
            customerName: data.customerName || 'Guest',
            customerPhone: data.customerPhone || '',
            guests: data.guests || '2',
            date: data.date || new Date().toISOString().split('T')[0],
            time: data.time || '18:00',
            seating: data.seating || 'Indoor Cozy Corner',
            specialNotes: data.specialNotes || '',
            status: data.status || 'Confirmed',
            createdAt: data.createdAtIso || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
          } as TableBooking;
        })
        .filter((b) => !isDeletedBooking(b.id, b.confirmationCode));

      const map = new Map<string, TableBooking>();
      firestoreBookings.forEach((b) => map.set(b.confirmationCode, b));
      localList.forEach((b) => {
        if (!map.has(b.confirmationCode)) {
          map.set(b.confirmationCode, b);
        }
      });

      const merged = Array.from(map.values())
        .filter((b) => !isDeletedBooking(b.id, b.confirmationCode))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStoredLocalBookings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Firestore fetchAllBookings error (rules/network), using local store:', err);
  }

  return localList.filter((b) => !isDeletedBooking(b.id, b.confirmationCode));
};

export const updateBookingStatusByAdmin = async (
  bookingId: string,
  newStatus: 'Confirmed' | 'Completed' | 'Cancelled',
  confirmationCode?: string
): Promise<void> => {
  // 1. Update in Firestore by Document ID
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: newStatus });
  } catch (err) {
    console.warn('Firestore direct doc update status error, trying confirmationCode query:', err);
  }

  // Also query by confirmationCode in case Firestore doc ID differs from local ID
  if (confirmationCode) {
    try {
      const q = query(collection(db, 'bookings'), where('confirmationCode', '==', confirmationCode));
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        try {
          await updateDoc(doc(db, 'bookings', d.id), { status: newStatus });
        } catch {}
      });
    } catch {}
  }

  // 2. Update in Admin cache
  const all = getStoredLocalBookings();
  const updatedAll = all.map((b) => {
    if (b.id === bookingId || (confirmationCode && b.confirmationCode === confirmationCode)) {
      return { ...b, status: newStatus };
    }
    return b;
  });
  setStoredLocalBookings(updatedAll);

  // 3. Update across all user caches in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('brew_bloom_bookings_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list: TableBooking[] = JSON.parse(raw);
          const changed = list.map((b) => {
            if (b.id === bookingId || (confirmationCode && b.confirmationCode === confirmationCode)) {
              return { ...b, status: newStatus };
            }
            return b;
          });
          localStorage.setItem(key, JSON.stringify(changed));
        }
      }
    }
  } catch {}

  notifyBookingsChanged();
};

export const updateBookingDetailsByAdmin = async (
  bookingId: string,
  details: Partial<TableBooking>,
  confirmationCode?: string
): Promise<void> => {
  // 1. Update in Firestore
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { ...details });
  } catch (err) {
    console.warn('Firestore update booking details error:', err);
  }

  if (confirmationCode) {
    try {
      const q = query(collection(db, 'bookings'), where('confirmationCode', '==', confirmationCode));
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        try {
          await updateDoc(doc(db, 'bookings', d.id), { ...details });
        } catch {}
      });
    } catch {}
  }

  // 2. Update Admin cache
  const all = getStoredLocalBookings();
  const updatedAll = all.map((b) => {
    if (b.id === bookingId || (confirmationCode && b.confirmationCode === confirmationCode)) {
      return { ...b, ...details };
    }
    return b;
  });
  setStoredLocalBookings(updatedAll);

  // 3. Update across all user caches in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('brew_bloom_bookings_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list: TableBooking[] = JSON.parse(raw);
          const changed = list.map((b) => {
            if (b.id === bookingId || (confirmationCode && b.confirmationCode === confirmationCode)) {
              return { ...b, ...details };
            }
            return b;
          });
          localStorage.setItem(key, JSON.stringify(changed));
        }
      }
    }
  } catch {}

  notifyBookingsChanged();
};

export const deleteBookingByAdmin = async (
  bookingId: string,
  confirmationCode?: string
): Promise<void> => {
  // 1. Mark as permanently deleted in blacklist set
  markAsDeleted(bookingId, confirmationCode);

  // 2. Delete from Firestore by document ID
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingRef);
  } catch (err) {
    console.warn('Firestore direct delete error:', err);
  }

  // 3. Also query and delete from Firestore by confirmationCode
  if (confirmationCode) {
    try {
      const q = query(collection(db, 'bookings'), where('confirmationCode', '==', confirmationCode));
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        try {
          await deleteDoc(doc(db, 'bookings', d.id));
        } catch {}
      });
    } catch (err) {
      console.warn('Firestore delete by code error:', err);
    }
  }

  // 4. Remove from Admin cache
  const all = getStoredLocalBookings();
  const filtered = all.filter(
    (b) => b.id !== bookingId && (!confirmationCode || b.confirmationCode !== confirmationCode)
  );
  setStoredLocalBookings(filtered);

  // 5. Remove from all user caches in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('brew_bloom_bookings_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list: TableBooking[] = JSON.parse(raw);
          const cleaned = list.filter(
            (b) => b.id !== bookingId && (!confirmationCode || b.confirmationCode !== confirmationCode)
          );
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      }
    }
  } catch {}

  notifyBookingsChanged();
};

export const createAdminBooking = async (
  bookingData: Omit<TableBooking, 'id' | 'createdAt' | 'confirmationCode' | 'userId'>
): Promise<TableBooking> => {
  const confirmationCode = `BB-ADM-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();
  const localId = `admin-bk-${Date.now()}`;

  const newBooking: TableBooking = {
    ...bookingData,
    id: localId,
    confirmationCode,
    userId: 'admin-created',
    createdAt: nowIso,
  };

  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...newBooking,
      createdAt: serverTimestamp(),
      createdAtIso: nowIso,
      createdVia: 'Admin Portal',
    });
    newBooking.id = docRef.id;
  } catch (err) {
    console.warn('Firestore create admin booking error (fallback to local):', err);
  }

  const all = getStoredLocalBookings();
  setStoredLocalBookings([newBooking, ...all]);

  notifyBookingsChanged();
  return newBooking;
};
