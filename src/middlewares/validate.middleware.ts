import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation Failed",
          errors: error.issues.map((err) => ({
            path: err.path,
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};