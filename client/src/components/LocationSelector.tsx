import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  onComplete: (cityId: string, locationId: string, restaurantId: string) => void;
}

export function LocationSelector({ onComplete }: LocationSelectorProps) {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const { toast } = useToast();

  // Fetch cities
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Fetch locations based on selected city
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/locations", selectedCity],
    enabled: !!selectedCity,
  });

  // Fetch restaurants based on selected location
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants", selectedLocation],
    enabled: !!selectedLocation,
  });

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedLocation("");
    setSelectedRestaurant("");
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setSelectedRestaurant("");
  };

  const handleRestaurantChange = (value: string) => {
    setSelectedRestaurant(value);
  };

  const handleSubmit = () => {
    if (!selectedCity) {
      toast({
        title: "Error",
        description: "Please select a city",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRestaurant) {
      toast({
        title: "Error",
        description: "Please select a restaurant",
        variant: "destructive",
      });
      return;
    }

    onComplete(selectedCity, selectedLocation, selectedRestaurant);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-6">Select Your Location</h2>
          
          <div className="mb-6">
            <Label htmlFor="city" className="block text-sm font-medium mb-2">City</Label>
            <Select value={selectedCity} onValueChange={handleCityChange} disabled={citiesLoading}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="location" className="block text-sm font-medium mb-2">Location</Label>
            <Select 
              value={selectedLocation} 
              onValueChange={handleLocationChange} 
              disabled={!selectedCity || locationsLoading}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location: any) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="restaurant" className="block text-sm font-medium mb-2">Restaurant</Label>
            <Select 
              value={selectedRestaurant} 
              onValueChange={handleRestaurantChange}
              disabled={!selectedLocation || restaurantsLoading}
            >
              <SelectTrigger id="restaurant">
                <SelectValue placeholder="Select Restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants?.map((restaurant: any) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleSubmit} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
