import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { LoginSchema } from "../shema/loginSchema.js";
import type { RegisterSchema } from "../shema/registerSchema.js";
import { comparePassword, hashPassword } from "../utils/bcryptPass.js";
import { prisma } from "../utils/prisma.js";
import { configuration } from "../config/config.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const loginController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: LoginSchema = req.body;
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError({
        statusCode: 401,
        message: "Email and Password was wrong",
      });
    } else {
      if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
        const remainingTime = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000,
        );
        throw new AppError({
          statusCode: 403,
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

        if (newAttempts >= configuration.maxAttempts) {
          lockUntil = new Date(Date.now() + configuration.lockTime);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockUntil: lockUntil,
          },
        });
        throw new AppError({
          statusCode: 401,
          message: "Email and Password was wrong",
        });
      }
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      };
      const generateAccessToken = jwt.sign(payload, configuration.jwt.secret, {
        expiresIn: configuration.jwt.accessExpired,
      });
      const generateRefreshToken = jwt.sign(payload, configuration.jwt.secret, {
        expiresIn: configuration.jwt.refreshExpired,
      });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: generateRefreshToken,
          loginAttempts: 0,
          lockUntil: null,
        },
      });
      return res.status(200).json({
        message: "success",
        data: {
          access_token: generateAccessToken,
          refresh_token: generateRefreshToken,
        },
      });
    }
  },
);

export const registerController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
      message: "Register success",
    });
  },
);
