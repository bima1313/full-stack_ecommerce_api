import { Prisma } from "@prisma/client";
import {
  mapToShippingAddress,
  mapToSnakeCase,
} from "../utils/shippingAddressMapper.js";
import { AppError } from "../utils/appError.js";
import type { ItemData } from "../interfaces/itemData.js";
import { prisma } from "../utils/prisma.js";
import type { orderSchema } from "../shema/orderSchema.js";

interface productConfig {
  price: number;
  name: string;
  id: string;
  imageUrl: string;
  stock: number;
}

export class OrderService {
  async createOrder(userId: string, data: orderSchema) {
    return await prisma.$transaction(async (tx) => {

      // Read all products
      const { productIds, products } = await this.fetchProducts(tx, data);

      // Validation products data
      this.validationProductExist(products, data);
      const { itemsData, backendTotalAmount } = this.validateAndCalculateItems(
        products,
        data,
      );
      this.validateTotalPrice(data.totalAmount, backendTotalAmount);

      // Update products data
      await this.updateData(tx, data, productIds);

      // Save order
      const newOrder = await this.saveOrder(tx, data, userId);

      return {
        createdOrder: newOrder,
        shippingAddressData: mapToShippingAddress(data),
        itemsData,
      };
    });
  }

  /// --- PRIVATE HELPER METHODS --- ///
  private async fetchProducts(tx: Prisma.TransactionClient, data: orderSchema) {
    const productIds = data.items.map((item) => item.productId);
    const products: productConfig[] = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        price: true,
        stock: true,
      },
    });
    return { productIds, products };
  }

  private validationProductExist(products: productConfig[], data: orderSchema) {
    if (products.length !== data.items.length) {
      throw new AppError({
        statusCode: 400,
        message: "Product is not found",
      });
    }
  }

  private validateAndCalculateItems(
    products: productConfig[],
    data: orderSchema,
  ) {
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );
    let backendTotalAmount: number = 0;
    const itemsData: ItemData[] = [];

    // IN-MEMORY VALIDATION: Validate total price from frontend == total price from backend
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;

      if (product.stock < item.quantity) {
        throw new AppError({
          statusCode: 400,
          message: "Stock is not enough for one or more items",
        });
      }
      if (product.price !== item.price) {
        throw new AppError({
          statusCode: 400,
          message: "Validation Failed: Item Price does not match the system",
        });
      }
      itemsData.push({
        id: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      backendTotalAmount += product.price * item.quantity;
    }
    return { itemsData, backendTotalAmount };
  }

  private validateTotalPrice(totalAmount: number, backendTotalAmount: number) {
    if (totalAmount !== backendTotalAmount) {
      throw new AppError({
        statusCode: 400,
        message: "Validation Failed: Total Price does not match the system",
      });
    }
  }

  private async updateData(
    tx: Prisma.TransactionClient,
    data: orderSchema,
    productIds: string[],
  ) {
    const updateCases = data.items.map(
      (item) =>
        Prisma.sql`WHEN id = ${item.productId} THEN stock - ${item.quantity}`,
    );

    await tx.$executeRaw`
              UPDATE "product" 
              SET "stock" = CASE 
                ${Prisma.join(updateCases, " ")} 
                ELSE "stock" 
              END 
              WHERE "id" IN (${Prisma.join(productIds)})
            `;
  }
  
  private async saveOrder(
    tx: Prisma.TransactionClient,
    data: orderSchema,
    userId: string,
  ) {
    const shippingAddressData2 = mapToSnakeCase(data);
    return await tx.order.create({
      data: {
        userId: userId,
        totalAmount: data.totalAmount,
        province: data.province,
        city: data.city,
        shippingAddress: shippingAddressData2,
        items: {
          create: data.items,
        },
      },
    });
  }
}
