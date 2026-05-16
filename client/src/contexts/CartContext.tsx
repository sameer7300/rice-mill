import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  variety: string;
  grade: string;
  pricePerKg: number;
  quantityKg: number;
  minOrderKg: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalKg: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i => i.productId === item.productId
          ? { ...i, quantityKg: i.quantityKg + item.quantityKg }
          : i);
      }
      return [...prev, item];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setItems(prev => qty <= 0
      ? prev.filter(i => i.productId !== productId)
      : prev.map(i => i.productId === productId ? { ...i, quantityKg: qty } : i)
    );
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId));
  const clearCart = () => setItems([]);

  const totalKg = items.reduce((s, i) => s + i.quantityKg, 0);
  const subtotal = items.reduce((s, i) => s + i.quantityKg * i.pricePerKg, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totalItems: items.length, totalKg, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
