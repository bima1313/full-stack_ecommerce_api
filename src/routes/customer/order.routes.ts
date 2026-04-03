import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { createOrderController, ordersController } from "../../controllers/order.controllers.js";
import { validate } from "../../middlewares/validate.middlewares.js";
import { orderSchema } from "../../shema/orderSchema.js";

export const OrderRoute: Router = Router();

OrderRoute.get("/", ordersController);

OrderRoute.post("/create", validate(orderSchema), createOrderController);
