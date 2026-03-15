import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

export const ProductRouter: Router = Router();

ProductRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200);
});