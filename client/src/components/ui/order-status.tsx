import { Order } from "@shared/schema";
import { format } from "date-fns";

interface OrderStatusProps {
  order: Order;
}

export function OrderStatus({ order }: OrderStatusProps) {
  const orderTime = new Date(order.createdAt || Date.now());
  const preparingTime = new Date(orderTime.getTime() + 5 * 60000); // 5 mins after order
  
  const getStatusClass = (status: string, orderStatus: string) => {
    if (orderStatus === "delivered" || 
        (orderStatus === "out_for_delivery" && status === "preparing") || 
        (orderStatus === "preparing" && status === "confirmed")) {
      return "bg-primary text-white";
    }
    return orderStatus === status ? "bg-primary text-white" : "bg-neutral-300 text-neutral-500";
  };
  
  const getStatusTime = (status: string) => {
    if (status === "confirmed") {
      return format(orderTime, "hh:mm a");
    } else if (status === "preparing" && order.status !== "confirmed") {
      return format(preparingTime, "hh:mm a");
    } else if (order.status === status) {
      return format(new Date(), "hh:mm a");
    }
    return "--:-- --";
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`status-circle h-10 w-10 rounded-full flex items-center justify-center ${getStatusClass("confirmed", order.status)}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="ml-2 font-medium">Order Confirmed</span>
          </div>
          <span className="text-sm text-neutral-500">{getStatusTime("confirmed")}</span>
        </div>
        
        <div className={`border-l-2 h-10 ml-5 ${order.status !== "confirmed" ? "border-primary" : "border-neutral-300"}`}></div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`status-circle h-10 w-10 rounded-full flex items-center justify-center ${getStatusClass("preparing", order.status)}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 11H15.01M12 18L7 13L12 8L17 13L12 18ZM3 18H21M3 21H21M3 6H15.5M3 9H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={`ml-2 ${order.status === "confirmed" ? "text-neutral-500" : "font-medium"}`}>Preparing</span>
          </div>
          <span className="text-sm text-neutral-500">{getStatusTime("preparing")}</span>
        </div>
        
        <div className={`border-l-2 h-10 ml-5 ${order.status === "out_for_delivery" || order.status === "delivered" ? "border-primary" : "border-neutral-300"}`}></div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`status-circle h-10 w-10 rounded-full flex items-center justify-center ${getStatusClass("out_for_delivery", order.status)}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4H18V8M18 8L14 12L18 8ZM18 8L22 12M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={`ml-2 ${order.status === "out_for_delivery" || order.status === "delivered" ? "font-medium" : "text-neutral-500"}`}>Out for Delivery</span>
          </div>
          <span className="text-sm text-neutral-500">{getStatusTime("out_for_delivery")}</span>
        </div>
        
        <div className={`border-l-2 h-10 ml-5 ${order.status === "delivered" ? "border-primary" : "border-neutral-300"}`}></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`status-circle h-10 w-10 rounded-full flex items-center justify-center ${getStatusClass("delivered", order.status)}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 10H20C21.1046 10 22 10.8954 22 12V17C22 18.1046 21.1046 19 20 19H19M19 10V19M19 10L15.7239 6.54397C14.7923 5.56704 13.4768 5 12.1051 5H5C3.34315 5 2 6.34315 2 8V16C2 17.6569 3.34315 19 5 19H19M8 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={`ml-2 ${order.status === "delivered" ? "font-medium" : "text-neutral-500"}`}>Delivered</span>
          </div>
          <span className="text-sm text-neutral-500">{getStatusTime("delivered")}</span>
        </div>
      </div>
    </div>
  );
}
