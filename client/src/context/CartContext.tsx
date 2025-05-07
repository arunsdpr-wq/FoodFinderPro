import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

interface CartContextType {
  cart: Cart;
  deliveryFee: number;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (index: number) => void;
  incrementItem: (index: number) => void;
  decrementItem: (index: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getTotalQuantity: () => number;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const deliveryFee = 2.99;

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(i => i.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item exists - increment quantity
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += 1;
        return { ...prevCart, items: updatedItems };
      } else {
        // New item - add to cart
        return {
          ...prevCart,
          items: [...prevCart.items, { ...item, quantity: 1 }]
        };
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter((_, i) => i !== index)
    }));
  };

  // Increment item quantity
  const incrementItem = (index: number) => {
    setCart(prevCart => {
      const updatedItems = [...prevCart.items];
      updatedItems[index].quantity += 1;
      return { ...prevCart, items: updatedItems };
    });
  };

  // Decrement item quantity
  const decrementItem = (index: number) => {
    setCart(prevCart => {
      const updatedItems = [...prevCart.items];
      if (updatedItems[index].quantity > 1) {
        updatedItems[index].quantity -= 1;
        return { ...prevCart, items: updatedItems };
      } else {
        return {
          ...prevCart,
          items: prevCart.items.filter((_, i) => i !== index)
        };
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({ items: [] });
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate tax (8%)
  const getTax = () => {
    return getSubtotal() * 0.08;
  };

  // Calculate total
  const getTotal = () => {
    return getSubtotal() + deliveryFee;
  };

  // Calculate total quantity
  const getTotalQuantity = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        deliveryFee,
        addToCart, 
        removeFromCart, 
        incrementItem, 
        decrementItem, 
        clearCart,
        getSubtotal,
        getTax,
        getTotal,
        getTotalQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
