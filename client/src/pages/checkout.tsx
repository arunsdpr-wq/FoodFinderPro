import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RiArrowLeftLine } from "react-icons/ri";

// Form validation schema
const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  deliveryAddress: z.string().min(5, "Address is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "cash_on_delivery"]),
  // Credit card fields (conditionally required)
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "credit_card") {
    if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid card number is required",
        path: ["cardNumber"],
      });
    }
    if (!data.expiryDate || !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid expiry date (MM/YY) is required",
        path: ["expiryDate"],
      });
    }
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid CVV is required",
        path: ["cvv"],
      });
    }
  }
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    cartItems, 
    getSubtotal, 
    getTotal, 
    getDeliveryFee, 
    clearCart,
    selectedRestaurantId 
  } = useCart();
  
  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate("/");
    return null;
  }
  
  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      zipCode: "",
      deliveryInstructions: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });
  
  // Watch payment method for conditional display
  const paymentMethod = form.watch("paymentMethod");
  
  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!selectedRestaurantId) {
      toast({
        title: "Error",
        description: "Restaurant information is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create order payload
      const orderData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        zipCode: data.zipCode,
        deliveryInstructions: data.deliveryInstructions || "",
        totalAmount: getTotal().toString(),
        paymentMethod: data.paymentMethod,
        restaurantId: selectedRestaurantId,
        orderItems: cartItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // Submit order to API
      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      
      // Clear cart and redirect to confirmation page
      clearCart();
      navigate(`/order-confirmation/${order.orderNumber}`);
      
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: "Error",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StepIndicator 
        currentStep={3} 
        steps={["Select Location", "Choose Menu", "Checkout"]} 
      />
      
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-semibold">Checkout</h2>
              <Link href={`/menu/${cartItems[0]?.id}`}>
                <a className="text-neutral-500 hover:text-primary transition-colors flex items-center">
                  <RiArrowLeftLine className="mr-1" /> Back to Menu
                </a>
              </Link>
            </div>
            
            {/* Order Summary */}
            <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
              <h3 className="font-medium text-lg mb-3">Order Summary</h3>
              <div className="space-y-2 mb-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-neutral-700">{item.quantity} × {item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-neutral-500">Delivery Fee</span>
                  <span>${getDeliveryFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Checkout Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="font-medium text-lg">Delivery Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel" 
                            className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-800">Delivery Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-800">Zip Code</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="deliveryInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-800">
                            Delivery Instructions (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="E.g., Ring doorbell, leave at door, etc." 
                              className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <hr className="my-3" />
                
                {/* Payment Method */}
                <h3 className="font-medium text-lg">Payment Method</h3>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="credit_card" id="credit_card" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300" />
                            <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-neutral-800">
                              Credit Card
                            </label>
                          </div>
                          
                          {paymentMethod === "credit_card" && (
                            <div className="pl-7 space-y-4">
                              <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-neutral-800">Card Number</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="**** **** **** ****" 
                                        className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="expiryDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-neutral-800">Expiry Date</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          placeholder="MM/YY" 
                                          className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                                        />
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
                                      <FormLabel className="text-sm font-medium text-neutral-800">CVV</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          placeholder="***" 
                                          className="rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 shadow-sm" 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300" />
                            <label htmlFor="cash_on_delivery" className="ml-3 block text-sm font-medium text-neutral-800">
                              Cash on Delivery
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white py-6 px-6 rounded-md font-medium hover:bg-primary/90 transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
