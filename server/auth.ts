import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { registerSchema, type InsertUser } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

// Configure passport local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await storage.getUserByEmail(email);
        
        // Check if user exists
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        // Return user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Register new user
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Validate user data
    const validationResult = registerSchema.safeParse(userData);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid user data",
      };
    }
    
    // Check if email already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    
    if (existingUserByEmail) {
      return {
        success: false,
        error: "Email is already in use",
      };
    }
    
    // Check if username already exists
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    
    if (existingUserByUsername) {
      return {
        success: false,
        error: "Username is already taken",
      };
    }
    
    // Hash password
    const passwordHash = await hashPassword(userData.password);
    
    // Create user
    const newUser: InsertUser = {
      username: userData.username,
      email: userData.email,
      passwordHash,
    };
    
    const user = await storage.createUser(newUser);
    
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: "Failed to create user",
    };
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
}

// Get the user ID from the request
export function getUserId(req: Request): number | null {
  if (req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}