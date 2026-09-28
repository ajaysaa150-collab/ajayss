import { PastOrder, CartItem, MenuItem } from '../types';
import { db } from '../firebase/config';
import { doc, setDoc, getDocs, collection, query, orderBy, serverTimestamp, increment, updateDoc } from 'firebase/firestore';

export const getUserOrdersKey = (userId: string) => `brew_bloom_past_orders_${userId}`;

export const fetchUserPastOrders = (userId: string): PastOrder[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getUserOrdersKey(userId));
    if (raw) {
      const parsed: PastOrder[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading user past orders from cache:', err);
  }
  return [];
};

/**
 * Asynchronously sync and fetch past orders from Firestore
 */
export const syncAndFetchUserOrders = async (userId: string): Promise<PastOrder[]> => {
  if (!userId) return [];

  // Start with local cache
  const localOrders = fetchUserPastOrders(userId);

  try {
    const ordersRef = collection(db, 'users', userId, 'pastOrders');
    const q = query(ordersRef, orderBy('createdAtServer', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remoteOrders: PastOrder[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        remoteOrders.push({
          id: docSnap.id,
          date: data.date,
          relativeTime: data.relativeTime,
          orderType: data.orderType,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          status: data.status,
          notes: data.notes,
        });
      });

      // Merge remote with local orders
      const mergedMap = new Map<string, PastOrder>();
      remoteOrders.forEach((o) => mergedMap.set(o.id, o));
      localOrders.forEach((o) => {
        if (!mergedMap.has(o.id)) {
          mergedMap.set(o.id, o);
        }
      });

      const merged = Array.from(mergedMap.values());
      localStorage.setItem(getUserOrdersKey(userId), JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not sync orders from Firestore:', err);
  }

  return localOrders;
};

export const saveUserPastOrder = (userId: string, order: PastOrder): PastOrder[] => {
  if (!userId) return [];
  try {
    const existing = fetchUserPastOrders(userId);
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(getUserOrdersKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('brew_bloom_orders_updated'));

    // Asynchronously persist to Firestore
    (async () => {
      try {
        const orderRef = doc(db, 'users', userId, 'pastOrders', order.id);
        await setDoc(orderRef, {
          ...order,
          createdAtServer: serverTimestamp(),
        });

        // Also increment totalOrders in user profile doc
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          totalOrders: increment(1),
        }).catch(() => {});
      } catch (firestoreErr) {
        console.warn('Could not persist order to Firestore:', firestoreErr);
      }
    })();

    return updated;
  } catch (err) {
    console.warn('Error saving user past order:', err);
    return [];
  }
};

export interface FavoriteItemSummary {
  item: MenuItem;
  totalOrderedCount: number;
  lastOrderedDate: string;
  lastOrderType: 'takeaway' | 'dine-in';
}

export const extractFavoriteItems = (orders: PastOrder[]): FavoriteItemSummary[] => {
  const itemMap = new Map<string, FavoriteItemSummary>();

  for (const order of orders) {
    for (const cartItem of order.items) {
      if (!cartItem?.item?.id) continue;
      const existing = itemMap.get(cartItem.item.id);
      if (existing) {
        existing.totalOrderedCount += cartItem.quantity;
      } else {
        itemMap.set(cartItem.item.id, {
          item: cartItem.item,
          totalOrderedCount: cartItem.quantity,
          lastOrderedDate: order.date,
          lastOrderType: order.orderType,
        });
      }
    }
  }

  return Array.from(itemMap.values()).sort(
    (a, b) => b.totalOrderedCount - a.totalOrderedCount
  );
};
