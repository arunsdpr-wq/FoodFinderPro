import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cities endpoint
  app.get("/api/cities", async (_req, res) => {
    try {
      const cities = await storage.getAllCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Locations by city endpoint
  app.get("/api/locations", async (req, res) => {
    try {
      const cityId = req.query.cityId as string;
      
      if (!cityId) {
        return res.status(400).json({ message: "City ID is required" });
      }
      
      const locations = await storage.getLocationsByCity(cityId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Restaurants by location endpoint
  app.get("/api/restaurants", async (req, res) => {
    try {
      const locationId = req.query.locationId as string;
      
      if (!locationId) {
        return res.status(400).json({ message: "Location ID is required" });
      }
      
      const restaurants = await storage.getRestaurantsByLocation(locationId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  // Restaurant details endpoint
  app.get("/api/restaurants/details/:id", async (req, res) => {
    try {
      const restaurantId = req.params.id;
      const restaurant = await storage.getRestaurant(restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant details" });
    }
  });

  // Menu items by restaurant endpoint
  app.get("/api/menu", async (req, res) => {
    try {
      const restaurantId = req.query.restaurantId as string;
      
      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }
      
      const menuItems = await storage.getMenuItemsByRestaurant(restaurantId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Create order endpoint
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate the request body
      const orderSchema = insertOrderSchema.extend({
        customerInfo: z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          address: z.string().min(5, "Address is required"),
          phone: z.string().min(10, "Valid phone number is required"),
          notes: z.string().optional(),
        }),
        paymentInfo: z.object({
          cardNumber: z.string().min(16, "Card number is required").max(16),
          expDate: z.string().min(5, "Expiration date is required"),
          cvv: z.string().min(3, "CVV is required").max(4),
          cardName: z.string().min(1, "Name on card is required"),
        }),
      });
      
      const validatedData = orderSchema.parse(req.body);
      
      // Create the order
      const order = await storage.createOrder({
        restaurantId: validatedData.restaurantId,
        customerInfo: validatedData.customerInfo,
        items: validatedData.items,
        subtotal: validatedData.subtotal,
        deliveryFee: validatedData.deliveryFee,
        tax: validatedData.tax,
        total: validatedData.total,
      });
      
      res.status(201).json({ 
        message: "Order created successfully", 
        orderId: order.id 
      });
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

  // Get order details endpoint
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Update order status endpoint
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const validStatuses = ["order_received", "preparing", "out_for_delivery", "delivered"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
