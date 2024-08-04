import { defineStore } from 'pinia';

interface CartItem {
  name: string;
  count: number;
}

export const useCartStore = defineStore('cartStore', {
  persist: true,
  state: (): { cartItems: CartItem[] } => ({
    cartItems: [],  // Array to hold items and their counts
  }),
  actions: {
    addItem(itemName: string, quantity: number = 1) {
      const existingItem = this.cartItems.find((i) => i.name === itemName);

      if (existingItem) {
        existingItem.count = quantity;
      } else {
        this.cartItems.push({ name: itemName, count: quantity });
      }
    },
    updateItem(itemName: string, quantity: number) {
      const item = this.cartItems.find((i) => i.name === itemName);
      if (item) {
        item.count = quantity;
      }
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
    productCount(): number {
      return this.cartItems.length;
    },
  },
});
