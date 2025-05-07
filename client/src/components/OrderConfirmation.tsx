import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, Bike, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderConfirmationProps {
  orderId: string;
  restaurantId: string;
  onOrderAgain: () => void;
}

export function OrderConfirmation({ orderId, restaurantId, onOrderAgain }: OrderConfirmationProps) {
  // Get order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
  });

  // Get restaurant details
  const { data: restaurant } = useQuery({
    queryKey: ["/api/restaurants/details", restaurantId],
  });

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg"></div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  // Map status to step number
  const statusToStep = {
    "order_received": 0,
    "preparing": 1,
    "out_for_delivery": 2,
    "delivered": 3,
  };
  
  const currentStep = statusToStep[order.status] || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground">Your order has been placed successfully.</p>
            <p className="font-medium mt-2">Order #{orderId}</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Delivery Status</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
              
              {/* Order Received */}
              <StatusItem 
                icon={<ShoppingBag className="h-5 w-5" />}
                title="Order Received"
                description="Your order has been received by the restaurant."
                status={currentStep >= 0 ? "complete" : "pending"}
              />
              
              {/* Preparing */}
              <StatusItem 
                icon={<Utensils className="h-5 w-5" />}
                title="Preparing Your Food"
                description="The restaurant is preparing your order."
                status={currentStep === 1 ? "current" : currentStep > 1 ? "complete" : "pending"}
              />
              
              {/* Out for Delivery */}
              <StatusItem 
                icon={<Bike className="h-5 w-5" />}
                title="Out for Delivery"
                description="Your order is on the way."
                status={currentStep === 2 ? "current" : currentStep > 2 ? "complete" : "pending"}
              />
              
              {/* Delivered */}
              <StatusItem 
                icon={<Home className="h-5 w-5" />}
                title="Delivered"
                description="Your order has been delivered."
                status={currentStep === 3 ? "current" : "pending"}
              />
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="mb-2"><span className="font-medium">Restaurant:</span> <span>{restaurant?.name}</span></p>
              <p className="mb-2"><span className="font-medium">Estimated Delivery:</span> <span>{order.estimatedDeliveryTime}</span></p>
              <p><span className="font-medium">Delivery Address:</span> <span>{order.customerInfo.address}</span></p>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <Button onClick={onOrderAgain} className="w-full">
              Order Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Status item component
interface StatusItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "pending" | "current" | "complete";
}

function StatusItem({ icon, title, description, status }: StatusItemProps) {
  return (
    <div className="relative flex items-start mb-6">
      <div 
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10",
          status === "complete" && "bg-primary text-primary-foreground",
          status === "current" && "bg-amber-500 text-white",
          status === "pending" && "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="ml-4">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Add missing imports
import { Utensils } from "lucide-react";
