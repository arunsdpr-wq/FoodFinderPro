import { v4 as uuidv4 } from "uuid";
import { 
  City, InsertCity, 
  Location, InsertLocation, 
  Restaurant, InsertRestaurant, 
  MenuItem, InsertMenuItem, 
  Order, InsertOrder, OrderItem,
  User, InsertUser,
  otpVerifications, insertOtpVerificationSchema,
  Review, InsertReview
} from "@shared/schema";

import session from "express-session";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  markUserAsVerified(userId: number): Promise<User>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  
  // OTP Verification methods
  createOtp(userId: number, type: 'email' | 'phone'): Promise<string>;
  verifyOtp(userId: number, otp: string): Promise<boolean>;
  deleteExpiredOtps(): Promise<void>;
  
  // City methods
  getCities(): Promise<City[]>;
  getCityById(id: number): Promise<City | undefined>;
  getCityByValue(value: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  
  // Location methods
  getLocations(): Promise<Location[]>;
  getLocationsByCity(cityId: number): Promise<Location[]>;
  getLocationsByValue(values: string[]): Promise<Location[]>;
  getLocationById(id: number): Promise<Location | undefined>;
  getLocationByValue(value: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Restaurant methods
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantsByLocation(locationId: number): Promise<Restaurant[]>;
  getRestaurantsByLocationValue(locationValue: string): Promise<Restaurant[]>;
  getRestaurantById(id: number): Promise<Restaurant | undefined>;
  getRestaurantByValue(value: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  // MenuItem methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getMenuItemsByRestaurantValue(restaurantValue: string): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Review methods
  getReviews(): Promise<Review[]>;
  getReviewsByRestaurant(restaurantId: number): Promise<Review[]>;
  getReviewsByRestaurantValue(restaurantValue: string): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  getAverageRatingByRestaurant(restaurantId: number): Promise<number>;
  getAverageRatingByRestaurantValue(restaurantValue: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<number, City>;
  private locations: Map<number, Location>;
  private restaurants: Map<number, Restaurant>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  
  currentUserId: number;
  currentCityId: number;
  currentLocationId: number;
  currentRestaurantId: number;
  currentMenuItemId: number;
  currentOrderId: number;
  currentReviewId: number;
  private reviews: Map<number, Review>;

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.locations = new Map();
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentCityId = 1;
    this.currentLocationId = 1;
    this.currentRestaurantId = 1;
    this.currentMenuItemId = 1;
    this.currentOrderId = 1;
    this.currentReviewId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Cities
      const cityData: InsertCity[] = [
        { name: "New York", value: "new-york" },
        { name: "Los Angeles", value: "los-angeles" },
        { name: "Chicago", value: "chicago" },
        { name: "Houston", value: "houston" }
      ];
    
      // Create cities one by one
      for (const city of cityData) {
        await this.createCity(city);
      }

      // Locations
      const locationData: { data: InsertLocation, cityValue: string }[] = [
        { data: { name: "Manhattan", value: "manhattan", cityId: 0 }, cityValue: "new-york" },
        { data: { name: "Brooklyn", value: "brooklyn", cityId: 0 }, cityValue: "new-york" },
        { data: { name: "Queens", value: "queens", cityId: 0 }, cityValue: "new-york" },
        { data: { name: "Downtown LA", value: "downtown", cityId: 0 }, cityValue: "los-angeles" },
        { data: { name: "Hollywood", value: "hollywood", cityId: 0 }, cityValue: "los-angeles" },
        { data: { name: "Santa Monica", value: "santa-monica", cityId: 0 }, cityValue: "los-angeles" },
        { data: { name: "The Loop", value: "loop", cityId: 0 }, cityValue: "chicago" },
        { data: { name: "Lincoln Park", value: "lincoln-park", cityId: 0 }, cityValue: "chicago" },
        { data: { name: "Wicker Park", value: "wicker-park", cityId: 0 }, cityValue: "chicago" },
        { data: { name: "Downtown Houston", value: "downtown-houston", cityId: 0 }, cityValue: "houston" },
        { data: { name: "Midtown", value: "midtown", cityId: 0 }, cityValue: "houston" },
        { data: { name: "Rice Village", value: "rice-village", cityId: 0 }, cityValue: "houston" }
      ];

      // Create locations one by one
      for (const location of locationData) {
        const city = await this.getCityByValue(location.cityValue);
        if (city) {
          location.data.cityId = city.id;
          await this.createLocation(location.data);
        }
      }

      // Restaurants - Restaurant A, B, C for each location
      const locations = await this.getLocations();
      
      for (const location of locations) {
        // Restaurant A
        await this.createRestaurant({
          name: "Restaurant-A",
          value: `restaurant-a-${location.value}`,
          description: "Premier dining experience with a diverse menu",
          locationId: location.id,
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        });
        
        // Restaurant B
        await this.createRestaurant({
          name: "Restaurant-B",
          value: `restaurant-b-${location.value}`,
          description: "Casual dining with specialty dishes and drinks",
          locationId: location.id,
          imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        });
        
        // Restaurant C
        await this.createRestaurant({
          name: "Restaurant-C",
          value: `restaurant-c-${location.value}`,
          description: "Fast and delicious food options for everyone",
          locationId: location.id,
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        });
      }

      // Add menu items for the first location's restaurants
      const manhattanRestaurantA = await this.getRestaurantByValue("restaurant-a-manhattan");
      if (manhattanRestaurantA) {
        const menuItemsA = [
          {
            name: "Special Steak",
            description: "Premium cut steak cooked to perfection with signature seasoning.",
            price: "29.99",
            imageUrl: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantA.id,
            category: "Main Courses",
            isPopular: true
          },
          {
            name: "Seafood Platter",
            description: "Fresh assortment of seafood including shrimp, crab, and fish.",
            price: "32.50",
            imageUrl: "https://images.unsplash.com/photo-1534709867132-ea6fe01f9a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantA.id,
            category: "Main Courses",
            isPopular: true
          },
          {
            name: "Truffle Fries",
            description: "Crispy fries drizzled with truffle oil and parmesan.",
            price: "10.99",
            imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantA.id,
            category: "Appetizers",
            isPopular: false
          }
        ];

        for (const item of menuItemsA) {
          await this.createMenuItem(item);
        }
      }

      const manhattanRestaurantB = await this.getRestaurantByValue("restaurant-b-manhattan");
      if (manhattanRestaurantB) {
        const menuItemsB = [
          {
            name: "Gourmet Burger",
            description: "Premium beef patty with artisan cheese and special sauce.",
            price: "15.99",
            imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantB.id,
            category: "Main Courses",
            isPopular: true
          },
          {
            name: "Chicken Wings",
            description: "Crispy wings with choice of sauce: buffalo, BBQ, or honey garlic.",
            price: "13.50",
            imageUrl: "https://images.unsplash.com/photo-1601002277582-57933a3b2743?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantB.id,
            category: "Appetizers",
            isPopular: true
          },
          {
            name: "Craft Beer",
            description: "Selection of locally brewed craft beers.",
            price: "7.99",
            imageUrl: "https://images.unsplash.com/photo-1555658636-6e4a36218be7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantB.id,
            category: "Beverages",
            isPopular: false
          }
        ];

        for (const item of menuItemsB) {
          await this.createMenuItem(item);
        }
      }

      const manhattanRestaurantC = await this.getRestaurantByValue("restaurant-c-manhattan");
      if (manhattanRestaurantC) {
        const menuItemsC = [
          {
            name: "Quick Meal Combo",
            description: "Burger, fries and soft drink combo for a quick meal.",
            price: "9.99",
            imageUrl: "https://images.unsplash.com/photo-1610614991969-ceeb293e7ff5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantC.id,
            category: "Combos",
            isPopular: true
          },
          {
            name: "Chicken Salad",
            description: "Fresh salad with grilled chicken, avocado, and light dressing.",
            price: "8.50",
            imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantC.id,
            category: "Healthy Options",
            isPopular: true
          },
          {
            name: "Ice Cream Sundae",
            description: "Vanilla ice cream with choice of toppings and whipped cream.",
            price: "4.99",
            imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: manhattanRestaurantC.id,
            category: "Desserts",
            isPopular: false
          }
        ];

        for (const item of menuItemsC) {
          await this.createMenuItem(item);
        }
      }
      
      console.log("Data initialization completed successfully");
    } catch (error) {
      console.error("Error initializing data:", error);
    }
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
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      fullName: insertUser.fullName || null,
      phoneNumber: insertUser.phoneNumber || null,
      address: insertUser.address || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // City methods
  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }
  
  async getCityById(id: number): Promise<City | undefined> {
    return this.cities.get(id);
  }
  
  async getCityByValue(value: string): Promise<City | undefined> {
    return Array.from(this.cities.values()).find(city => city.value === value);
  }
  
  async createCity(insertCity: InsertCity): Promise<City> {
    const id = this.currentCityId++;
    const city: City = { ...insertCity, id };
    this.cities.set(id, city);
    return city;
  }
  
  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocationsByCity(cityId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => location.cityId === cityId
    );
  }
  
  async getLocationsByValue(values: string[]): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => values.includes(location.value)
    );
  }
  
  async getLocationById(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async getLocationByValue(value: string): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(
      location => location.value === value
    );
  }
  
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }
  
  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }
  
  async getRestaurantsByLocation(locationId: number): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      restaurant => restaurant.locationId === locationId
    );
  }
  
  async getRestaurantsByLocationValue(locationValue: string): Promise<Restaurant[]> {
    const location = await this.getLocationByValue(locationValue);
    if (!location) return [];
    
    return Array.from(this.restaurants.values()).filter(
      restaurant => restaurant.locationId === location.id
    );
  }
  
  async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  async getRestaurantByValue(value: string): Promise<Restaurant | undefined> {
    return Array.from(this.restaurants.values()).find(
      restaurant => restaurant.value === value
    );
  }
  
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.currentRestaurantId++;
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id,
      description: insertRestaurant.description || null,
      imageUrl: insertRestaurant.imageUrl || null
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }
  
  // MenuItem methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }
  
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      menuItem => menuItem.restaurantId === restaurantId
    );
  }
  
  async getMenuItemsByRestaurantValue(restaurantValue: string): Promise<MenuItem[]> {
    const restaurant = await this.getRestaurantByValue(restaurantValue);
    if (!restaurant) return [];
    
    return Array.from(this.menuItems.values()).filter(
      menuItem => menuItem.restaurantId === restaurant.id
    );
  }
  
  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const menuItem: MenuItem = { 
      ...insertMenuItem, 
      id,
      price: insertMenuItem.price,
      description: insertMenuItem.description || null,
      imageUrl: insertMenuItem.imageUrl || null,
      isPopular: insertMenuItem.isPopular || null
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      order => order.orderNumber === orderNumber
    );
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const orderNumber = `FE${Math.floor(10000 + Math.random() * 90000)}`;
    
    const order: Order = { 
      ...insertOrder, 
      id,
      orderNumber,
      status: "confirmed",
      createdAt: new Date(),
      totalAmount: insertOrder.totalAmount,
      deliveryInstructions: insertOrder.deliveryInstructions || null,
      userId: insertOrder.userId || null
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }
  
  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.restaurantId === restaurantId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime(); // newest first
      });
  }
  
  async getReviewsByRestaurantValue(restaurantValue: string): Promise<Review[]> {
    const restaurant = await this.getRestaurantByValue(restaurantValue);
    if (!restaurant) return [];
    
    return this.getReviewsByRestaurant(restaurant.id);
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime(); // newest first
      });
  }
  
  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: true
    };
    
    this.reviews.set(id, review);
    return review;
  }
  
  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const review = await this.getReviewById(id);
    if (!review) return undefined;
    
    const updatedReview: Review = { 
      ...review, 
      ...reviewData,
      updatedAt: new Date()
    };
    
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const exists = this.reviews.has(id);
    if (!exists) return false;
    
    this.reviews.delete(id);
    return true;
  }
  
  async getAverageRatingByRestaurant(restaurantId: number): Promise<number> {
    const reviews = await this.getReviewsByRestaurant(restaurantId);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  }
  
  async getAverageRatingByRestaurantValue(restaurantValue: string): Promise<number> {
    const restaurant = await this.getRestaurantByValue(restaurantValue);
    if (!restaurant) return 0;
    
    return this.getAverageRatingByRestaurant(restaurant.id);
  }
  
  // Methods required by interface but not fully implemented in mem storage
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }
  
  async markUserAsVerified(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, isVerified: true };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async createOtp(userId: number, type: 'email' | 'phone'): Promise<string> {
    // For simplicity, just return a fixed OTP code in memory implementation
    return "123456";
  }
  
  async verifyOtp(userId: number, otp: string): Promise<boolean> {
    // For simplicity, any OTP is valid in memory implementation
    return otp === "123456";
  }
  
  async deleteExpiredOtps(): Promise<void> {
    // No-op for memory implementation
  }
}

// Uncomment this line to use memory storage instead of database
// export const storage = new MemStorage();

// Import the DatabaseStorage class
import { DatabaseStorage } from "./database-storage";

// Create and export a DatabaseStorage instance
export const storage = new DatabaseStorage();