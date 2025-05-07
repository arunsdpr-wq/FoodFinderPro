import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RiArrowDownSLine } from "react-icons/ri";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City, Location, Restaurant } from "@shared/schema";
import { UseFormReturn } from "react-hook-form";

interface SelectCityProps {
  form: UseFormReturn<any>;
}

export function SelectCity({ form }: SelectCityProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Fetch all cities
  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ['/api/cities'],
  });
  
  // Fetch locations based on selected city
  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/cities', selectedCity, 'locations'],
    queryFn: async () => {
      if (!selectedCity) return [];
      const res = await fetch(`/api/cities/${selectedCity}/locations`);
      if (!res.ok) throw new Error('Failed to fetch locations');
      return res.json();
    },
    enabled: !!selectedCity,
  });
  
  // Fetch restaurants based on selected location
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/locations', selectedLocation, 'restaurants'],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const res = await fetch(`/api/locations/${selectedLocation}/restaurants`);
      if (!res.ok) throw new Error('Failed to fetch restaurants');
      return res.json();
    },
    enabled: !!selectedLocation,
  });
  
  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (selectedCity !== form.getValues('city')) {
      form.setValue('location', '');
      form.setValue('restaurant', '');
      setSelectedLocation(null);
    }
  }, [selectedCity, form]);
  
  useEffect(() => {
    if (selectedLocation !== form.getValues('location')) {
      form.setValue('restaurant', '');
    }
  }, [selectedLocation, form]);
  
  // Handle city selection
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    form.setValue('city', value);
    form.setValue('location', '');
    form.setValue('restaurant', '');
    setSelectedLocation(null);
  };
  
  // Handle location selection
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    form.setValue('location', value);
    form.setValue('restaurant', '');
  };

  return (
    <>
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-neutral-800">Select City</FormLabel>
            <div className="relative">
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleCityChange(value);
                }}
                value={field.value}
                disabled={citiesLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 bg-white py-3 shadow-sm transition">
                    <SelectValue placeholder="Choose a city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.value}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                <RiArrowDownSLine />
              </div>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-neutral-800">Select Location</FormLabel>
            <div className="relative">
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleLocationChange(value);
                }}
                value={field.value}
                disabled={!selectedCity || locationsLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 bg-white py-3 shadow-sm transition">
                    <SelectValue placeholder={selectedCity ? "Select a location" : "Select a city first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.value}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                <RiArrowDownSLine />
              </div>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="restaurant"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-neutral-800">Select Restaurant</FormLabel>
            <div className="relative">
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedLocation || restaurantsLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-md border-neutral-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 bg-white py-3 shadow-sm transition">
                    <SelectValue placeholder={selectedLocation ? "Select a restaurant" : "Select a location first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {restaurants?.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.value}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                <RiArrowDownSLine />
              </div>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
