import type { Router } from "express";

export interface RouteGroup {
  path: string;
  router: Router;
  protected: boolean;
}