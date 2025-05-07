import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({ 
    pool,
    createTableIfMissing: true
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "food-ordering-app-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Validate that either email or phone is provided
      if (!req.body.email && !req.body.phoneNumber) {
        return res.status(400).json({ error: "Either email or phone number is required" });
      }

      // Check if email already exists (if provided)
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Check if phone already exists (if provided)
      if (req.body.phoneNumber) {
        const existingPhone = await storage.getUserByPhone(req.body.phoneNumber);
        if (existingPhone) {
          return res.status(400).json({ error: "Phone number already in use" });
        }
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user with hashed password (not verified yet)
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Generate OTP for verification
      const verificationType = req.body.email ? 'email' : 'phone';
      const otp = await storage.createOtp(user.id, verificationType);

      // In a production app, we would send the OTP via email or SMS here
      console.log(`OTP for user ${user.id}: ${otp}`);

      // Log in the user, although they're not verified yet
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        // Include the OTP in the response for testing purposes (in production, we'd send it via email/SMS)
        res.status(201).json({ 
          ...userWithoutPassword, 
          tempOtp: otp, // Only for demo purposes, remove in production
          needsVerification: true 
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // OTP verification endpoint
  app.post("/api/verify-otp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { otp } = req.body;
      
      if (!otp) {
        return res.status(400).json({ error: "OTP is required" });
      }
      
      const userId = req.user!.id;
      const isValid = await storage.verifyOtp(userId, otp);
      
      if (isValid) {
        // Get the updated user data after verification
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Update the session with the verified user
        const { password, ...userWithoutPassword } = user;
        
        return res.status(200).json({ 
          ...userWithoutPassword,
          verified: true
        });
      } else {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Resend OTP endpoint
  app.post("/api/resend-otp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user!;
      
      if (user.isVerified) {
        return res.status(400).json({ error: "User is already verified" });
      }
      
      const verificationType = user.email ? 'email' : 'phone';
      const otp = await storage.createOtp(user.id, verificationType);
      
      // In a production app, we would send the OTP via email or SMS here
      console.log(`New OTP for user ${user.id}: ${otp}`);
      
      res.status(200).json({
        message: "OTP sent successfully",
        tempOtp: otp // Only for demo purposes, remove in production
      });
    } catch (error) {
      next(error);
    }
  });

  // Get order history for the authenticated user
  app.get("/api/my-orders", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const orders = await storage.getOrdersByUserId(req.user!.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
}