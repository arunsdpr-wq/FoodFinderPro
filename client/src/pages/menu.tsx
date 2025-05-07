import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { MenuItemCard } from "@/components/ui/menu-item-card";
import { CartItemCard } from "@/components/ui/cart-item";
import { useCart } from "@/hooks/use-cart";
import { Restaurant, MenuItem } from "@shared/schema";
import { RiArrowLeftLine } from "react-icons/ri";

export default function Menu() {
  const params = useParams<{ restaurantValue: string }>();
  const [, navigate] = useLocation();
  const { restaurantValue } = params;
  const [activeCategory, setActiveCategory] = useState("All Items");
  
  const { 
    cartItems, 
    getSubtotal, 
    getTotal, 
    getDeliveryFee,
    selectedRestaurantId,
    setSelectedRestaurantId 
  } = useCart();

  // Fetch restaurant details
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', restaurantValue],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantValue}`);
      if (!res.ok) throw new Error('Failed to fetch restaurant');
      return res.json();
    }
  });

  // Fetch menu items
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/restaurants', restaurantValue, 'menu'],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantValue}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return res.json();
    }
  });

  // Set selected restaurant ID when data is loaded
  useEffect(() => {
    if (restaurant) {
      setSelectedRestaurantId(restaurant.id);
    }
  }, [restaurant, setSelectedRestaurantId]);

  // Get all available categories
  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : [];
  
  // Filter menu items by category
  const filteredMenuItems = menuItems 
    ? activeCategory === "All Items" 
      ? menuItems 
      : menuItems.filter(item => item.category === activeCategory)
    : [];

  if (restaurantLoading || menuItemsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="text-center py-8">Restaurant not found</div>;
  }

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <>
      <StepIndicator 
        currentStep={2} 
        steps={["Select Location", "Choose Menu", "Checkout"]} 
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu Section */}
          <div className="w-full md:w-2/3">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold">{restaurant.name}</h2>
                  <Link href="/">
                    <a className="text-neutral-500 hover:text-primary transition-colors flex items-center">
                      <RiArrowLeftLine className="mr-1" /> Change
                    </a>
                  </Link>
                </div>
                
                {/* Menu Categories */}
                <div className="mb-6 overflow-x-auto pb-2">
                  <div className="flex space-x-2 min-w-max">
                    <button 
                      className={`category-btn px-4 py-2 rounded-full ${
                        activeCategory === "All Items" 
                          ? "bg-primary text-white" 
                          : "bg-neutral-100 hover:bg-neutral-200 transition"
                      }`}
                      onClick={() => setActiveCategory("All Items")}
                    >
                      All Items
                    </button>
                    
                    {categories.map(category => (
                      <button 
                        key={category}
                        className={`category-btn px-4 py-2 rounded-full ${
                          activeCategory === category 
                            ? "bg-primary text-white" 
                            : "bg-neutral-100 hover:bg-neutral-200 transition"
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMenuItems.map(menuItem => (
                    <MenuItemCard key={menuItem.id} menuItem={menuItem} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Cart Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-heading font-semibold mb-4">Your Order</h2>
              
              {/* Empty Cart State */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <i className="ri-shopping-cart-line text-neutral-300 text-5xl mb-3"></i>
                  <p className="text-neutral-500">Your cart is empty</p>
                  <p className="text-sm text-neutral-400 mt-1">Add items from the menu to get started</p>
                </div>
              ) : (
                <div>
                  <div className="divide-y divide-neutral-200">
                    {cartItems.map(item => (
                      <CartItemCard key={item.id} item={item} />
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-200 mt-4 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500">Subtotal</span>
                      <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500">Delivery Fee</span>
                      <span className="font-medium">${getDeliveryFee().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-neutral-200">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    
                    <Button 
                      onClick={handleProceedToCheckout}
                      className="mt-4 w-full bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary/90 transition"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
