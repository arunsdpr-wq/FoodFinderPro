import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarIcon, Clock } from "lucide-react";

interface RestaurantPreviewProps {
  restaurantId: string;
  onBack: () => void;
  onViewMenu: () => void;
}

export function RestaurantPreview({ restaurantId, onBack, onViewMenu }: RestaurantPreviewProps) {
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["/api/restaurants/details", restaurantId],
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="h-48 animate-pulse bg-muted"></Card>
      </div>
    );
  }

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-neutral-600/50"></div>
          <div 
            className="h-full w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${restaurant.coverImage})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold">{restaurant.name}</h2>
              <div className="flex items-center mt-2">
                <div className="flex items-center mr-4">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{restaurant.rating}</span>
                  <span className="ml-1 text-sm">(120+ ratings)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{restaurant.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
            <Button onClick={onViewMenu}>
              View Menu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
