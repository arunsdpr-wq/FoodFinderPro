import { useState } from "react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { RiAddLine, RiSubtractLine, RiDeleteBinLine } from "react-icons/ri";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(item.id);
  };
  
  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <div className="cart-item py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-20 h-20 rounded-md overflow-hidden mr-3 flex-shrink-0">
          <img src={item.imageUrl || "https://placehold.co/200x200"} alt={item.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-neutral-500 text-sm">${item.price.toFixed(2)}</p>
          <div className="flex items-center mt-1">
            <button 
              onClick={handleDecrement}
              className="decrement-btn h-7 w-7 border border-neutral-300 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
            >
              <RiSubtractLine />
            </button>
            <span className="mx-2 w-6 text-center item-quantity">{item.quantity}</span>
            <button 
              onClick={handleIncrement}
              className="increment-btn h-7 w-7 border border-neutral-300 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
            >
              <RiAddLine />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-bold mr-3 item-total">${itemTotal}</span>
        <button 
          onClick={handleRemove}
          className="remove-item text-neutral-400 hover:text-red-500"
        >
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  );
}
