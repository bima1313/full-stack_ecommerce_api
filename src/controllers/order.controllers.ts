import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import type { orderSchema } from "../shema/orderSchema.js";
import { type Order } from "@prisma/client";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { MidtransService } from "../services/midtrans.services.js";
import { OrderService } from "../services/order.services.js";

export const ordersController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user) {
      throw new AppError({ statusCode: 401, message: "Unauthorized" });
    }
    const orders: Order[] = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ message: "success", data: orders });
  },
);
export const createOrderController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const data: orderSchema = req.body;
    let token: string = "";
    if (!user) {
      throw new AppError({ statusCode: 401, message: "Unauthorized" });
    }
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const { createdOrder, shippingAddressData, itemsData } =
      await new OrderService().createOrder(user.id, data);
    const midtrans = new MidtransService({
      orderId: createdOrder.id,
      totalAmount: createdOrder.totalAmount,
      user: userData!,
      shippingAddress: shippingAddressData,
      items: itemsData,
    });
    token = await midtrans.createTransaction();
    return res
      .status(201)
      .json({ message: "Create Order Success", snapToken: token });
  },
);
