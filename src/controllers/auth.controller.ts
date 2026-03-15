import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { LoginSchema } from "../shema/loginSchema.ts";
import type { RegisterSchema } from "../shema/registerSchema.ts";
import { comparePassword, hashPassword } from "../utils/bcryptPass.ts";
import { prisma } from "../utils/prisma.ts";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
    const data: LoginSchema = req.body;
    const user = await prisma.user.findFirst({ where: { email: data.email } });
    if (!user) {
      return res.status(401).send({ message: "Email and Password was wrong" });
    } else {
      if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
        const remainingTime = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000,
        );        
        return res.status(403).json({
          message: `Please try again in ${remainingTime} minutes.`,
        });
      }

      const isPasswordValid = await comparePassword(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        const newAttempts = user.loginAttempts + 1;
        let lockUntil = null;

        if (newAttempts >= MAX_ATTEMPTS) {
          lockUntil = new Date(Date.now() + LOCK_TIME);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockUntil: lockUntil,
          },
        });
        return res
          .status(401)
          .send({ message: "Email and Password was wrong" });
      }
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
        data: {
          refreshToken: generateAccessToken,
          loginAttempts: 0,
          lockUntil: null,
        },
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
