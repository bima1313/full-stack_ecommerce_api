import { Router } from "express";
import { routeConfigs } from "./config.ts";

const adminRoute: Router = Router();

routeConfigs.forEach((route) => {
  adminRoute.use(route.path, route.router);
});

export default adminRoute;