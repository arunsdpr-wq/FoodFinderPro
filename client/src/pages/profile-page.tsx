import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Order } from "@shared/schema";
import { Loader2, Clock, Package, ListOrdered, User as UserIcon, Phone, MapPin, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, isLoading: authLoading, logoutMutation } = useAuth();

  const {
    data: orders,
    isLoading: ordersLoading,
    error,
  } = useQuery<Order[], Error>({
    queryKey: ["/api/my-orders"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user, // Only fetch if user is logged in
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-500";
      case "preparing":
        return "bg-yellow-500";
      case "out-for-delivery":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatOrderStatus = (status: string) => {
    return status.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  const userInitials = user.fullName 
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase() 
    : user.username.substring(0, 2).toUpperCase();

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user.fullName || user.username}</CardTitle>
            <CardDescription>Member since {format(new Date(user.createdAt), "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 opacity-70" />
                <span className="text-sm">{user.username}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 opacity-70" />
                  <span className="text-sm">{user.phoneNumber}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 opacity-70" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
              <Separator className="my-4" />
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Account</CardTitle>
            <CardDescription>View your order history and manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList className="mb-4">
                <TabsTrigger value="orders">
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Order History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    Failed to load orders. Please try again.
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Order #{order.orderNumber}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(order.createdAt), "PPp")}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} mt-2 md:mt-0`}>
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="mt-2">
                            <div className="text-sm text-muted-foreground mb-2">Items:</div>
                            {order.orderItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1">
                                <div className="flex items-center">
                                  <Package className="h-3 w-3 mr-2 text-muted-foreground" />
                                  <span>
                                    {item.name} × {item.quantity}
                                  </span>
                                </div>
                                <span className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You don't have any orders yet</p>
                    <Button className="mt-4" variant="outline">Start Ordering</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}