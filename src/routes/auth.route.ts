import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.ts";
import { LoginSchema } from "../shema/loginSchema.ts";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.ts";
import { RegisterSchema } from "../shema/registerSchema.ts";

export const AuthRouter: Router = Router();

AuthRouter.post("/login", validate(LoginSchema), loginController);

AuthRouter.post("/register", validate(RegisterSchema), registerController);