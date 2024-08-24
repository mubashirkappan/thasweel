import { defineStore } from 'pinia';

interface CartItem {
  name: string;
  count: number;
  price: number;
}

export const useCartStore = defineStore('cartStore', {
  persist: {
    storage: persistedState.localStorage,
  },
  state: (): { cartItems: CartItem[] } => ({
    cartItems: [],
  }),
  actions: {
    addItem(itemName: string, quantity: number = 1, price: number) {
      const existingItem = this.cartItems.find((i) => i.name === itemName);

      if (existingItem) {
        existingItem.count = Number(quantity);
        existingItem.price = Number(price);
      } else {
        this.cartItems.push({ name: itemName, count: Number(quantity), price: Number(price) });
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
        pricePerItem: Math.round(Number(item.price)),  // Ensure pricePerItem is an integer
        quantity: item.count,
        totalPrice: Math.round(Number(item.price)) * item.count,  // Calculate totalPrice using the integer pricePerItem
      }));
    },
    totalAmount(): number {
      return this.cartItems.reduce((total, item) => total + item.count * Math.round(Number(item.price)), 0);
    },
    productCount(): number {
      return this.cartItems.length;
    },
  },
});
