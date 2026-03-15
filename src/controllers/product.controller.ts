import { PrismaClient, type Product } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

export const allProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prisma = new PrismaClient();
    const allProducts: Product[] = await prisma.product.findMany();
    return res.status(200).json({ data: allProducts });
  } catch (error) {
    next(error);
  }
};

export const availableProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prisma = new PrismaClient();
    const allProducts: Product[] = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
    });
    return res.status(200).json({ data: allProducts });
  } catch (error) {
    next(error);
  }
};