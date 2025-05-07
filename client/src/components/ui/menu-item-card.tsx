import { useState } from "react";
import { MenuItem } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { RiAddLine, RiCheckLine } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  menuItem: MenuItem;
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = () => {
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      imageUrl: menuItem.imageUrl
    });
    
    // Show feedback
    setIsAdded(true);
    toast({
      title: "Added to cart",
      description: `${menuItem.name} has been added to your cart.`,
      duration: 3000,
    });
    
    // Reset button after a short delay
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <Card className="menu-item bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="relative h-48">
        <img 
          src={menuItem.imageUrl || "https://placehold.co/600x400"} 
          alt={menuItem.name} 
          className="w-full h-full object-cover"
        />
        {menuItem.isPopular && (
          <span className="absolute top-2 right-2 bg-accent text-neutral-800 text-xs font-bold px-2 py-1 rounded">
            Popular
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{menuItem.name}</h3>
          <span className="font-bold">${menuItem.price.toFixed(2)}</span>
        </div>
        <p className="text-neutral-500 text-sm mb-3">{menuItem.description}</p>
        <button 
          onClick={handleAddToCart}
          className={`add-to-cart-btn font-medium py-2 px-4 rounded-md transition w-full flex items-center justify-center
            ${isAdded 
              ? "bg-green-100 text-green-700" 
              : "bg-primary/10 hover:bg-primary/20 text-primary"}`}
        >
          {isAdded 
            ? <><RiCheckLine className="mr-1" /> Added</>
            : <><RiAddLine className="mr-1" /> Add to Cart</>
          }
        </button>
      </CardContent>
    </Card>
  );
}
