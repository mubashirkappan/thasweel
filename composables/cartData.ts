import { defineStore } from 'pinia';

interface CartItem {
  currency: string;
  name: string;
  count: number;
  price: number;
  unit?: string;
  preparation_preference?: 'separate' | 'single_combined';
  item_note?: string;
}

export const useCartStore = defineStore('cartStore', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: () => ({
    cartItems: [] as CartItem[],
    activeShopId: null as string | number | null, // Tracks shop context
    currency: '',
  }),
  actions: {
    initShopCart(shopId: string | number) {
      // CRITICAL FIX: If the shop ID changes, clear out the old shop's items immediately
      if (this.activeShopId && String(this.activeShopId) !== String(shopId)) {
        this.cartItems = [];
      }
      this.activeShopId = shopId;
    },
    addItem(
      itemName: string,
      quantity: number = 1,
      price: number,
      shopId: string | number,
      unit?: string,
      preparation_preference?: 'separate' | 'single_combined',
      item_note?: string
    ) {
      this.initShopCart(shopId); // Sync shop context

      const existingItem = this.cartItems.find((i) => i.name === itemName);

      if (existingItem) {
        existingItem.count = Number(quantity);
        existingItem.price = Number(price);
        if (unit) existingItem.unit = unit;
        if (preparation_preference) existingItem.preparation_preference = preparation_preference;
        if (item_note !== undefined) existingItem.item_note = item_note;
      } else {
        this.cartItems.push({ 
          name: itemName, 
          count: Number(quantity), 
          price: Number(price), 
          currency: this.currency,
          unit: unit || '',
          preparation_preference: preparation_preference || 'separate',
          item_note: item_note || '',
        });
      }
    },
    updateItem(
      itemName: string,
      quantity: number,
      price?: number,
      preparation_preference?: 'separate' | 'single_combined',
      item_note?: string
    ) {
      const item = this.cartItems.find((i) => i.name === itemName);
      if (item) {
        item.count = Number(quantity);
        if (price !== undefined) {
          item.price = Number(price);
        }
        if (preparation_preference) {
          item.preparation_preference = preparation_preference;
        }
        if (item_note !== undefined) {
          item.item_note = item_note;
        }
      }
    },
    setCurrency(newCurrency: string) {
      this.currency = newCurrency;
      this.cartItems.forEach((item) => {
        item.currency = newCurrency;
      });
    },
    removeItem(itemName: string) {
      const index = this.cartItems.findIndex((i) => i.name === itemName);
      if (index !== -1) {
        this.cartItems.splice(index, 1);
      }
    },
  },
  getters: {
    itemNames(): string[] {
      return this.cartItems.map((item) => item.name);
    },
    itemCounts(): number[] {
      return this.cartItems.map((item) => item.count);
    },
    itemPrices(): number[] {
      return this.cartItems.map((item) => item.price);
    },
    itemsWithPrices(): { name: string; pricePerItem: number; quantity: number; totalPrice: number; unit?: string; preparation_preference?: string; item_note?: string }[] {
      return this.cartItems.map((item) => ({
        name: item.name,
        pricePerItem: Number(item.price),
        quantity: item.count,
        totalPrice: Number(item.price) * item.count,
        unit: item.unit,
        preparation_preference: item.preparation_preference,
        item_note: item.item_note,
      }));
    },
    totalAmount(): number {
      // FIXED: Calculated using precise floats
      return this.cartItems.reduce((total, item) => total + item.count * Number(item.price), 0);
    },
    productCount(): number {
      return this.cartItems.length;
    },
    getCurrency(): string {
      return this.currency || '';
    },
  },
});