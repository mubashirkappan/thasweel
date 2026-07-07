import { defineStore } from 'pinia';

interface CartItem {
  currency:string;
  name: string;
  count: number;
  price: number;
}

export const useCartStore = defineStore('cartStore', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: () => ({
    cartItems: [] as CartItem[],
    activeShopId: null as string | number | null, // Track which shop this cart belongs to
    currency: '',
  }),
  actions: {
    initShopCart(shopId: string | number) {
      if (this.activeShopId && this.activeShopId !== shopId) {
        // If switching to a different shop, clear the previous shop's items automatically
        this.cartItems = [];
      }
      this.activeShopId = shopId;
    },
    addItem(itemName: string, quantity: number = 1, price: number, shopId: string | number) {
      this.initShopCart(shopId); // Ensure shop context matches

      const existingItem = this.cartItems.find((i) => i.name === itemName);
      if (existingItem) {
        existingItem.count = Number(quantity);
        existingItem.price = Number(price);
      } else {
        this.cartItems.push({ name: itemName, count: Number(quantity), price: Number(price), currency: this.currency });
      }
    },
    updateItem(itemName: string, quantity: number, price?: number) {
      const item = this.cartItems.find((i) => i.name === itemName);
      if (item) {
        item.count = Number(quantity);
        if (price !== undefined) {
          item.price = Number(price);
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
    itemsWithPrices(): { name: string; pricePerItem: number; quantity: number; totalPrice: number }[] {
      return this.cartItems.map((item) => ({
        name: item.name,
        pricePerItem: Number(item.price),  // Changed from Math.round to support floats
        quantity: item.count,
        totalPrice: Number(item.price) * item.count, // Changed from Math.round
      }));
    },
    totalAmount(): number {
      // Changed from Math.round to support floating-point reduction totals
      return this.cartItems.reduce((total, item) => total + item.count * Number(item.price), 0);
    },
    productCount(): number {
      return this.cartItems.length;
    },
    getCurrency(): string {
      return this.currency;
    },
  },
});
