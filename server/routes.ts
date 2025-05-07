import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Admin middleware - check if user has admin rights
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // In a real app, check if user has admin role
    // For demo, we'll consider all authenticated users as admins
    // TODO: Implement proper role-based access control
    next();
  };
  
  // API Routes - prefix with /api
  
  // Admin Routes
  
  // Get all orders for admin dashboard
  app.get("/api/admin/orders", isAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get orders for the current user
  app.get("/api/my-orders", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      storage.getOrdersByUserId(req.user.id).then(orders => {
        res.json(orders);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });
  
  // Get all cities
  app.get("/api/cities", async (req: Request, res: Response) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  
  // Get locations by city
  app.get("/api/cities/:cityValue/locations", async (req: Request, res: Response) => {
    try {
      const { cityValue } = req.params;
      const city = await storage.getCityByValue(cityValue);
      
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      
      const locations = await storage.getLocationsByCity(city.id);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  
  // Get restaurants by location
  app.get("/api/locations/:locationValue/restaurants", async (req: Request, res: Response) => {
    try {
      const { locationValue } = req.params;
      const restaurants = await storage.getRestaurantsByLocationValue(locationValue);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });
  
  // Get restaurant by value
  app.get("/api/restaurants/:restaurantValue", async (req: Request, res: Response) => {
    try {
      const { restaurantValue } = req.params;
      const restaurant = await storage.getRestaurantByValue(restaurantValue);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });
  
  // Get menu items by restaurant
  app.get("/api/restaurants/:restaurantValue/menu", async (req: Request, res: Response) => {
    try {
      const { restaurantValue } = req.params;
      const menuItems = await storage.getMenuItemsByRestaurantValue(restaurantValue);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  
  // Get menu item by id
  app.get("/api/menu-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      
      const menuItem = await storage.getMenuItemById(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });
  
  // Create a new order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Get order by order number
  app.get("/api/orders/:orderNumber", async (req: Request, res: Response) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByOrderNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Update order status
  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // REVIEW ENDPOINTS
  
  // Get reviews for a specific restaurant
  app.get("/api/restaurants/:restaurantValue/reviews", async (req: Request, res: Response) => {
    try {
      const { restaurantValue } = req.params;
      const reviews = await storage.getReviewsByRestaurantValue(restaurantValue);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching restaurant reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Get average rating for a specific restaurant
  app.get("/api/restaurants/:restaurantValue/rating", async (req: Request, res: Response) => {
    try {
      const { restaurantValue } = req.params;
      const averageRating = await storage.getAverageRatingByRestaurantValue(restaurantValue);
      res.json({ rating: averageRating });
    } catch (error) {
      console.error("Error fetching restaurant rating:", error);
      res.status(500).json({ message: "Failed to fetch rating" });
    }
  });
  
  // Get reviews by current user
  app.get("/api/my-reviews", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      storage.getReviewsByUser(req.user.id).then(reviews => {
        res.json(reviews);
      });
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });
  
  // Submit a new review for a restaurant
  app.post("/api/restaurants/:restaurantValue/reviews", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const { restaurantValue } = req.params;
      const restaurant = await storage.getRestaurantByValue(restaurantValue);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Validate review data
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        restaurantId: restaurant.id,
        userId: req.user.id
      });
      
      // Create the review
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: error.errors 
        });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  // Update an existing review
  app.patch("/api/reviews/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const existingReview = await storage.getReviewById(id);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the user is the owner of the review
      if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this review" });
      }
      
      // Update the review
      const updatedReview = await storage.updateReview(id, req.body);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });
  
  // Delete a review
  app.delete("/api/reviews/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const existingReview = await storage.getReviewById(id);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the user is the owner of the review
      if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }
      
      // Delete the review
      const success = await storage.deleteReview(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete review" });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });
  
  // Admin endpoints for reviews
  
  // Get all reviews (admin only)
  app.get("/api/admin/reviews", isAdmin, async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Approve/reject a review (admin only)
  app.patch("/api/admin/reviews/:id/approve", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isApproved } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ message: "isApproved must be a boolean" });
      }
      
      const updatedReview = await storage.updateReview(id, { isApproved });
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review approval status:", error);
      res.status(500).json({ message: "Failed to update review approval status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
