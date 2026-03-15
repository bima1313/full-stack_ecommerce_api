import { type Request, type Response, Router } from "express";

export const HealthRouter: Router = Router();

HealthRouter.get("/", (req: Request, res: Response) => {
  res.status(200).send({ status: 200, data: 'hello world' });
});