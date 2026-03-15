import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { configuration } from "../config/config.ts";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// JWT Token Verification
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access denied. Token not found" });
      return;
    }
    const decoded = jwt.verify(token, configuration.jwt.secret) as {
      userId: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token is invalid or expired." });
  }
};

// Role-Based Access Control (RBAC)
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next();
  };
};