import { createContext, ReactNode, useEffect, useState } from "react";
import { CartItem } from "@/hooks/use-cart";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getDeliveryFee: () => number;
  selectedRestaurantId: number | null;
  setSelectedRestaurantId: (id: number | null) => void;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getSubtotal: () => 0,
  getTotal: () => 0,
  getDeliveryFee: () => 0,
  selectedRestaurantId: null,
  setSelectedRestaurantId: () => {},
});

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cart");
      }
    }
    
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId");
    if (storedRestaurantId) {
      try {
        setSelectedRestaurantId(JSON.parse(storedRestaurantId));
      } catch (error) {
        console.error("Failed to parse restaurant ID from localStorage", error);
        localStorage.removeItem("selectedRestaurantId");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save selectedRestaurantId to localStorage whenever it changes
  useEffect(() => {
    if (selectedRestaurantId !== null) {
      localStorage.setItem("selectedRestaurantId", JSON.stringify(selectedRestaurantId));
    } else {
      localStorage.removeItem("selectedRestaurantId");
    }
  }, [selectedRestaurantId]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item already exists, increment quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        // New item, add to cart
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedRestaurantId(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getDeliveryFee = () => {
    return cartItems.length > 0 ? 2.50 : 0;
  };
  
  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getTotal,
      getDeliveryFee,
      selectedRestaurantId,
      setSelectedRestaurantId
    }}>
      {children}
    </CartContext.Provider>
  );
}
