import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/components/ui/order-status";
import { RiCheckLine } from "react-icons/ri";
import { Order } from "@shared/schema";

export default function OrderConfirmation() {
  const params = useParams<{ orderNumber: string }>();
  const { orderNumber } = params;
  
  // Fetch order details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['/api/orders', orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    }
  });
  
  // Calculate estimated delivery time (30-45 minutes from order time)
  const getEstimatedTime = () => {
    if (!order?.createdAt) return "35-45 minutes";
    
    const orderTime = new Date(order.createdAt);
    const minTime = new Date(orderTime.getTime() + 30 * 60000);
    const maxTime = new Date(orderTime.getTime() + 45 * 60000);
    
    return `${minTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${maxTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }
  
  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6 text-center">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <RiCheckLine className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-heading font-semibold mt-4">Order Confirmed!</h2>
            <p className="text-neutral-500 mt-2">Your order has been placed successfully</p>
            <div className="mt-3 p-2 bg-neutral-100 rounded-md inline-block">
              <span className="font-medium">Order #: </span>
              <span>{order.orderNumber}</span>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium text-lg mb-4">Delivery Status</h3>
            <OrderStatus order={order} />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg mb-6 text-left">
            <h3 className="font-medium mb-2">Delivery Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-neutral-500">Delivery Address:</p>
                <p>{order.deliveryAddress}, {order.zipCode}</p>
              </div>
              <div>
                <p className="text-neutral-500">Estimated Delivery Time:</p>
                <p>{getEstimatedTime()}</p>
              </div>
            </div>
          </div>
          
          <Button className="bg-primary text-white py-3 px-8 rounded-md font-medium hover:bg-primary/90 transition mb-3">
            Track Order
          </Button>
          <div>
            <Link href="/">
              <a className="text-primary hover:underline text-sm">Return to Home</a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
