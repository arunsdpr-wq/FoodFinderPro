import { pgTable, text, serial, integer, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// City schema
export const cities = pgTable("cities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertCitySchema = createInsertSchema(cities);
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// Location schema
export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cityId: text("city_id").notNull().references(() => cities.id),
});

export const insertLocationSchema = createInsertSchema(locations);
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Restaurant schema
export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rating: text("rating").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  coverImage: text("cover_image").notNull(),
  locationId: text("location_id").notNull().references(() => locations.id),
});

export const insertRestaurantSchema = createInsertSchema(restaurants);
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// Menu item schema
export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  image: text("image").notNull(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id),
});

export const insertMenuItemSchema = createInsertSchema(menuItems);
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id),
  customerInfo: jsonb("customer_info").notNull(),
  status: text("status").notNull().default("order_received"),
  items: jsonb("items").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  deliveryFee: doublePrecision("delivery_fee").notNull(),
  tax: doublePrecision("tax").notNull(),
  total: doublePrecision("total").notNull(),
  estimatedDeliveryTime: text("estimated_delivery_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
  estimatedDeliveryTime: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Extra schemas for validation
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
