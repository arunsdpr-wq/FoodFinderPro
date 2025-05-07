import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Filter, Download, Share2, Calendar, PieChart, BarChart4, Search, RefreshCw } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Date formatter function
const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "PPP p"); // Format: Apr 29, 2023, 5:30 PM
  } catch (error) {
    return "Invalid Date";
  }
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7days");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch all orders
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    }
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter orders based on status, date range, and search query
  const filteredOrders = orders.filter((order: any) => {
    let matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange !== "all") {
      const orderDate = parseISO(order.createdAt);
      const now = new Date();
      
      if (dateRange === "today") {
        matchesDate = format(orderDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
      } else if (dateRange === "7days") {
        matchesDate = orderDate >= subDays(now, 7);
      } else if (dateRange === "30days") {
        matchesDate = orderDate >= subDays(now, 30);
      }
    }
    
    // Search query filtering (matching order number, customer name, or phone)
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        order.orderNumber.toLowerCase().includes(query) || 
        order.customerName.toLowerCase().includes(query) || 
        order.customerPhone.toLowerCase().includes(query);
    }
    
    return matchesStatus && matchesDate && matchesSearch;
  });

  // Generate reports data
  const generateReportData = () => {
    // Placeholder for actual report generation logic
    const reportData = {
      ordersByStatus: [
        { status: "pending", count: orders.filter((o: any) => o.status === "pending").length },
        { status: "preparing", count: orders.filter((o: any) => o.status === "preparing").length },
        { status: "on-the-way", count: orders.filter((o: any) => o.status === "on-the-way").length },
        { status: "delivered", count: orders.filter((o: any) => o.status === "delivered").length },
        { status: "cancelled", count: orders.filter((o: any) => o.status === "cancelled").length },
      ],
      totalSales: orders.reduce((total: number, order: any) => total + parseFloat(order.totalAmount), 0).toFixed(2),
      totalOrders: orders.length,
      completedOrders: orders.filter((o: any) => o.status === "delivered").length,
    };
    
    return reportData;
  };

  // Share report function (to be expanded based on specific third-party platforms)
  const shareReport = (platform: string) => {
    // Generate report data
    const reportData = generateReportData();
    
    // In a real application, this would connect to third-party APIs
    toast({
      title: "Report Shared",
      description: `Report has been shared via ${platform}. This is a placeholder for actual integration.`,
    });
  };

  // Download report as CSV
  const downloadReport = () => {
    const reportData = generateReportData();
    
    // Create CSV content for orders
    let csvContent = "Order Number,Customer Name,Date,Total Amount,Status\n";
    orders.forEach((order: any) => {
      csvContent += `${order.orderNumber},${order.customerName},${formatDate(order.createdAt)},${order.totalAmount},${order.status}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `order_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Downloaded",
      description: "Order report has been downloaded as CSV",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        {/* Order Management Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Orders</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchOrders()}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                View and manage all customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Order #, customer name, phone"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="on-the-way">On The Way</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="date-filter" className="w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Orders Table */}
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of all orders in the system</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              order.status === "preparing" ? "bg-blue-100 text-blue-800" :
                              order.status === "on-the-way" ? "bg-purple-100 text-purple-800" :
                              order.status === "delivered" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select 
                              defaultValue={order.status}
                              onValueChange={(value) => 
                                updateOrderStatus.mutate({ orderId: order.id, status: value })
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="on-the-way">On The Way</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Reports Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Reports Overview</CardTitle>
                <CardDescription>
                  View and analyze order statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                        <div className="text-2xl font-bold">{orders.length}</div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Completed Orders</div>
                        <div className="text-2xl font-bold">
                          {orders.filter((o: any) => o.status === "delivered").length}
                        </div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Sales</div>
                        <div className="text-2xl font-bold">
                          ${orders.reduce((total: number, order: any) => 
                            total + parseFloat(order.totalAmount), 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Avg. Order Value</div>
                        <div className="text-2xl font-bold">
                          ${orders.length ? (orders.reduce((total: number, order: any) => 
                            total + parseFloat(order.totalAmount), 0) / orders.length).toFixed(2) : "0.00"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Orders by Status</h3>
                      <div className="space-y-2">
                        {["pending", "preparing", "on-the-way", "delivered", "cancelled"].map((status) => {
                          const count = orders.filter((o: any) => o.status === status).length;
                          const percentage = orders.length ? Math.round((count / orders.length) * 100) : 0;
                          
                          return (
                            <div key={status} className="flex items-center">
                              <div className="w-32 text-sm capitalize">{status}</div>
                              <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden mr-2">
                                <div 
                                  className={`h-full ${
                                    status === "pending" ? "bg-yellow-500" :
                                    status === "preparing" ? "bg-blue-500" :
                                    status === "on-the-way" ? "bg-purple-500" :
                                    status === "delivered" ? "bg-green-500" :
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="text-sm w-16 text-right">
                                {count} ({percentage}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Export & Share Card */}
            <Card>
              <CardHeader>
                <CardTitle>Export & Share</CardTitle>
                <CardDescription>
                  Download reports or share with third-party platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Download Reports</h3>
                  <Button 
                    onClick={downloadReport} 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV Report
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Share Reports</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => shareReport("Email")}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => shareReport("Slack")}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                      </svg>
                      Slack
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => shareReport("Google Drive")}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.34 15.857l-2.52 4.36h9.803l2.519-4.36H8.34zm-3.154 0L0 24h5.187l2.52-4.36-2.52-3.783zm8.341-8.41L8.006 0 5.486 4.361l5.52 7.466 2.52-4.36zm2.45 4.36l2.519-4.361L13.008 0h-5l8.969 11.826z"/>
                      </svg>
                      Google Drive
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => shareReport("PDF")}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      PDF Report
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Schedule Reports</h3>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Set up automated report delivery to your email or preferred platform.
                    </p>
                    <Button variant="outline" className="w-full">
                      Configure Scheduled Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}