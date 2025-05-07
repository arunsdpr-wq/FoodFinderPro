import { Restaurant } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/menu/${restaurant.value}`}>
      <a className="block">
        <Card className="h-full overflow-hidden hover:shadow-md transition">
          <div className="relative h-48">
            <img 
              src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg">{restaurant.name}</h3>
            <p className="text-neutral-500 text-sm mt-1">{restaurant.description}</p>
            <button className="mt-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 px-4 rounded-md transition w-full flex items-center justify-center">
              View Menu
            </button>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
