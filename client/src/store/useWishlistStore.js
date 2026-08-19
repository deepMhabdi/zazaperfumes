import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // product IDs

      toggle: (productId) => {
        const items = get().items;
        const idx = items.indexOf(productId);
        if (idx === -1) {
          set({ items: [...items, productId] });
        } else {
          set({ items: items.filter((id) => id !== productId) });
        }
      },

      isWishlisted: (productId) => get().items.includes(productId),

      setFromServer: (ids) => set({ items: ids }),

      clear: () => set({ items: [] }),
    }),
    { name: 'zaza-wishlist' }
  )
);

export default useWishlistStore;
