import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Cart } from "./Cart";
import { useState, useEffect } from "react";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import ReviewSummary from "@/components/ui/ReviewSummary";
import ReviewList from "@/components/ui/ReviewList";

interface MenuDisplayProps {
  restaurantId: string;
  onCheckout: () => void;
}

export function MenuDisplay({ restaurantId, onCheckout }: MenuDisplayProps) {
  const [showMobileCart, setShowMobileCart] = useState(false);
  const { addToCart } = useCart();
  const isMobile = useMobile();
  
  // Fetch reviews to get the count and average rating
  const { data: reviews, refetch: refetchReviews } = useQuery<any[]>({
    queryKey: [`/api/restaurants/${restaurantId}/reviews`],
  });
  
  // Fetch average rating
  const { data: averageRating = 0 } = useQuery<number>({
    queryKey: [`/api/restaurants/${restaurantId}/rating`],
  });

  // Define types for restaurant and menu items
  interface RestaurantDetails {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    locationId: number;
    value: string;
    deliveryTime?: string;
  }
  
  interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    restaurantId: number;
    category: string;
    isPopular: boolean;
  }

  // Restaurant details query
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<RestaurantDetails>({
    queryKey: [`/api/restaurants/${restaurantId}`],
  });

  // Menu items query
  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${restaurantId}/menu`],
  });

  // Close mobile cart when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowMobileCart(false);
    }
  }, [isMobile]);

  const toggleMobileCart = () => {
    setShowMobileCart(prev => !prev);
  };

  if (restaurantLoading || menuLoading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg"></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Restaurant Menu */}
        <div className="w-full lg:w-2/3">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">{restaurant?.name}</h2>
                  <p className="text-muted-foreground">{restaurant?.description}</p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{restaurant?.deliveryTime}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <ReviewSummary 
                restaurantId={restaurant?.id || 0} 
                averageRating={averageRating} 
                totalReviews={reviews?.length || 0}
                onReviewAdded={() => refetchReviews()}
              />
              
              <div className="mt-8">
                <ReviewList 
                  reviews={reviews || []} 
                  onReviewDeleted={() => refetchReviews()}
                  onReviewUpdated={() => refetchReviews()}
                />
              </div>
            </CardContent>
          </Card>

          {/* Menu Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6">Menu</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems?.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                      <Button 
                        onClick={() => {
                          // Adapt the item to match CartContext's expected format
                          const adaptedItem = {
                            id: item.id.toString(), // Convert number to string
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.imageUrl, // Map imageUrl to image
                            restaurantId: item.restaurantId.toString() // Convert number to string
                          };
                          addToCart(adaptedItem);
                        }}
                        className="w-full"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" /> Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Sidebar (visible on desktop) */}
        <div className="w-full lg:w-1/3 hidden lg:block">
          <Cart onCheckout={onCheckout} />
        </div>
      </div>

      {/* Mobile Cart Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button 
            onClick={toggleMobileCart}
            className="w-14 h-14 rounded-full shadow-lg"
            size="icon"
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Cart Sheet */}
      {isMobile && showMobileCart && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleMobileCart}></div>
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <Cart onCheckout={onCheckout} onClose={toggleMobileCart} isMobile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing import
import { ShoppingCart, Clock } from "lucide-react";
