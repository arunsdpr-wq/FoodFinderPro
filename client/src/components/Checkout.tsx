import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "../context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CheckoutProps {
  restaurantId: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

// Form validation schema
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  notes: z.string().optional(),
  cardNumber: z.string().min(16, "Card number is required").max(16),
  expDate: z.string().min(5, "Expiration date is required (MM/YY)"),
  cvv: z.string().min(3, "CVV is required").max(4),
  cardName: z.string().min(1, "Name on card is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function Checkout({ restaurantId, onBack, onSuccess }: CheckoutProps) {
  const { toast } = useToast();
  const { cart, getSubtotal, getTotal, deliveryFee, getTax } = useCart();

  // Restaurant details
  const { data: restaurant } = useQuery({
    queryKey: ["/api/restaurants/details", restaurantId],
  });

  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      notes: "",
      cardNumber: "",
      expDate: "",
      cvv: "",
      cardName: "",
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const response = await apiRequest("POST", "/api/orders", {
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phone: data.phone,
          notes: data.notes,
        },
        paymentInfo: {
          cardNumber: data.cardNumber,
          expDate: data.expDate,
          cvv: data.cvv,
          cardName: data.cardName,
        },
        restaurantId,
        items: cart.items,
        subtotal: getSubtotal(),
        deliveryFee,
        tax: getTax(),
        total: getTotal() + getTax(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      onSuccess(data.orderId);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Forms */}
        <div className="w-full lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Delivery Details */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-6">Delivery Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g., Ring doorbell, leave at door, etc."
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Payment Details */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-6">Payment Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="**** **** **** ****" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="expDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="button" variant="outline" onClick={onBack}>
                      Back to Menu
                    </Button>
                    <Button type="submit" disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">{restaurant?.name}</h4>
                <div className="max-h-[200px] overflow-y-auto divide-y">
                  {cart.items.map((item, index) => (
                    <div key={index} className="py-3 first:pt-0 flex justify-between">
                      <div className="flex">
                        <span>{item.quantity} × </span>
                        <span className="ml-1">{item.name}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4 pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${(getTotal() + getTax()).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
