import type { RouteGroup } from "../interface/RouteGroup.ts";
import { OrderRoute } from "./order.route.ts";
import { ProductRouter } from "./product.route.ts";
import { ProfileRoute } from "./profile.route.ts";

export const routeConfigs: RouteGroup[] = [
  { path: "/products", router: ProductRouter, protected: true },
  { path: "/orders", router: OrderRoute, protected: true },
  { path: "/profile", router: ProfileRoute, protected: true },
];