import { eq, like } from "drizzle-orm";
import { db } from "./db";
import {
  City, InsertCity,
  Location, InsertLocation,
  Restaurant, InsertRestaurant,
  MenuItem, InsertMenuItem,
  Order, InsertOrder, OrderItem,
  User, InsertUser,
  cities, locations, restaurants, menuItems, orders, users
} from "@shared/schema";
import { IStorage } from "./storage";
import { v4 as uuidv4 } from "uuid";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // City methods
  async getCities(): Promise<City[]> {
    return db.select().from(cities);
  }
  
  async getCityById(id: number): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }
  
  async getCityByValue(value: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.value, value));
    return city;
  }
  
  async createCity(insertCity: InsertCity): Promise<City> {
    const [city] = await db.insert(cities).values([insertCity]).returning();
    return city;
  }
  
  // Location methods
  async getLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }
  
  async getLocationsByCity(cityId: number): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.cityId, cityId));
  }
  
  async getLocationsByValue(values: string[]): Promise<Location[]> {
    // Using OR conditions for each value
    const locationResults = await Promise.all(
      values.map(value => 
        db.select().from(locations).where(eq(locations.value, value))
      )
    );
    // Flatten the results
    return locationResults.flat();
  }
  
  async getLocationById(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }
  
  async getLocationByValue(value: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.value, value));
    return location;
  }
  
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values([insertLocation]).returning();
    return location;
  }
  
  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return db.select().from(restaurants);
  }
  
  async getRestaurantsByLocation(locationId: number): Promise<Restaurant[]> {
    return db.select().from(restaurants).where(eq(restaurants.locationId, locationId));
  }
  
  async getRestaurantsByLocationValue(locationValue: string): Promise<Restaurant[]> {
    const location = await this.getLocationByValue(locationValue);
    if (!location) return [];
    
    return this.getRestaurantsByLocation(location.id);
  }
  
  async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }
  
  async getRestaurantByValue(value: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.value, value));
    return restaurant;
  }
  
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db.insert(restaurants).values([insertRestaurant]).returning();
    return restaurant;
  }
  
  // MenuItem methods
  async getMenuItems(): Promise<MenuItem[]> {
    return db.select().from(menuItems);
  }
  
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }
  
  async getMenuItemsByRestaurantValue(restaurantValue: string): Promise<MenuItem[]> {
    const restaurant = await this.getRestaurantByValue(restaurantValue);
    if (!restaurant) return [];
    
    return this.getMenuItemsByRestaurant(restaurant.id);
  }
  
  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }
  
  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db.insert(menuItems).values([insertMenuItem]).returning();
    return menuItem;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // Generate a random order number
    const orderWithNumber = {
      ...insertOrder,
      orderNumber: `FE${Math.floor(10000 + Math.random() * 90000)}`,
      status: "confirmed",
      createdAt: new Date()
    };
    
    // Insert the order into the database
    const [order] = await db.insert(orders).values([orderWithNumber]).returning();
    
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }

  async initializeData() {
    try {
      // Check if data already exists
      const citiesCount = await db.select({ count: cities.id }).from(cities);
      if (citiesCount.length > 0 && citiesCount[0].count > 0) {
        console.log("Data already initialized, skipping...");
        return;
      }

      // Cities
      const cityData: InsertCity[] = [
        { name: "New York", value: "new-york" },
        { name: "Los Angeles", value: "los-angeles" },
        { name: "Chicago", value: "chicago" },
        { name: "Houston", value: "houston" }
      ];
    
      // Create cities one by one
      const createdCities = [];
      for (const city of cityData) {
        createdCities.push(await this.createCity(city));
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

      // Create locations
      const createdLocations = [];
      for (const location of locationData) {
        const city = await this.getCityByValue(location.cityValue);
        if (city) {
          location.data.cityId = city.id;
          createdLocations.push(await this.createLocation(location.data));
        }
      }

      // Add restaurants for each location
      for (const location of createdLocations) {
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

      // Add menu items for first restaurant (Manhattan's Restaurant-A)
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

      // Restaurant B in Manhattan
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

      // Restaurant C in Manhattan
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
      
      console.log("Database initialization completed successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}