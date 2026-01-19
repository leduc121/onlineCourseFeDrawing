import React, { useState, createContext, useContext } from 'react';
export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  thumbnail: string;
}
interface CartContextType {
  items: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<Course[]>([]);
  const addToCart = (course: Course) => {
    if (!items.find(item => item.id === course.id)) {
      setItems([...items, course]);
    }
  };
  const removeFromCart = (courseId: string) => {
    setItems(items.filter(item => item.id !== courseId));
  };
  const clearCart = () => {
    setItems([]);
  };
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <CartContext.Provider value={{
    items,
    addToCart,
    removeFromCart,
    clearCart,
    total,
    itemCount: items.length
  }}>
      {children}
    </CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}