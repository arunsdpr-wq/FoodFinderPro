import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MinusIcon, PlusIcon, XIcon, ShoppingCartIcon } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartProps {
  onCheckout: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Cart({ onCheckout, onClose, isMobile = false }: CartProps) {
  const { 
    cart, 
    removeFromCart, 
    incrementItem, 
    decrementItem, 
    getSubtotal, 
    getTotal, 
    getTotalQuantity,
    deliveryFee
  } = useCart();

  return (
    <Card className="sticky top-24">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Your Cart</h3>
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-5 w-5" />
            </Button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="h-12 w-12 text-muted mx-auto mb-2" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="divide-y max-h-[300px] overflow-y-auto mb-4">
              {cart.items.map((item, index) => (
                <div key={index} className="py-4 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16 bg-muted rounded overflow-hidden mr-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center mt-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full p-0" 
                          onClick={() => decrementItem(index)}
                        >
                          <MinusIcon className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full p-0" 
                          onClick={() => incrementItem(index)}
                        >
                          <PlusIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-3 text-muted-foreground hover:text-destructive" 
                      onClick={() => removeFromCart(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-4">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={onCheckout} className="w-full mt-6">
              Proceed to Checkout
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
