import { useState } from "react";
import { Stepper } from "@/components/ui/stepper";
import { LocationSelector } from "@/components/LocationSelector";
import { RestaurantPreview } from "@/components/RestaurantPreview";
import { MenuDisplay } from "@/components/MenuDisplay";
import { Checkout } from "@/components/Checkout";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { useCart } from "@/context/CartContext";
import { MapPin, Store, ShoppingBag, CreditCard } from "lucide-react";

export default function FoodOrderingApp() {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [orderId, setOrderId] = useState("");
  const { clearCart } = useCart();

  // Step completion handlers
  const handleLocationComplete = (cityId: string, locationId: string, restaurantId: string) => {
    setSelectedCity(cityId);
    setSelectedLocation(locationId);
    setSelectedRestaurant(restaurantId);
    setStep(2);
  };

  const handleViewMenu = () => {
    setStep(3);
  };

  const handleGoBack = () => {
    setStep(1);
  };

  const handleProceedToCheckout = () => {
    setStep(4);
  };

  const handleBackToMenu = () => {
    setStep(3);
  };

  const handleOrderSuccess = (newOrderId: string) => {
    setOrderId(newOrderId);
    setStep(5);
  };

  const handleOrderAgain = () => {
    clearCart();
    setStep(1);
    setSelectedCity("");
    setSelectedLocation("");
    setSelectedRestaurant("");
    setOrderId("");
  };

  // Define steps for the stepper
  const steps = [
    {
      id: "location",
      label: "Location",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: "restaurant",
      label: "Restaurant",
      icon: <Store className="h-5 w-5" />,
    },
    {
      id: "menu",
      label: "Menu",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      id: "checkout",
      label: "Checkout",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">FoodExpress</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          <div className="mb-8 md:mb-12 max-w-3xl mx-auto">
            <Stepper steps={steps} activeStep={step} />
          </div>

          {/* Step Content */}
          {step === 1 && (
            <LocationSelector onComplete={handleLocationComplete} />
          )}

          {step === 2 && (
            <RestaurantPreview 
              restaurantId={selectedRestaurant} 
              onBack={handleGoBack} 
              onViewMenu={handleViewMenu} 
            />
          )}

          {step === 3 && (
            <MenuDisplay 
              restaurantId={selectedRestaurant} 
              onCheckout={handleProceedToCheckout} 
            />
          )}

          {step === 4 && (
            <Checkout 
              restaurantId={selectedRestaurant} 
              onBack={handleBackToMenu} 
              onSuccess={handleOrderSuccess} 
            />
          )}

          {step === 5 && (
            <OrderConfirmation 
              orderId={orderId} 
              restaurantId={selectedRestaurant} 
              onOrderAgain={handleOrderAgain} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
