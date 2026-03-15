import { type Product } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { productSchema } from "../shema/productSchema.ts";
import { prisma } from "../utils/prisma.ts";

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category } = req.query;
    const allProducts: Product[] = await prisma.product.findMany({
      where: category
        ? {
            category: {
              name: category as string,
            },
          }
        : {},
    });
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
    const { category } = req.query;
    const allProducts = await prisma.product.findMany({
      where: category
        ? {
            stock: { gt: 0 },
            category: {
              name: category as string,
            },
          }
        : { stock: { gt: 0 } },
      omit: {
        stock: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    return res.status(200).json({ data: allProducts });
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: productSchema = req.body;
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description || null,
        stock: data.stock,
        category: {
          connectOrCreate: {
            where: {
              name: data.category,
            },
            // if category is not exist create that
            create: {
              name: data.category,
            },
          },
        },
      },
    });
    return res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: productId as string },
    });
    if (!product) {
      return res.status(404).json({ message: "Product is not found" });
    }
    return res.status(200).json({ params: productId, data: product });
  } catch (error) {
    next(error);
  }
};
