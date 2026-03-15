import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

export const OrderRoute: Router = Router();

OrderRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200);
});