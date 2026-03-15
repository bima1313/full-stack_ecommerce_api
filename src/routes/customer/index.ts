import { Router } from "express";
import { routeConfigs } from "./config.ts";

const customerRoute: Router = Router();

routeConfigs.forEach((route) => {
  customerRoute.use(route.path, route.router);
});

export default customerRoute;