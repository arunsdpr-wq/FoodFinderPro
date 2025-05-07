import { v4 as uuidv4 } from "uuid";
import { 
  City, InsertCity, 
  Location, InsertLocation, 
  Restaurant, InsertRestaurant, 
  MenuItem, InsertMenuItem, 
  Order, InsertOrder, OrderItem,
  User, InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.locations = new Map();
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    
    this.currentUserId = 1;
    this.currentCityId = 1;
    this.currentLocationId = 1;
    this.currentRestaurantId = 1;
    this.currentMenuItemId = 1;
    this.currentOrderId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Cities
    const cityData: InsertCity[] = [
      { name: "New York", value: "new-york" },
      { name: "Los Angeles", value: "los-angeles" },
      { name: "Chicago", value: "chicago" },
      { name: "Houston", value: "houston" }
    ];
    
    cityData.forEach(city => this.createCity(city));

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
    
    locationData.forEach(async location => {
      const city = await this.getCityByValue(location.cityValue);
      if (city) {
        location.data.cityId = city.id;
        await this.createLocation(location.data);
      }
    });

    // Restaurants
    const restaurantData: { data: InsertRestaurant, locationValue: string }[] = [
      { 
        data: { 
          name: "Italian Bistro", 
          value: "italian-bistro", 
          description: "Authentic Italian cuisine in a cozy atmosphere",
          locationId: 0,
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
        }, 
        locationValue: "manhattan" 
      },
      { 
        data: { 
          name: "Sushi Palace", 
          value: "sushi-palace", 
          description: "Fresh sushi and Japanese specialties",
          locationId: 0,
          imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
        }, 
        locationValue: "manhattan" 
      },
      { 
        data: { 
          name: "Burger Joint", 
          value: "burger-joint", 
          description: "Juicy burgers and hand-cut fries",
          locationId: 0,
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
        }, 
        locationValue: "manhattan" 
      },
      { 
        data: { 
          name: "Brooklyn Pizza Place", 
          value: "pizza-place", 
          description: "New York style pizza by the slice",
          locationId: 0,
          imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
        }, 
        locationValue: "brooklyn" 
      }
    ];
    
    restaurantData.forEach(async restaurant => {
      const location = await this.getLocationByValue(restaurant.locationValue);
      if (location) {
        restaurant.data.locationId = location.id;
        await this.createRestaurant(restaurant.data);
      }
    });

    // Menu Items for Italian Bistro
    setTimeout(async () => {
      const restaurant = await this.getRestaurantByValue("italian-bistro");
      if (restaurant) {
        const menuItems: InsertMenuItem[] = [
          {
            name: "Margherita Pizza",
            description: "Classic pizza with tomatoes, mozzarella, and fresh basil.",
            price: "12.99",
            imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Main Courses",
            isPopular: true
          },
          {
            name: "Pasta Carbonara",
            description: "Creamy pasta with crispy bacon, egg, and parmesan cheese.",
            price: "14.50",
            imageUrl: "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Main Courses",
            isPopular: false
          },
          {
            name: "Caesar Salad",
            description: "Fresh romaine lettuce with croutons, parmesan, and Caesar dressing.",
            price: "9.99",
            imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Appetizers",
            isPopular: false
          },
          {
            name: "Chocolate Lava Cake",
            description: "Warm chocolate cake with a molten center, served with vanilla ice cream.",
            price: "7.99",
            imageUrl: "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Desserts",
            isPopular: false
          },
          {
            name: "Grilled Salmon",
            description: "Fresh salmon fillet grilled to perfection with seasonal vegetables.",
            price: "18.50",
            imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Main Courses",
            isPopular: false
          },
          {
            name: "Fruit Smoothie",
            description: "Refreshing blend of seasonal fruits with yogurt and honey.",
            price: "5.99",
            imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
            restaurantId: restaurant.id,
            category: "Beverages",
            isPopular: false
          }
        ];

        menuItems.forEach(item => this.createMenuItem(item));
      }
    }, 100);
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
    const restaurant: Restaurant = { ...insertRestaurant, id };
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
      price: typeof insertMenuItem.price === 'string' 
        ? parseFloat(insertMenuItem.price) 
        : insertMenuItem.price
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
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const orderNumber = `FE${Math.floor(10000 + Math.random() * 90000)}`;
    
    const order: Order = { 
      ...insertOrder, 
      id,
      orderNumber,
      status: "confirmed",
      createdAt: new Date(),
      totalAmount: typeof insertOrder.totalAmount === 'string' 
        ? parseFloat(insertOrder.totalAmount) 
        : insertOrder.totalAmount
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
}

export const storage = new MemStorage();
