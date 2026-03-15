import { Prisma, type Product } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { productSchema } from "../shema/productSchema.ts";
import { prisma } from "../utils/prisma.ts";
import { uploadImage } from "../utils/uploadImage.ts";
import { supabase } from "../utils/supabase.ts";

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
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Product image must be upload" });
    }
    const publicUrl: string = await uploadImage(file);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: Number(data.price),
        description: data.description || null,
        stock: Number(data.stock),
        imageUrl: publicUrl,
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
    return res
      .status(200)
      .json({ message: "Create product success", data: product });
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
    const product = await prisma.product.findUnique({
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

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const data: productSchema = req.body;
    const file = req.file;
    const updatePayload: Prisma.ProductUpdateInput = {
      name: data.name,
      price: Number(data.price),
      description: data.description || null,
      stock: Number(data.stock),
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
    };
    if (file) {
      updatePayload.imageUrl = await uploadImage(file);
    }

    const product = await prisma.product.update({
      where: { id: productId as string },
      data: updatePayload,
    });
    return res
      .status(200)
      .json({ message: "Update product success", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: productId as string },
    });
    if (!product) {
      return res.status(404).json({ message: "Product is not found" });
    }
    await prisma.product.delete({ where: { id: product.id } });

    const fileName = product.imageUrl.split("/").pop();
    await supabase.storage
      .from("product-images")
      .remove([`products/${fileName}`]);

    return res.status(200).json({ message: "Delete product success" });
  } catch (error) {
    next(error);
  }
};
