import { ReactNode } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { RiRestaurant2Fill, RiMenu2Line, RiShoppingCart2Line } from "react-icons/ri";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center">
              <RiRestaurant2Fill className="text-primary text-3xl mr-2" />
              <h1 className="text-xl md:text-2xl brand-text brand-secondary">
                Food<span className="brand-primary">Express</span>
              </h1>
            </a>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <a className="text-neutral-500 hover:text-primary transition-colors">Home</a>
            </Link>
            <a href="#" className="text-neutral-500 hover:text-primary transition-colors">Orders</a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-colors">Profile</a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/checkout">
              <a className="relative p-2 text-neutral-500 hover:text-primary transition-colors">
                <RiShoppingCart2Line className="text-2xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
            </Link>
            <button className="md:hidden text-neutral-500 hover:text-primary transition-colors">
              <RiMenu2Line className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <RiRestaurant2Fill className="text-primary text-2xl mr-2" />
                <h2 className="text-xl font-heading font-bold">
                  Food<span className="text-primary">Express</span>
                </h2>
              </div>
              <p className="text-neutral-400 text-sm">Delicious food delivered to your doorstep.</p>
              <div className="flex space-x-3 mt-4">
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Quick Links</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/"><a className="hover:text-primary">Home</a></Link></li>
                <li><a href="#" className="hover:text-primary">Restaurants</a></li>
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Get Help</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary">Order Status</a></li>
                <li><a href="#" className="hover:text-primary">Payment Options</a></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
                <li><a href="#" className="hover:text-primary">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Download App</h3>
              <p className="text-neutral-400 text-sm mb-3">Get the FoodExpress App for faster ordering</p>
              <div className="space-y-2">
                <a href="#" className="block bg-neutral-700 hover:bg-neutral-600 rounded p-2 flex items-center">
                  <i className="ri-apple-fill text-2xl mr-2"></i>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-medium">App Store</div>
                  </div>
                </a>
                <a href="#" className="block bg-neutral-700 hover:bg-neutral-600 rounded p-2 flex items-center">
                  <i className="ri-google-play-fill text-2xl mr-2"></i>
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="font-medium">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-8 pt-6 text-center text-neutral-400 text-sm">
            <p>&copy; {new Date().getFullYear()} FoodExpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
