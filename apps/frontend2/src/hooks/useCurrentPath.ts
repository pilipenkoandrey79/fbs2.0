import { matchRoutes, RouteObject, useLocation } from "react-router";

import { LANG_SEGMENT, routes } from "../routes";

export const useCurrentPath = () => {
  const location = useLocation();

  const matchedRoutes =
    matchRoutes(routes[0].children as RouteObject[], location) ?? [];

  return matchedRoutes[0].route.path?.replace(LANG_SEGMENT, "");
};
