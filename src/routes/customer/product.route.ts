import { Router } from "express";
import { availableProductsController } from "../../controllers/product.controller.ts";

export const ProductRouter: Router = Router();

ProductRouter.get("/", availableProductsController);