import { 
  City, InsertCity,
  Location, InsertLocation,
  Restaurant, InsertRestaurant,
  MenuItem, InsertMenuItem,
  Order, InsertOrder,
  User, InsertUser
} from "@shared/schema";
import { generateOrderId } from "../client/src/lib/utils";

// Extend interface with CRUD methods for our application
export interface IStorage {
  // User methods (from original template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // City methods
  getAllCities(): Promise<City[]>;
  getCity(id: string): Promise<City | undefined>;
  
  // Location methods
  getLocationsByCity(cityId: string): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  
  // Restaurant methods
  getRestaurantsByLocation(locationId: string): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  
  // Menu item methods
  getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<string, City>;
  private locations: Map<string, Location>;
  private restaurants: Map<string, Restaurant>;
  private menuItems: Map<string, MenuItem>;
  private orders: Map<string, Order>;
  currentUserId: number;

  constructor() {
    // Initialize storage
    this.users = new Map();
    this.cities = new Map();
    this.locations = new Map();
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    
    // Seed sample data
    this.seedSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // City methods
  async getAllCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }
  
  async getCity(id: string): Promise<City | undefined> {
    return this.cities.get(id);
  }
  
  // Location methods
  async getLocationsByCity(cityId: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.cityId === cityId
    );
  }
  
  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  // Restaurant methods
  async getRestaurantsByLocation(locationId: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => restaurant.locationId === locationId
    );
  }
  
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  // Menu item methods
  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (menuItem) => menuItem.restaurantId === restaurantId
    );
  }
  
  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = generateOrderId();
    const order: Order = { 
      ...insertOrder, 
      id,
      status: "order_received",
      estimatedDeliveryTime: "30-45 minutes",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Seed sample data
  private seedSampleData() {
    // Cities
    const cities: City[] = [
      { id: 'nyc', name: 'New York City' },
      { id: 'la', name: 'Los Angeles' },
      { id: 'chi', name: 'Chicago' },
      { id: 'mia', name: 'Miami' }
    ];
    
    cities.forEach(city => this.cities.set(city.id, city));
    
    // Locations
    const locations: Location[] = [
      { id: 'nyc-mnh', name: 'Manhattan', cityId: 'nyc' },
      { id: 'nyc-bkn', name: 'Brooklyn', cityId: 'nyc' },
      { id: 'nyc-qns', name: 'Queens', cityId: 'nyc' },
      { id: 'la-dtla', name: 'Downtown LA', cityId: 'la' },
      { id: 'la-hlwd', name: 'Hollywood', cityId: 'la' },
      { id: 'la-sma', name: 'Santa Monica', cityId: 'la' },
      { id: 'chi-loop', name: 'The Loop', cityId: 'chi' },
      { id: 'chi-lns', name: 'Lincoln Square', cityId: 'chi' },
      { id: 'mia-sb', name: 'South Beach', cityId: 'mia' },
      { id: 'mia-dt', name: 'Downtown', cityId: 'mia' }
    ];
    
    locations.forEach(location => this.locations.set(location.id, location));
    
    // Restaurants
    const restaurants: Restaurant[] = [
      { 
        id: 'r1', 
        name: 'Burger Haven', 
        locationId: 'nyc-mnh', 
        rating: '4.8',
        deliveryTime: '25-35 min',
        description: 'Premium burgers made with 100% Angus beef and fresh ingredients.',
        coverImage: 'https://images.unsplash.com/photo-1550317138-10000687a72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'
      },
      { 
        id: 'r2', 
        name: 'Pizza Paradise', 
        locationId: 'nyc-bkn', 
        rating: '4.6',
        deliveryTime: '30-40 min',
        description: 'Authentic Italian pizzas baked in a wood-fired oven.',
        coverImage: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'
      },
      { 
        id: 'r3', 
        name: 'Sushi Sensation', 
        locationId: 'la-sma', 
        rating: '4.9',
        deliveryTime: '20-30 min',
        description: 'Fresh, high-quality sushi and Japanese specialties.',
        coverImage: 'https://images.unsplash.com/photo-1617196035154-421e3b688fe2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'
      }
    ];
    
    restaurants.forEach(restaurant => this.restaurants.set(restaurant.id, restaurant));
    
    // Menu Items
    const menuItems: MenuItem[] = [
      // Burger Haven Menu
      { 
        id: 'm1', 
        restaurantId: 'r1', 
        name: 'Classic Cheeseburger', 
        description: 'Angus beef patty with American cheese, lettuce, tomato, and special sauce.', 
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      { 
        id: 'm2', 
        restaurantId: 'r1', 
        name: 'Bacon BBQ Burger', 
        description: 'Angus beef topped with crispy bacon, cheddar, and tangy BBQ sauce.', 
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      { 
        id: 'm3', 
        restaurantId: 'r1', 
        name: 'Truffle Fries', 
        description: 'Crispy fries tossed with truffle oil, parmesan, and herbs.', 
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      { 
        id: 'm4', 
        restaurantId: 'r1', 
        name: 'Chicken Sandwich', 
        description: 'Crispy or grilled chicken with avocado, lettuce, and chipotle mayo.', 
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      
      // Pizza Paradise Menu
      { 
        id: 'm5', 
        restaurantId: 'r2', 
        name: 'Margherita Pizza', 
        description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil.', 
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      { 
        id: 'm6', 
        restaurantId: 'r2', 
        name: 'Pepperoni Supreme', 
        description: 'Loaded with pepperoni, bell peppers, olives, and mushrooms.', 
        price: 17.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      
      // Sushi Sensation Menu
      { 
        id: 'm7', 
        restaurantId: 'r3', 
        name: 'California Roll', 
        description: 'Crab, avocado, and cucumber wrapped in nori and sushi rice.', 
        price: 10.99,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      { 
        id: 'm8', 
        restaurantId: 'r3', 
        name: 'Sashimi Platter', 
        description: 'Assortment of fresh raw fish slices with soy sauce and wasabi.', 
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      }
    ];
    
    menuItems.forEach(menuItem => this.menuItems.set(menuItem.id, menuItem));
  }
}

export const storage = new MemStorage();
