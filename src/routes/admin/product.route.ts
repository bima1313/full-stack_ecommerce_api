import { Router } from "express";
import { allProductController } from "../../controllers/product.controller.ts";
import { authorizeRole } from "../../middlewares/auth.middleware.ts";
import { Role } from "@prisma/client";

export const ProductRouter: Router = Router();

ProductRouter.get("/", authorizeRole([Role.ADMIN]), allProductController);