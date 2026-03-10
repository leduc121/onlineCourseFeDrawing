import React, { useState, createContext, useContext, useEffect } from 'react';
import { cartApi } from '../api';
import { useAuth } from './AuthContext';
export interface Course {
  id: string; // the courseId
  cartItemId?: string; // the backend CartItem Id
  title: string;
  instructor: string;
  price: number;
  thumbnail: string;
  studentProfileId?: string;
}
interface CartContextType {
  items: Course[];
  addToCart: (course: Course) => Promise<void>;
  removeFromCart: (courseIdOrCartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
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
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const res = await cartApi.getCart();
      if (res.data?.data?.items) {
        const mapped = res.data.data.items.map((item: any) => ({
          id: item.courseId,
          cartItemId: item.id,
          title: item.courseTitle,
          instructor: item.instructorName || 'Instructor',
          price: item.coursePrice,
          thumbnail: item.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80',
        }));
        setItems(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (course: Course) => {
    if (!user) {
      alert("Please login to add to cart");
      return;
    }
    if (!items.find(item => item.id === course.id)) {
      try {
        await cartApi.addItem({
          CourseId: course.id,
          ItemType: 0, // Buy
          StudentProfileId: course.studentProfileId
        });
        await fetchCart(); // Refresh cart from server
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to add item to cart');
      }
    } else {
        alert("This course is already in your cart");
    }
  };

  const removeFromCart = async (targetId: string) => {
    if (!user) return;
    try {
      // Find the cartItemId based on either courseId or cartItemId string
      const itemToDelete = items.find(i => i.cartItemId === targetId || i.id === targetId);
      if (itemToDelete && itemToDelete.cartItemId) {
        await cartApi.removeItem(itemToDelete.cartItemId);
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await cartApi.clearCart();
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
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