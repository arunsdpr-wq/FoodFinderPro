import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// City schema
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
});

export const insertCitySchema = createInsertSchema(cities).pick({
  name: true,
  value: true,
});

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// Location schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  cityId: integer("city_id").notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  value: true,
  cityId: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Restaurant schema
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull().unique(),
  description: text("description"),
  locationId: integer("location_id").notNull(),
  imageUrl: text("image_url"),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  value: true,
  description: true,
  locationId: true,
  imageUrl: true,
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// MenuItem schema
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  restaurantId: integer("restaurant_id").notNull(),
  category: text("category").notNull(),
  isPopular: boolean("is_popular").default(false),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  restaurantId: true,
  category: true,
  isPopular: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  zipCode: text("zip_code").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("confirmed"),
  paymentMethod: text("payment_method").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  orderItems: json("order_items").$type<OrderItem[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OrderItem = {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
};

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  customerPhone: true,
  deliveryAddress: true,
  zipCode: true,
  deliveryInstructions: true,
  totalAmount: true,
  paymentMethod: true,
  restaurantId: true,
  orderItems: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Users schema (keeping existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
