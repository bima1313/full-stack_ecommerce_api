import { PrismaClient } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { LoginSchema } from "../shema/loginSchema.ts";
import type { RegisterSchema } from "../shema/registerSchema.ts";
import { hashPassword } from "../utils/bcryptPass.ts";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prisma = new PrismaClient();
    const data: LoginSchema = req.body;
    const user = await prisma.user.findFirst({ where: { email: data.email } });
    if (!user) {
      res.status(401).send({ message: "Email and Password was wrong" });
    } else {
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      };
      const generateAccessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
          expiresIn: "15m",
        },
      );
      const generateRefreshToken = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
          expiresIn: "7d",
        },
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: generateAccessToken },
      });
      return res.status(200).json({
        data: [
          {
            message: "success",
            access_token: generateAccessToken,
            refresh_token: generateRefreshToken,
          },
        ],
      });
    }
  } catch (error) {
    next(error);
  }
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prisma = new PrismaClient();
    const data: RegisterSchema = req.body;
    const email: string = data.email;
    const name: string = data.name;
    const password = await hashPassword(data.password);
    await prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
    return res.status(201).json({
      data: [
        {
          message: "success",
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};