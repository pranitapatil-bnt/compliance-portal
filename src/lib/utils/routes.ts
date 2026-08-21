import type { Route } from "next";

export function asRoute(path: string): Route {
  return path as Route;
}
