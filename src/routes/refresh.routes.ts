import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { prisma } from "../utils/prisma.js";
import jwt from "jsonwebtoken";
import { configuration } from "../config/config.js";

export const RefreshRoute: Router = Router();

RefreshRoute.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res.status(401).json({ message: "Access denied. Token not found" });
        return;
      }
      const user = await prisma.user.findFirst({
        where: { refreshToken: token },
      });
      if (user) {
        const payload = {
          id: user.id,
          name: user.name,
          role: user.role,
        };
        const generateAccessToken = jwt.sign(
          payload,
          configuration.jwt.secret,
          {
            expiresIn: configuration.jwt.accessExpired,
          },
        );
        const generateRefreshToken = jwt.sign(
          payload,
          configuration.jwt.secret,
          {
            expiresIn: configuration.jwt.refreshExpired,
          },
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: generateRefreshToken },
        });
        return res.status(200).json({
          message: "success",
          data: [
            {
              access_token: generateAccessToken,
              refresh_token: generateRefreshToken,
            },
          ],
        });
      } else {
        res.status(403).json({ message: "Token is invalid or expired." });
      }
    } catch (error) {
      res.status(403).json({ message: "Token is invalid or expired." });
    }
  },
);
