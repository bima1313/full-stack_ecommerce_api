import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

export const ProfileRoute: Router = Router();

ProfileRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200);
});